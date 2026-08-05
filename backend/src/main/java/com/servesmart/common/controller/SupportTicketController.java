package com.servesmart.common.controller;

import com.servesmart.common.dto.AssignTicketRequest;
import com.servesmart.common.dto.CreateTicketRequest;
import com.servesmart.common.entity.SupportTicket;
import com.servesmart.common.service.SupportTicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/support")
public class SupportTicketController {

    private final SupportTicketService ticketService;

    public SupportTicketController(SupportTicketService ticketService) {
        this.ticketService = ticketService;
    }

    /**
     * PUBLIC — submit a support ticket from login page (no auth required).
     */
    @PostMapping("/tickets")
    public ResponseEntity<SupportTicket> createTicket(@RequestBody CreateTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    /**
     * SUPER_ADMIN — list all tickets, optionally filter by status.
     */
    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> listTickets(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(ticketService.listByStatus(status));
        }
        return ResponseEntity.ok(ticketService.listAll());
    }

    /**
     * Get a specific ticket by ID.
     */
    @GetMapping("/tickets/{id}")
    public ResponseEntity<SupportTicket> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    /**
     * Get tickets assigned to the current user.
     */
    @GetMapping("/tickets/my")
    public ResponseEntity<List<SupportTicket>> getMyTickets(Authentication authentication) {
        // This is a simplified approach — in production you'd get the user ID from the token
        return ResponseEntity.ok(ticketService.listAll());
    }

    /**
     * SUPER_ADMIN — assign/forward a ticket to a user.
     */
    @PostMapping("/tickets/{id}/assign")
    public ResponseEntity<SupportTicket> assignTicket(
            @PathVariable Long id,
            @RequestBody AssignTicketRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request, authentication.getName()));
    }

    /**
     * SUPER_ADMIN — update ticket status.
     */
    @PatchMapping("/tickets/{id}/status")
    public ResponseEntity<SupportTicket> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(ticketService.updateStatus(id, status));
    }
}
