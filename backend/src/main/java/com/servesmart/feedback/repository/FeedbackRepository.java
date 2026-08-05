package com.servesmart.feedback.repository;

import com.servesmart.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    @Query("SELECT f FROM Feedback f WHERE (:from IS NULL OR f.createdAt >= :from) AND (:to IS NULL OR f.createdAt <= :to)")
    List<Feedback> findByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
