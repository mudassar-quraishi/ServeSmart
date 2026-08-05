package com.servesmart.kitchen.service;

import com.servesmart.auth.entity.User;
import com.servesmart.auth.repository.UserRepository;
import com.servesmart.employee.entity.Employee;
import com.servesmart.employee.repository.EmployeeRepository;
import com.servesmart.inventory.dto.AvailabilityResponse;
import com.servesmart.inventory.service.InventoryService;
import com.servesmart.kitchen.dto.KitchenQueueResponse;
import com.servesmart.menu.service.MenuService;
import com.servesmart.order.entity.Order;
import com.servesmart.order.entity.OrderItem;
import com.servesmart.order.repository.OrderItemRepository;
import com.servesmart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class KitchenService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final InventoryService inventoryService;
    private final MenuService menuService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public KitchenService(OrderRepository orderRepository,
                          OrderItemRepository orderItemRepository,
                          InventoryService inventoryService,
                          MenuService menuService,
                          UserRepository userRepository,
                          EmployeeRepository employeeRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.inventoryService = inventoryService;
        this.menuService = menuService;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
    }

    public KitchenQueueResponse getQueue(String chefUsername) {
        User user = userRepository.findByUsername(chefUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + chefUsername));
        Employee chef = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Employee not found for user: " + chefUsername));

        // Get all orders in ACCEPTED or PREPARING status
        List<Order> activeOrders = new ArrayList<>();
        activeOrders.addAll(orderRepository.findByStatus("ACCEPTED"));
        activeOrders.addAll(orderRepository.findByStatus("PREPARING"));

        List<KitchenQueueResponse.KitchenOrderItem> items = new ArrayList<>();
        for (Order order : activeOrders) {
            for (OrderItem oi : order.getItems()) {
                // Show items assigned to this chef, or unassigned with PENDING/PREPARING status
                if (oi.getAssignedChefId() == null || oi.getAssignedChefId().equals(chef.getId())) {
                    if ("PENDING".equals(oi.getStatus()) || "PREPARING".equals(oi.getStatus())) {
                        String menuItemName;
                        try {
                            menuItemName = menuService.getItemById(oi.getMenuItemId()).getName();
                        } catch (Exception e) {
                            menuItemName = "Item #" + oi.getMenuItemId();
                        }

                        items.add(KitchenQueueResponse.KitchenOrderItem.builder()
                                .orderItemId(oi.getId())
                                .orderId(order.getId())
                                .tableNumber(order.getTable() != null ? order.getTable().getTableNumber() : "Takeaway")
                                .menuItemId(oi.getMenuItemId())
                                .menuItemName(menuItemName)
                                .quantity(oi.getQuantity())
                                .status(oi.getStatus())
                                .assignedChefId(oi.getAssignedChefId())
                                .createdAt(oi.getCreatedAt())
                                .build());
                    }
                }
            }
        }

        return KitchenQueueResponse.builder().items(items).build();
    }

    @Transactional
    public OrderItem acceptItem(Long orderItemId, String chefUsername) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found: " + orderItemId));
        User user = userRepository.findByUsername(chefUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + chefUsername));
        Employee chef = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Employee not found for user: " + chefUsername));

        item.setAssignedChefId(chef.getId());
        return orderItemRepository.save(item);
    }

    @Transactional
    public OrderItem startItem(Long orderItemId, String chefUsername) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found: " + orderItemId));
        item.setStatus("PREPARING");

        // Also move the parent order to PREPARING if it's still ACCEPTED
        Order order = item.getOrder();
        if ("ACCEPTED".equals(order.getStatus())) {
            order.setStatus("PREPARING");
            orderRepository.save(order);
        }

        return orderItemRepository.save(item);
    }

    @Transactional
    public OrderItem readyItem(Long orderItemId) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found: " + orderItemId));
        item.setStatus("READY");

        // If all items in the order are READY, mark order as READY
        Order order = item.getOrder();
        boolean allReady = order.getItems().stream()
                .allMatch(oi -> "READY".equals(oi.getStatus()) || "SERVED".equals(oi.getStatus()));
        if (allReady) {
            order.setStatus("READY");
            orderRepository.save(order);
        }

        return orderItemRepository.save(item);
    }

    /**
     * Chef flags an ingredient as unavailable.
     * Calls InventoryService internally to check availability.
     */
    public AvailabilityResponse ingredientUnavailable(Long orderItemId) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found: " + orderItemId));
        return inventoryService.checkAvailability(item.getMenuItemId());
    }
}
