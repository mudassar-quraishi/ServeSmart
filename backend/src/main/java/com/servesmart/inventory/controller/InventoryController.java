package com.servesmart.inventory.controller;

import com.servesmart.inventory.dto.AvailabilityResponse;
import com.servesmart.inventory.dto.StockAdjustmentRequest;
import com.servesmart.inventory.entity.InventoryItem;
import com.servesmart.inventory.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<InventoryItem>> list() {
        return ResponseEntity.ok(inventoryService.listAll());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryItem>> lowStock() {
        return ResponseEntity.ok(inventoryService.getLowStock());
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<InventoryItem>> expiring(@RequestParam(defaultValue = "2") int withinDays) {
        return ResponseEntity.ok(inventoryService.getExpiring(withinDays));
    }

    @PostMapping("/{ingredientId}/stock-in")
    public ResponseEntity<InventoryItem> stockIn(
            @PathVariable Long ingredientId,
            @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.stockIn(ingredientId, request));
    }

    @PostMapping("/{ingredientId}/stock-out")
    public ResponseEntity<InventoryItem> stockOut(
            @PathVariable Long ingredientId,
            @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.stockOut(ingredientId, request));
    }

    @GetMapping("/check-availability")
    public ResponseEntity<AvailabilityResponse> checkAvailability(@RequestParam Long menuItemId) {
        return ResponseEntity.ok(inventoryService.checkAvailability(menuItemId));
    }
}
