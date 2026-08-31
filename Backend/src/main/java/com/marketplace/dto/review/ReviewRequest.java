package com.marketplace.dto.review;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull @Min(1) @Max(5)
    private Integer rating;

    @NotBlank @Size(max = 2000)
    private String comment;

    @NotNull
    private Long orderId;
}
