package com.servesmart.menu.repository;

import com.servesmart.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategoryId(Long categoryId);
    List<MenuItem> findByIsAvailable(Boolean isAvailable);
    List<MenuItem> findByCategoryIdAndIsAvailable(Long categoryId, Boolean isAvailable);
}
