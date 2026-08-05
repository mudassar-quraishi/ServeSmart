package com.servesmart.menu.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateMenuItemRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String gstSlab;
    private Boolean isAvailable;
    private Long categoryId;
}
