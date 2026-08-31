package com.marketplace.repository;

import com.marketplace.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByOrderProductIdOrderByCreatedAtDesc(Long productId);
    Optional<Review> findByOrderId(Long orderId);
}
