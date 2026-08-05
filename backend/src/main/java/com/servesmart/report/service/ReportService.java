package com.servesmart.report.service;

import com.servesmart.billing.entity.Bill;
import com.servesmart.billing.repository.BillRepository;
import com.servesmart.inventory.entity.InventoryItem;
import com.servesmart.inventory.repository.InventoryRepository;
import com.servesmart.order.entity.Order;
import com.servesmart.order.entity.OrderItem;
import com.servesmart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final OrderRepository orderRepository;
    private final BillRepository billRepository;
    private final InventoryRepository inventoryRepository;

    public ReportService(OrderRepository orderRepository,
                         BillRepository billRepository,
                         InventoryRepository inventoryRepository) {
        this.orderRepository = orderRepository;
        this.billRepository = billRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public Map<String, Object> getDailySales(LocalDate date) {
        List<Order> allOrders = orderRepository.findAll();
        List<Order> dailyOrders = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().equals(date))
                .toList();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        int orderCount = dailyOrders.size();
        int completedCount = 0;

        for (Order order : dailyOrders) {
            if ("COMPLETED".equals(order.getStatus()) || "SERVED".equals(order.getStatus()) || "BILLED".equals(order.getStatus()) || "SETTLED".equals(order.getStatus())) {
                completedCount++;
                for (OrderItem item : order.getItems()) {
                    totalRevenue = totalRevenue.add(
                            item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("date", date.toString());
        result.put("totalOrders", orderCount);
        result.put("completedOrders", completedCount);
        result.put("totalRevenue", totalRevenue);
        return result;
    }

    public Map<String, Object> getMonthlySales(String month) {
        // month format: "2026-07"
        LocalDate startOfMonth = LocalDate.parse(month + "-01");
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("month", month);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalOrders = 0;

        for (int day = 1; day <= endOfMonth.getDayOfMonth(); day++) {
            LocalDate date = startOfMonth.withDayOfMonth(day);
            Map<String, Object> dailyData = getDailySales(date);
            totalRevenue = totalRevenue.add((BigDecimal) dailyData.get("totalRevenue"));
            totalOrders += (int) dailyData.get("totalOrders");
        }

        result.put("totalOrders", totalOrders);
        result.put("totalRevenue", totalRevenue);
        return result;
    }

    public Map<String, Object> getInventoryReport() {
        List<InventoryItem> items = inventoryRepository.findAll();
        List<Map<String, Object>> itemList = new ArrayList<>();
        for (InventoryItem item : items) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("ingredientId", item.getIngredient().getId());
            map.put("ingredientName", item.getIngredient().getName());
            map.put("currentStock", item.getCurrentStock());
            map.put("reorderThreshold", item.getReorderThreshold());
            map.put("unit", item.getIngredient().getBaseUnit().name());
            map.put("expiryDate", item.getExpiryDate());
            map.put("lowStock", item.getCurrentStock().compareTo(item.getReorderThreshold()) <= 0);
            itemList.add(map);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalIngredients", items.size());
        result.put("lowStockCount", itemList.stream().filter(m -> (boolean) m.get("lowStock")).count());
        result.put("items", itemList);
        return result;
    }

    public List<Map<String, Object>> getTopItems(int limit, LocalDate from, LocalDate to) {
        List<Order> allOrders = orderRepository.findAll();

        // Count quantities per menu item across the date range
        Map<Long, Integer> itemCounts = new HashMap<>();
        for (Order order : allOrders) {
            if (order.getCreatedAt() == null) continue;
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            if ((from == null || !orderDate.isBefore(from)) && (to == null || !orderDate.isAfter(to))) {
                for (OrderItem item : order.getItems()) {
                    itemCounts.merge(item.getMenuItemId(), item.getQuantity(), Integer::sum);
                }
            }
        }

        return itemCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("menuItemId", entry.getKey());
                    map.put("totalQuantity", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getChefPerformance(LocalDate from, LocalDate to) {
        List<Order> allOrders = orderRepository.findAll();

        Map<Long, List<OrderItem>> chefItems = new HashMap<>();
        for (Order order : allOrders) {
            if (order.getCreatedAt() == null) continue;
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            if ((from == null || !orderDate.isBefore(from)) && (to == null || !orderDate.isAfter(to))) {
                for (OrderItem item : order.getItems()) {
                    if (item.getAssignedChefId() != null) {
                        chefItems.computeIfAbsent(item.getAssignedChefId(), k -> new ArrayList<>()).add(item);
                    }
                }
            }
        }

        return chefItems.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("chefId", entry.getKey());
                    map.put("itemsCompleted", entry.getValue().size());
                    map.put("totalQuantity", entry.getValue().stream().mapToInt(OrderItem::getQuantity).sum());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
