package com.servesmart.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignTicketRequest {
    private Long assignToUserId;
    private String priority;    // LOW, MEDIUM, HIGH, URGENT
    private String adminNotes;
}
