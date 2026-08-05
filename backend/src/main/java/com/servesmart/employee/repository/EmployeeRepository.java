package com.servesmart.employee.repository;

import com.servesmart.employee.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Page<Employee> findByIsActiveTrue(Pageable pageable);
    Optional<Employee> findByUserId(Long userId);
}
