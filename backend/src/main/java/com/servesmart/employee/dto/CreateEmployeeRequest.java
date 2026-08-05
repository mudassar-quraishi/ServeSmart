package com.servesmart.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateEmployeeRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;

    private String email;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Role name is required")
    private String roleName;

    private String specialization;

    private LocalDate hireDate;
}
