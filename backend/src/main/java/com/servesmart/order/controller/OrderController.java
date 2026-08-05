package com.servesmart.order.controller;

import com.servesmart.order.dto.*;
import com.servesmart.order.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(request, authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> listOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long tableId) {
        return ResponseEntity.ok(orderService.listOrders(status, tableId));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<OrderResponse> addItems(
            @PathVariable Long id,
            @RequestBody AddItemsRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.addItems(id, request, authentication.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody ChangeStatusRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.changeStatus(id, request.getNewStatus(), authentication.getName()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            @RequestBody CancelOrderRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.cancelOrder(id, request, authentication.getName()));
    }
}
