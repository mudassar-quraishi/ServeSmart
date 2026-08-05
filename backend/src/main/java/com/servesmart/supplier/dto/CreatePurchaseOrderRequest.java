package com.servesmart.supplier.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreatePurchaseOrderRequest {
    private Long supplierId;
    private LocalDate expectedDeliveryDate;
    private List<POItemRequest> items;

    @Data
    public static class POItemRequest {
        private Long ingredientId;
        private BigDecimal quantity;
        private String unit;
        private BigDecimal unitPrice;
    }
}
