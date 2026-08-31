package com.marketplace.dto.product;

import com.marketplace.entity.ProductCondition;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank @Size(max = 150)
    private String title;

    @NotBlank
    private String description;

    @NotNull @DecimalMin("0.01")
    private BigDecimal price;

    @NotNull
    private ProductCondition productCondition;

    @NotNull
    private Long categoryId;

    private List<@NotBlank String> imageUrls;
}
