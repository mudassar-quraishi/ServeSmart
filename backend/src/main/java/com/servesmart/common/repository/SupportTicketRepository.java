package com.servesmart.common.repository;

import com.servesmart.common.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
    List<SupportTicket> findByStatus(SupportTicket.TicketStatus status);
    List<SupportTicket> findByAssignedToIdOrderByCreatedAtDesc(Long userId);
}
