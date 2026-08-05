package com.servesmart.common.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "restaurant_tables")
@Data
@NoArgsConstructor
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_number", unique = true, nullable = false, length = 10)
    private String tableNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Column(length = 20)
    private String status = "FREE";

    @ManyToOne
    @JoinColumn(name = "merged_with_table_id")
    private RestaurantTable mergedWithTable;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
