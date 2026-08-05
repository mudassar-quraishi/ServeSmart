package com.servesmart.billing.controller;

import com.servesmart.billing.dto.CreateBillRequest;
import com.servesmart.billing.dto.RecordPaymentRequest;
import com.servesmart.billing.entity.Bill;
import com.servesmart.billing.entity.Payment;
import com.servesmart.billing.service.BillingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bills")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping
    public ResponseEntity<List<Bill>> createBill(@RequestBody CreateBillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billingService.createBill(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBill(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getBill(id));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<Payment> recordPayment(@PathVariable Long id, @RequestBody RecordPaymentRequest request) {
        return ResponseEntity.ok(billingService.recordPayment(id, request));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<String> getReceipt(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getReceipt(id));
    }
}
