package com.servesmart.kitchen.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class KitchenQueueResponse {
    private List<KitchenOrderItem> items;

    @Data
    @Builder
    public static class KitchenOrderItem {
        private Long orderItemId;
        private Long orderId;
        private String tableNumber;
        private Long menuItemId;
        private String menuItemName;
        private Integer quantity;
        private String status;
        private Long assignedChefId;
        private LocalDateTime createdAt;
    }
}
