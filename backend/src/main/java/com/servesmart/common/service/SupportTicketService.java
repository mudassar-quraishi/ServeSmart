package com.servesmart.common.service;

import com.servesmart.auth.entity.User;
import com.servesmart.auth.repository.UserRepository;
import com.servesmart.common.dto.AssignTicketRequest;
import com.servesmart.common.dto.CreateTicketRequest;
import com.servesmart.common.entity.SupportTicket;
import com.servesmart.common.repository.SupportTicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;

    public SupportTicketService(SupportTicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    /**
     * Public endpoint — anyone can submit a support ticket from the login page.
     */
    @Transactional
    public SupportTicket createTicket(CreateTicketRequest request) {
        SupportTicket ticket = new SupportTicket();
        ticket.setName(request.getName());
        ticket.setEmail(request.getEmail());
        ticket.setSubject(request.getSubject());
        ticket.setMessage(request.getMessage());
        ticket.setStatus(SupportTicket.TicketStatus.OPEN);
        ticket.setPriority(SupportTicket.TicketPriority.MEDIUM);
        return ticketRepository.save(ticket);
    }

    /**
     * SUPER_ADMIN: list all tickets.
     */
    public List<SupportTicket> listAll() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * SUPER_ADMIN: list tickets filtered by status.
     */
    public List<SupportTicket> listByStatus(String status) {
        return ticketRepository.findByStatus(SupportTicket.TicketStatus.valueOf(status.toUpperCase()));
    }

    /**
     * Get ticket by ID.
     */
    public SupportTicket getTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
    }

    /**
     * Get tickets assigned to a specific user.
     */
    public List<SupportTicket> getMyTickets(Long userId) {
        return ticketRepository.findByAssignedToIdOrderByCreatedAtDesc(userId);
    }

    /**
     * SUPER_ADMIN: assign/forward a ticket to a user.
     */
    @Transactional
    public SupportTicket assignTicket(Long ticketId, AssignTicketRequest request, String adminUsername) {
        SupportTicket ticket = getTicket(ticketId);
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        User assignee = userRepository.findById(request.getAssignToUserId())
                .orElseThrow(() -> new RuntimeException("Assignee user not found: " + request.getAssignToUserId()));

        ticket.setAssignedTo(assignee);
        ticket.setAssignedBy(admin);
        ticket.setStatus(SupportTicket.TicketStatus.ASSIGNED);

        if (request.getPriority() != null) {
            ticket.setPriority(SupportTicket.TicketPriority.valueOf(request.getPriority().toUpperCase()));
        }
        if (request.getAdminNotes() != null) {
            ticket.setAdminNotes(request.getAdminNotes());
        }

        return ticketRepository.save(ticket);
    }

    /**
     * SUPER_ADMIN: update ticket status.
     */
    @Transactional
    public SupportTicket updateStatus(Long ticketId, String newStatus) {
        SupportTicket ticket = getTicket(ticketId);
        ticket.setStatus(SupportTicket.TicketStatus.valueOf(newStatus.toUpperCase()));
        return ticketRepository.save(ticket);
    }
}
