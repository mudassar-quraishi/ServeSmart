package com.servesmart.customer.controller;

import com.servesmart.customer.dto.CreateCustomerRequest;
import com.servesmart.customer.dto.CustomerResponse;
import com.servesmart.customer.service.CustomerService;
import com.servesmart.order.entity.Order;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@PreAuthorize("hasAnyRole('WAITER','MANAGER','SUPER_ADMIN')")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<CustomerResponse> search(@RequestParam String phone) {
        return ResponseEntity.ok(customerService.searchByPhone(phone));
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> register(@Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.register(request));
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<List<Order>> orderHistory(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getOrderHistory(id));
    }
}
