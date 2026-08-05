package com.servesmart.menu.service;

import com.servesmart.menu.dto.*;
import com.servesmart.menu.entity.MenuCategory;
import com.servesmart.menu.entity.MenuItem;
import com.servesmart.menu.repository.MenuCategoryRepository;
import com.servesmart.menu.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MenuService {

    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository itemRepository;

    public MenuService(MenuCategoryRepository categoryRepository, MenuItemRepository itemRepository) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
    }

    // ── Categories ──

    public List<MenuCategory> listCategories() {
        return categoryRepository.findAll();
    }

    public MenuCategory createCategory(CreateCategoryRequest request) {
        MenuCategory category = new MenuCategory();
        category.setName(request.getName());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        return categoryRepository.save(category);
    }

    // ── Items ──

    public List<MenuItemResponse> listItems(Long categoryId, Boolean available) {
        List<MenuItem> items;
        if (categoryId != null && available != null) {
            items = itemRepository.findByCategoryIdAndIsAvailable(categoryId, available);
        } else if (categoryId != null) {
            items = itemRepository.findByCategoryId(categoryId);
        } else if (available != null) {
            items = itemRepository.findByIsAvailable(available);
        } else {
            items = itemRepository.findAll();
        }
        return items.stream().map(this::toResponse).toList();
    }

    @Transactional
    public MenuItemResponse createItem(CreateMenuItemRequest request) {
        MenuCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryId()));

        MenuItem item = new MenuItem();
        item.setCategory(category);
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setGstSlab(MenuItem.GstSlab.valueOf(request.getGstSlab().toUpperCase()));
        item.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);
        return toResponse(itemRepository.save(item));
    }

    @Transactional
    public MenuItemResponse updateItem(Long id, UpdateMenuItemRequest request) {
        MenuItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));

        if (request.getName() != null) item.setName(request.getName());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getPrice() != null) item.setPrice(request.getPrice());
        if (request.getGstSlab() != null) item.setGstSlab(MenuItem.GstSlab.valueOf(request.getGstSlab().toUpperCase()));
        if (request.getIsAvailable() != null) item.setIsAvailable(request.getIsAvailable());
        if (request.getCategoryId() != null) {
            MenuCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found: " + request.getCategoryId()));
            item.setCategory(category);
        }

        return toResponse(itemRepository.save(item));
    }

    /**
     * Cross-module method: used by OrderService to snapshot price at order time.
     */
    public MenuItemSnapshot getItemPriceAndAvailability(Long menuItemId) {
        MenuItem item = itemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + menuItemId));
        return MenuItemSnapshot.builder()
                .price(item.getPrice())
                .gstSlab(item.getGstSlab().name())
                .isAvailable(item.getIsAvailable())
                .build();
    }

    public MenuItem getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));
    }

    private MenuItemResponse toResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getName())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .gstSlab(item.getGstSlab().name())
                .imageUrl(item.getImageUrl())
                .isAvailable(item.getIsAvailable())
                .build();
    }
}
