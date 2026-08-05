package com.servesmart.supplier.controller;

import com.servesmart.supplier.dto.CreatePurchaseOrderRequest;
import com.servesmart.supplier.dto.CreateSupplierRequest;
import com.servesmart.supplier.entity.PurchaseOrder;
import com.servesmart.supplier.entity.Supplier;
import com.servesmart.supplier.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@PreAuthorize("hasAnyRole('MANAGER','SUPER_ADMIN')")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<Supplier>> listSuppliers() {
        return ResponseEntity.ok(supplierService.listSuppliers());
    }

    @PostMapping("/suppliers")
    public ResponseEntity<Supplier> addSupplier(@Valid @RequestBody CreateSupplierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.addSupplier(request));
    }

    @PostMapping("/purchase-orders")
    public ResponseEntity<PurchaseOrder> createPO(@RequestBody CreatePurchaseOrderRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supplierService.createPurchaseOrder(request, auth.getName()));
    }

    @GetMapping("/purchase-orders")
    public ResponseEntity<List<PurchaseOrder>> listPOs(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(supplierService.listPurchaseOrders(supplierId, status));
    }

    @PostMapping("/purchase-orders/{id}/receive")
    public ResponseEntity<PurchaseOrder> receivePO(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.receivePurchaseOrder(id));
    }
}
