package com.servesmart.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class AddItemsRequest {
    private List<CreateOrderRequest.OrderItemRequest> items;
}
