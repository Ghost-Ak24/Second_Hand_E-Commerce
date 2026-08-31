package com.marketplace.controller;

import com.marketplace.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public List<Long> getMyWishlist(Authentication authentication) {
        return wishlistService.getMyWishlist(authentication.getName());
    }

    @PostMapping("/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void add(@PathVariable Long productId, Authentication authentication) {
        wishlistService.add(productId, authentication.getName());
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Long productId, Authentication authentication) {
        wishlistService.remove(productId, authentication.getName());
    }
}
