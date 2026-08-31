package com.marketplace.dto.order;

import com.marketplace.entity.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderResponse {

    private Long id;

    private Long buyerId;
    private String buyerName;
    private String buyerEmail;

    private Long sellerId;
    private String sellerName;
    private String sellerEmail;

    private Long productId;
    private String productTitle;

    private BigDecimal amount;
    private OrderStatus status;
    private LocalDateTime createdAt;
}