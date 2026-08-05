package com.servesmart.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecordPaymentRequest {
    private String paymentMode;  // CASH, CARD, UPI
    private BigDecimal amount;
}
