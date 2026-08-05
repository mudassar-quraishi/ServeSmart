package com.servesmart.inventory.repository;

import com.servesmart.inventory.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    Optional<InventoryItem> findByIngredientId(Long ingredientId);

    @Query("SELECT i FROM InventoryItem i WHERE i.currentStock <= i.reorderThreshold")
    List<InventoryItem> findLowStock();

    @Query("SELECT i FROM InventoryItem i WHERE i.expiryDate IS NOT NULL AND i.expiryDate <= :threshold")
    List<InventoryItem> findExpiringSoon(@Param("threshold") LocalDate threshold);
}
