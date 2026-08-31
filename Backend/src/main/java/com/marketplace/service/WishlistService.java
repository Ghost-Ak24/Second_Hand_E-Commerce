package com.marketplace.service;

import com.marketplace.entity.*;
import com.marketplace.exception.*;
import com.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void add(Long productId, String email) {
        User user = getUser(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new BadRequestException("Product is already in wishlist");
        }

        wishlistRepository.save(Wishlist.builder().user(user).product(product).build());
    }

    @Transactional
    public void remove(Long productId, String email) {
        User user = getUser(email);
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product is not in wishlist"));
        wishlistRepository.delete(wishlist);
    }

    @Transactional(readOnly = true)
    public List<Long> getMyWishlist(String email) {
        User user = getUser(email);
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(w -> w.getProduct().getId()).toList();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
