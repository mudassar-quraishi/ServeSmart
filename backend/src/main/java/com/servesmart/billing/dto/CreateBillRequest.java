package com.servesmart.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateBillRequest {
    private Long orderId;
    private BigDecimal discountAmount;
    private List<SplitEntry> split;  // null = single bill

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SplitEntry {
        private BigDecimal amount;
    }
}
