package com.servesmart.kitchen.controller;

import com.servesmart.inventory.dto.AvailabilityResponse;
import com.servesmart.kitchen.dto.KitchenQueueResponse;
import com.servesmart.kitchen.service.KitchenService;
import com.servesmart.order.entity.OrderItem;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/kitchen")
@PreAuthorize("hasAnyRole('CHEF','MANAGER','SUPER_ADMIN')")
public class KitchenController {

    private final KitchenService kitchenService;

    public KitchenController(KitchenService kitchenService) {
        this.kitchenService = kitchenService;
    }

    @GetMapping("/queue")
    public ResponseEntity<KitchenQueueResponse> getQueue(Authentication authentication) {
        return ResponseEntity.ok(kitchenService.getQueue(authentication.getName()));
    }

    @PostMapping("/items/{orderItemId}/accept")
    public ResponseEntity<OrderItem> acceptItem(@PathVariable Long orderItemId, Authentication authentication) {
        return ResponseEntity.ok(kitchenService.acceptItem(orderItemId, authentication.getName()));
    }

    @PostMapping("/items/{orderItemId}/start")
    public ResponseEntity<OrderItem> startItem(@PathVariable Long orderItemId, Authentication authentication) {
        return ResponseEntity.ok(kitchenService.startItem(orderItemId, authentication.getName()));
    }

    @PostMapping("/items/{orderItemId}/ready")
    public ResponseEntity<OrderItem> readyItem(@PathVariable Long orderItemId) {
        return ResponseEntity.ok(kitchenService.readyItem(orderItemId));
    }

    @PostMapping("/items/{orderItemId}/ingredient-unavailable")
    public ResponseEntity<AvailabilityResponse> ingredientUnavailable(@PathVariable Long orderItemId) {
        return ResponseEntity.ok(kitchenService.ingredientUnavailable(orderItemId));
    }
}
