package com.servesmart.report.repository;

import com.servesmart.report.entity.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics, Long> {
    Optional<Analytics> findByReportTypeAndReportDate(String reportType, LocalDate reportDate);
}
