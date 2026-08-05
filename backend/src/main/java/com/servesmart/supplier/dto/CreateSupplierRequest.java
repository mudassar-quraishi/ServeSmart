package com.servesmart.supplier.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSupplierRequest {
    @NotBlank(message = "Supplier name is required")
    private String name;
    private String contactPhone;
    private String email;
    private String address;
}
