package com.servesmart.customer.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private LocalDateTime createdAt;
}
