package com.servesmart.employee.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateEmployeeRequest {
    private String fullName;
    private String phone;
    private String specialization;
    private LocalDate hireDate;
}
