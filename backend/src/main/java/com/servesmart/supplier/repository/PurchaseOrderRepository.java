package com.servesmart.supplier.repository;

import com.servesmart.supplier.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findBySupplierId(Long supplierId);
    List<PurchaseOrder> findByStatus(PurchaseOrder.PurchaseOrderStatus status);
    List<PurchaseOrder> findBySupplierIdAndStatus(Long supplierId, PurchaseOrder.PurchaseOrderStatus status);
}
