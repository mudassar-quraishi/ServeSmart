package com.servesmart.order.dto;

import lombok.Data;

@Data
public class CancelOrderRequest {
    private String reasonCode;
    private String notes;
}
