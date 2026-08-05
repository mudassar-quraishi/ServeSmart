package com.servesmart.inventory.service;

import com.servesmart.inventory.dto.AvailabilityResponse;
import com.servesmart.inventory.dto.StockAdjustmentRequest;
import com.servesmart.inventory.entity.Ingredient;
import com.servesmart.inventory.entity.InventoryItem;
import com.servesmart.inventory.entity.Recipe;
import com.servesmart.inventory.repository.InventoryRepository;
import com.servesmart.inventory.repository.RecipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final RecipeRepository recipeRepository;

    public InventoryService(InventoryRepository inventoryRepository, RecipeRepository recipeRepository) {
        this.inventoryRepository = inventoryRepository;
        this.recipeRepository = recipeRepository;
    }

    public List<InventoryItem> listAll() {
        return inventoryRepository.findAll();
    }

    public List<InventoryItem> getLowStock() {
        return inventoryRepository.findLowStock();
    }

    public List<InventoryItem> getExpiring(int withinDays) {
        LocalDate threshold = LocalDate.now().plusDays(withinDays);
        return inventoryRepository.findExpiringSoon(threshold);
    }

    @Transactional
    public InventoryItem stockIn(Long ingredientId, StockAdjustmentRequest request) {
        InventoryItem item = inventoryRepository.findByIngredientId(ingredientId)
                .orElseThrow(() -> new RuntimeException("Inventory record not found for ingredient: " + ingredientId));

        BigDecimal convertedQty = convertToBaseUnit(request.getQuantity(), request.getUnit(), item.getIngredient().getBaseUnit());
        item.setCurrentStock(item.getCurrentStock().add(convertedQty));
        return inventoryRepository.save(item);
    }

    @Transactional
    public InventoryItem stockOut(Long ingredientId, StockAdjustmentRequest request) {
        InventoryItem item = inventoryRepository.findByIngredientId(ingredientId)
                .orElseThrow(() -> new RuntimeException("Inventory record not found for ingredient: " + ingredientId));

        BigDecimal convertedQty = convertToBaseUnit(request.getQuantity(), request.getUnit(), item.getIngredient().getBaseUnit());

        if (item.getCurrentStock().compareTo(convertedQty) < 0) {
            throw new RuntimeException("Insufficient stock. Available: " + item.getCurrentStock() + " " + item.getIngredient().getBaseUnit());
        }

        item.setCurrentStock(item.getCurrentStock().subtract(convertedQty));
        return inventoryRepository.save(item);
    }

    /**
     * Check if a menu item can currently be made based on its recipe ingredients.
     * Used internally by the Kitchen module (Prashant's module).
     */
    public AvailabilityResponse checkAvailability(Long menuItemId) {
        List<Recipe> recipes = recipeRepository.findByMenuItemId(menuItemId);
        List<String> missing = new ArrayList<>();

        for (Recipe recipe : recipes) {
            InventoryItem inv = inventoryRepository.findByIngredientId(recipe.getIngredient().getId()).orElse(null);
            if (inv == null || inv.getCurrentStock().compareTo(recipe.getQuantityRequired()) < 0) {
                missing.add(recipe.getIngredient().getName());
            }
        }

        return AvailabilityResponse.builder()
                .menuItemId(menuItemId)
                .available(missing.isEmpty())
                .missingIngredients(missing)
                .build();
    }

    /**
     * Converts a quantity from a given unit to the ingredient's base unit.
     * Supports: KG→GRAM, LITRE→ML, and passthrough for matching units.
     */
    private BigDecimal convertToBaseUnit(BigDecimal quantity, String inputUnit, Ingredient.BaseUnit baseUnit) {
        String upper = inputUnit.toUpperCase();

        if (upper.equals(baseUnit.name())) {
            return quantity;
        }

        // Weight conversions
        if (baseUnit == Ingredient.BaseUnit.GRAM && upper.equals("KG")) {
            return quantity.multiply(BigDecimal.valueOf(1000));
        }

        // Volume conversions
        if (baseUnit == Ingredient.BaseUnit.ML && upper.equals("LITRE")) {
            return quantity.multiply(BigDecimal.valueOf(1000));
        }

        throw new RuntimeException("Cannot convert " + inputUnit + " to " + baseUnit);
    }
}
