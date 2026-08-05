package com.servesmart.table.repository;

import com.servesmart.table.entity.TableReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TableReservationRepository extends JpaRepository<TableReservation, Long> {

    @Query("SELECT r FROM TableReservation r WHERE r.table.id = :tableId AND r.status = 'ACTIVE' " +
           "AND r.reservedFrom < :reservedTo AND r.reservedTo > :reservedFrom")
    List<TableReservation> findOverlapping(
            @Param("tableId") Long tableId,
            @Param("reservedFrom") LocalDateTime reservedFrom,
            @Param("reservedTo") LocalDateTime reservedTo);
}
