package com.servesmart.table.controller;

import com.servesmart.common.entity.RestaurantTable;
import com.servesmart.table.dto.CreateTableRequest;
import com.servesmart.table.dto.MergeTablesRequest;
import com.servesmart.table.dto.ReserveTableRequest;
import com.servesmart.table.entity.TableReservation;
import com.servesmart.table.service.TableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tables")
@PreAuthorize("hasAnyRole('WAITER','MANAGER','SUPER_ADMIN')")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantTable>> list() {
        return ResponseEntity.ok(tableService.listTables());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','SUPER_ADMIN')")
    public ResponseEntity<RestaurantTable> create(@Valid @RequestBody CreateTableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tableService.createTable(request));
    }

    @PostMapping("/{id}/reserve")
    public ResponseEntity<TableReservation> reserve(@PathVariable Long id, @RequestBody ReserveTableRequest request) {
        return ResponseEntity.ok(tableService.reserveTable(id, request));
    }

    @PostMapping("/{id}/free")
    public ResponseEntity<RestaurantTable> free(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.freeTable(id));
    }

    @PostMapping("/merge")
    public ResponseEntity<RestaurantTable> merge(@RequestBody MergeTablesRequest request) {
        return ResponseEntity.ok(tableService.mergeTables(request));
    }
}
