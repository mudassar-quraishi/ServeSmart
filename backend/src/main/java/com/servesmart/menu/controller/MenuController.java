package com.servesmart.menu.controller;

import com.servesmart.menu.dto.*;
import com.servesmart.menu.entity.MenuCategory;
import com.servesmart.menu.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<MenuCategory>> listCategories() {
        return ResponseEntity.ok(menuService.listCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('MANAGER','SUPER_ADMIN')")
    public ResponseEntity<MenuCategory> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.createCategory(request));
    }

    @GetMapping("/items")
    public ResponseEntity<List<MenuItemResponse>> listItems(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean available) {
        return ResponseEntity.ok(menuService.listItems(categoryId, available));
    }

    @PostMapping("/items")
    @PreAuthorize("hasAnyRole('MANAGER','SUPER_ADMIN')")
    public ResponseEntity<MenuItemResponse> createItem(@Valid @RequestBody CreateMenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.createItem(request));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','SUPER_ADMIN')")
    public ResponseEntity<MenuItemResponse> updateItem(@PathVariable Long id, @RequestBody UpdateMenuItemRequest request) {
        return ResponseEntity.ok(menuService.updateItem(id, request));
    }
}
