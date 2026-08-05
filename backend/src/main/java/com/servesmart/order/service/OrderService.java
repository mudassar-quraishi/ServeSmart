package com.servesmart.order.service;

import com.servesmart.auth.entity.User;
import com.servesmart.auth.repository.UserRepository;
import com.servesmart.common.entity.Customer;
import com.servesmart.common.entity.RestaurantTable;
import com.servesmart.menu.dto.MenuItemSnapshot;
import com.servesmart.menu.service.MenuService;
import com.servesmart.order.dto.*;
import com.servesmart.order.entity.Order;
import com.servesmart.order.entity.OrderItem;
import com.servesmart.order.repository.OrderItemRepository;
import com.servesmart.order.repository.OrderRepository;
import com.servesmart.table.service.TableService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final MenuService menuService;
    private final TableService tableService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        UserRepository userRepository,
                        MenuService menuService,
                        TableService tableService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.menuService = menuService;
        this.tableService = tableService;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String waiterUsername) {
        User waiter = userRepository.findByUsername(waiterUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + waiterUsername));

        // Validate table status if a table is specified
        if (request.getTableId() != null) {
            tableService.validateTableStatus(request.getTableId());
        }

        Order order = new Order();
        if (request.getTableId() != null) {
            RestaurantTable table = new RestaurantTable();
            table.setId(request.getTableId());
            order.setTable(table);
        }
        if (request.getCustomerId() != null) {
            Customer customer = new Customer();
            customer.setId(request.getCustomerId());
            order.setCustomer(customer);
        }
        order.setWaiter(waiter);
        order.setStatus("NEW");

        if (request.getTableId() != null) {
            tableService.updateTableStatus(request.getTableId(), "OCCUPIED");
        }

        Order savedOrder = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            // Snapshot price from MenuService
            MenuItemSnapshot snapshot = menuService.getItemPriceAndAvailability(itemReq.getMenuItemId());
            if (!snapshot.getIsAvailable()) {
                throw new RuntimeException("Menu item " + itemReq.getMenuItemId() + " is not available");
            }

            OrderItem item = new OrderItem();
            item.setOrder(savedOrder);
            item.setMenuItemId(itemReq.getMenuItemId());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(snapshot.getPrice());
            item.setStatus("PENDING");
            item.setIsSubTicket(false);
            savedOrder.getItems().add(item);
            orderItemRepository.save(item);

            total = total.add(snapshot.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        return toResponse(savedOrder, total);
    }

    public OrderResponse getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        return toResponse(order, calculateTotal(order));
    }

    public List<OrderResponse> listOrders(String status, Long tableId) {
        List<Order> orders;
        if (status != null && tableId != null) {
            orders = orderRepository.findByStatusAndTableId(status, tableId);
        } else if (status != null) {
            orders = orderRepository.findByStatus(status);
        } else if (tableId != null) {
            orders = orderRepository.findByTableId(tableId);
        } else {
            orders = orderRepository.findAll();
        }
        return orders.stream().map(o -> toResponse(o, calculateTotal(o))).toList();
    }

    @Transactional
    public OrderResponse addItems(Long orderId, AddItemsRequest request, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        boolean isSubTicket = "PREPARING".equals(order.getStatus());

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            MenuItemSnapshot snapshot = menuService.getItemPriceAndAvailability(itemReq.getMenuItemId());
            if (!snapshot.getIsAvailable()) {
                throw new RuntimeException("Menu item " + itemReq.getMenuItemId() + " is not available");
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setMenuItemId(itemReq.getMenuItemId());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(snapshot.getPrice());
            item.setStatus("PENDING");
            item.setIsSubTicket(isSubTicket);
            order.getItems().add(item);
            orderItemRepository.save(item);
        }

        return toResponse(order, calculateTotal(order));
    }

    @Transactional
    public OrderResponse changeStatus(Long orderId, String newStatus, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // State machine validation
        String currentStatus = order.getStatus();
        boolean valid = switch (currentStatus) {
            case "NEW" -> "ACCEPTED".equals(newStatus) || "REJECTED".equals(newStatus);
            case "ACCEPTED" -> "PREPARING".equals(newStatus) || "CANCELLED".equals(newStatus);
            case "PREPARING" -> "READY".equals(newStatus) || "CANCELLED".equals(newStatus);
            case "READY" -> "SERVED".equals(newStatus);
            case "SERVED" -> "COMPLETED".equals(newStatus) || "BILLED".equals(newStatus);
            case "BILLED" -> "SETTLED".equals(newStatus);
            case "SETTLED" -> "COMPLETED".equals(newStatus);
            default -> false;
        };

        if (!valid) {
            throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + newStatus + " — CONFLICT");
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        if (order.getTable() != null && ("COMPLETED".equals(newStatus) || "CANCELLED".equals(newStatus) || "REJECTED".equals(newStatus))) {
            tableService.freeTable(order.getTable().getId());
        }
        return toResponse(order, calculateTotal(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, CancelOrderRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        if (!"MANAGER".equals(user.getRole().getName()) && !"SUPER_ADMIN".equals(user.getRole().getName())) {
            throw new RuntimeException("Only managers can cancel orders");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus("CANCELLED");
        order.setCancellationReason(request.getReasonCode() + (request.getNotes() != null ? ": " + request.getNotes() : ""));
        order.setCancelledBy(user);
        orderRepository.save(order);

        if (order.getTable() != null) {
            tableService.freeTable(order.getTable().getId());
        }
        return toResponse(order, calculateTotal(order));
    }

    private BigDecimal calculateTotal(Order order) {
        return order.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private OrderResponse toResponse(Order order, BigDecimal total) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItemId())
                        .menuItemName(getMenuItemName(item.getMenuItemId()))
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .status(item.getStatus())
                        .isSubTicket(item.getIsSubTicket())
                        .build())
                .toList();

        return OrderResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .total(total)
                .tableId(order.getTable() != null ? order.getTable().getId() : null)
                .tableNumber(order.getTable() != null ? order.getTable().getTableNumber() : null)
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .waiterUsername(order.getWaiter().getUsername())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }

    private String getMenuItemName(Long menuItemId) {
        try {
            return menuService.getItemById(menuItemId).getName();
        } catch (Exception e) {
            return "Item #" + menuItemId;
        }
    }
}
