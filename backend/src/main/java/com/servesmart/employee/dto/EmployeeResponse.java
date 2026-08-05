package com.servesmart.employee.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class EmployeeResponse {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String roleName;
    private String specialization;
    private LocalDate hireDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
