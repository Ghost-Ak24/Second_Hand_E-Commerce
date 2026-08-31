package com.marketplace.controller;

import com.marketplace.dto.order.OrderResponse;
import com.marketplace.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;


    @PostMapping("/purchase/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse purchase(
            @PathVariable Long productId,
            Authentication authentication) {

        return orderService.purchase(
                productId,
                authentication.getName()
        );
    }


    @GetMapping("/my")
    public List<OrderResponse> myOrders(
            Authentication authentication) {

        return orderService.myOrders(
                authentication.getName()
        );
    }

    @GetMapping("/selling")
    public List<OrderResponse> sellingOrders(
            Authentication authentication) {

        return orderService.sellingOrders(
                authentication.getName()
        );
    }


    @PutMapping("/{orderId}/accept")
    public OrderResponse accept(
            @PathVariable Long orderId,
            Authentication authentication) {

        return orderService.accept(
                orderId,
                authentication.getName()
        );
    }


    @PutMapping("/{orderId}/reject")
    public OrderResponse reject(
            @PathVariable Long orderId,
            Authentication authentication) {

        return orderService.reject(
                orderId,
                authentication.getName()
        );
    }
}