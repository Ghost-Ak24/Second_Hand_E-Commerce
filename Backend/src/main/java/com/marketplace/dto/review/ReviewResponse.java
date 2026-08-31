package com.marketplace.dto.review;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private Long reviewerId;
    private String reviewerName;
    private Long orderId;
    private LocalDateTime createdAt;
}
