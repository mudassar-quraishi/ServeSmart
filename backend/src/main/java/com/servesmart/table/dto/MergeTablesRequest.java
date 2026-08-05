package com.servesmart.table.dto;

import lombok.Data;
import java.util.List;

@Data
public class MergeTablesRequest {
    private List<Long> tableIds;
    private Long primaryTableId;
}
