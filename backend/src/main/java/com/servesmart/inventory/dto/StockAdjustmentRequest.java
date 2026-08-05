package com.servesmart.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockAdjustmentRequest {
    private BigDecimal quantity;
    private String unit;  // e.g. "KG", "GRAM", "ML", "LITRE", "PIECE"
    private String note;
}
