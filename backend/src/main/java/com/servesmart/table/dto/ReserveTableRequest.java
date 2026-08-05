package com.servesmart.table.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReserveTableRequest {
    private Long customerId;
    private LocalDateTime reservedFrom;
    private LocalDateTime reservedTo;
}
