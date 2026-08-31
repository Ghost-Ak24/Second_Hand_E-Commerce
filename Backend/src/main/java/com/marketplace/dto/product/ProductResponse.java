package com.marketplace.dto.product;

import com.marketplace.entity.ProductCondition;
import com.marketplace.entity.ProductStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private ProductCondition productCondition;
    private ProductStatus status;
    private Long sellerId;
    private String sellerName;
    private Long categoryId;
    private String categoryName;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
}
