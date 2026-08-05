package com.servesmart.table.service;

import com.servesmart.common.entity.Customer;
import com.servesmart.common.entity.RestaurantTable;
import com.servesmart.table.dto.CreateTableRequest;
import com.servesmart.table.dto.MergeTablesRequest;
import com.servesmart.table.dto.ReserveTableRequest;
import com.servesmart.table.entity.TableReservation;
import com.servesmart.table.repository.TableRepository;
import com.servesmart.table.repository.TableReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TableService {

    private final TableRepository tableRepository;
    private final TableReservationRepository reservationRepository;

    public TableService(TableRepository tableRepository, TableReservationRepository reservationRepository) {
        this.tableRepository = tableRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<RestaurantTable> listTables() {
        return tableRepository.findAll();
    }

    public RestaurantTable createTable(CreateTableRequest request) {
        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        table.setStatus("FREE");
        return tableRepository.save(table);
    }

    @Transactional
    public TableReservation reserveTable(Long tableId, ReserveTableRequest request) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found: " + tableId));

        // Check for overlapping reservations
        List<TableReservation> overlapping = reservationRepository.findOverlapping(
                tableId, request.getReservedFrom(), request.getReservedTo());
        if (!overlapping.isEmpty()) {
            throw new RuntimeException("overlapping reservation exists for table " + tableId + " — CONFLICT");
        }

        TableReservation reservation = new TableReservation();
        reservation.setTable(table);
        if (request.getCustomerId() != null) {
            Customer customer = new Customer();
            customer.setId(request.getCustomerId());
            reservation.setCustomer(customer);
        }
        reservation.setReservedFrom(request.getReservedFrom());
        reservation.setReservedTo(request.getReservedTo());

        table.setStatus("RESERVED");
        tableRepository.save(table);

        return reservationRepository.save(reservation);
    }

    @Transactional
    public RestaurantTable freeTable(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found: " + tableId));
        table.setStatus("FREE");
        table.setMergedWithTable(null);
        return tableRepository.save(table);
    }

    @Transactional
    public RestaurantTable mergeTables(MergeTablesRequest request) {
        RestaurantTable primary = tableRepository.findById(request.getPrimaryTableId())
                .orElseThrow(() -> new RuntimeException("Primary table not found: " + request.getPrimaryTableId()));

        for (Long tid : request.getTableIds()) {
            if (!tid.equals(request.getPrimaryTableId())) {
                RestaurantTable secondary = tableRepository.findById(tid)
                        .orElseThrow(() -> new RuntimeException("Table not found: " + tid));
                secondary.setMergedWithTable(primary);
                secondary.setStatus("OCCUPIED");
                tableRepository.save(secondary);
            }
        }
        primary.setStatus("OCCUPIED");
        return tableRepository.save(primary);
    }

    /**
     * Cross-module method: used by OrderService to validate table status before order creation.
     * Returns true if the table is FREE or RESERVED (for the current booking).
     * Throws RuntimeException if the table cannot accept a new order.
     */
    public boolean validateTableStatus(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found: " + tableId));
        String status = table.getStatus();
        if ("FREE".equals(status) || "RESERVED".equals(status) || "OCCUPIED".equals(status)) {
            return true;
        }
        throw new RuntimeException("Table " + tableId + " is not available. Current status: " + status);
    }
}
