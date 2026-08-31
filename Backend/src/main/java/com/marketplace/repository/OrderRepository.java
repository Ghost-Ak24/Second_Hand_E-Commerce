package com.marketplace.repository;

import com.marketplace.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Orders where user is the buyer
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    // Orders for products owned by the seller
    List<Order> findByProductSellerIdOrderByCreatedAtDesc(Long sellerId);

    Optional<Order> findByProductId(Long productId);
}