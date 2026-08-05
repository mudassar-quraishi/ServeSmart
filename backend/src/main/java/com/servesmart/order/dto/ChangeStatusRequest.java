package com.servesmart.order.dto;

import lombok.Data;

@Data
public class ChangeStatusRequest {
    private String newStatus;
}
