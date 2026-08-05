package com.servesmart.order.repository;

import com.servesmart.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(String status);
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByTableId(Long tableId);
    List<Order> findByStatusAndTableId(String status, Long tableId);
}
