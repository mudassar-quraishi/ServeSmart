package com.servesmart.menu.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

/**
 * Cross-module snapshot used by OrderService to capture price at order time.
 */
@Data
@Builder
public class MenuItemSnapshot {
    private BigDecimal price;
    private String gstSlab;
    private Boolean isAvailable;
}
