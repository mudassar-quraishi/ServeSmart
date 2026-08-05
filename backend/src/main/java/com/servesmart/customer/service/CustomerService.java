package com.servesmart.customer.service;

import com.servesmart.common.entity.Customer;
import com.servesmart.customer.dto.CreateCustomerRequest;
import com.servesmart.customer.dto.CustomerResponse;
import com.servesmart.customer.repository.CustomerRepository;
import com.servesmart.order.entity.Order;
import com.servesmart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    public CustomerService(CustomerRepository customerRepository, OrderRepository orderRepository) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }

    public CustomerResponse searchByPhone(String phone) {
        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Customer not found with phone: " + phone));
        return toResponse(customer);
    }

    public CustomerResponse register(CreateCustomerRequest request) {
        if (customerRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Customer with phone " + request.getPhone() + " already exists — CONFLICT");
        }

        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        return toResponse(customerRepository.save(customer));
    }

    public List<Order> getOrderHistory(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException("Customer not found: " + customerId);
        }
        return orderRepository.findByCustomerId(customerId);
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId())
                .fullName(c.getFullName())
                .phone(c.getPhone())
                .email(c.getEmail())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
