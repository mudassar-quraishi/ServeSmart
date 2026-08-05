package com.servesmart.inventory.repository;

import com.servesmart.inventory.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByMenuItemId(Long menuItemId);
}
