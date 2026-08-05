package com.servesmart.employee.service;

import com.servesmart.auth.entity.Role;
import com.servesmart.auth.entity.User;
import com.servesmart.auth.repository.RoleRepository;
import com.servesmart.auth.repository.UserRepository;
import com.servesmart.employee.dto.*;
import com.servesmart.employee.entity.Employee;
import com.servesmart.employee.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<EmployeeResponse> list(Pageable pageable) {
        return employeeRepository.findByIsActiveTrue(pageable)
                .map(this::toResponse);
    }

    public EmployeeResponse getById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
        return toResponse(emp);
    }

    @Transactional
    public EmployeeResponse create(CreateEmployeeRequest request) {
        // Check username uniqueness
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }

        Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRoleName()));

        // Create User account
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail() != null ? request.getEmail() : request.getUsername() + "@servesmart.local");
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setIsActive(true);
        user = userRepository.save(user);

        // Create Employee record
        Employee employee = new Employee();
        employee.setUser(user);
        employee.setFullName(request.getFullName());
        employee.setPhone(request.getPhone());
        employee.setSpecialization(request.getSpecialization());
        employee.setHireDate(request.getHireDate());
        employee.setIsActive(true);
        employee = employeeRepository.save(employee);

        return toResponse(employee);
    }

    @Transactional
    public EmployeeResponse update(Long id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));

        if (request.getFullName() != null) employee.setFullName(request.getFullName());
        if (request.getPhone() != null) employee.setPhone(request.getPhone());
        if (request.getSpecialization() != null) employee.setSpecialization(request.getSpecialization());
        if (request.getHireDate() != null) employee.setHireDate(request.getHireDate());

        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public void softDelete(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
        employee.setIsActive(false);
        employee.getUser().setIsActive(false);
        employeeRepository.save(employee);
        userRepository.save(employee.getUser());
    }

    @Transactional
    public EmployeeResponse changeRole(Long id, ChangeRoleRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
        Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRoleName()));
        employee.getUser().setRole(role);
        userRepository.save(employee.getUser());
        return toResponse(employee);
    }

    private EmployeeResponse toResponse(Employee emp) {
        return EmployeeResponse.builder()
                .id(emp.getId())
                .userId(emp.getUser().getId())
                .username(emp.getUser().getUsername())
                .email(emp.getUser().getEmail())
                .fullName(emp.getFullName())
                .phone(emp.getPhone())
                .roleName(emp.getUser().getRole().getName())
                .specialization(emp.getSpecialization())
                .hireDate(emp.getHireDate())
                .isActive(emp.getIsActive())
                .createdAt(emp.getCreatedAt())
                .build();
    }
}
