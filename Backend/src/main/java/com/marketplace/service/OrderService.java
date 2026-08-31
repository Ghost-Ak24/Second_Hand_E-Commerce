package com.marketplace.service;

import com.marketplace.dto.order.OrderResponse;
import com.marketplace.entity.*;
import com.marketplace.exception.*;
import com.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;


    /*
     * ============================================================
     * BUYER CLICKS "BUY NOW"
     * ============================================================
     *
     * Product:
     * AVAILABLE -> RESERVED
     *
     * Order:
     * PENDING
     *
     * Pessimistic locking prevents two buyers from
     * purchasing the same product simultaneously.
     */
    @Transactional
    public OrderResponse purchase(Long productId, String email) {

        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        // Lock product row until this transaction finishes
        Product product = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        // Seller cannot purchase his own product
        if (product.getSeller().getId().equals(buyer.getId())) {
            throw new BadRequestException(
                    "You cannot buy your own product");
        }

        // Product must currently be available
        if (product.getStatus() != ProductStatus.AVAILABLE) {
            throw new BadRequestException(
                    "Product is no longer available");
        }

        /*
         * Create a pending purchase request.
         */
        Order order = Order.builder()
                .buyer(buyer)
                .product(product)
                .amount(product.getPrice())
                .status(OrderStatus.PENDING)
                .build();

        /*
         * Reserve the product.
         *
         * It will NOT become SOLD yet.
         * Seller has to accept the request first.
         */
        product.setStatus(ProductStatus.RESERVED);

        orderRepository.save(order);

        return toResponse(order);
    }


    /*
     * ============================================================
     * BUYER'S ORDERS
     * ============================================================
     *
     * Returns orders where the logged-in user is the buyer.
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(String email) {

        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return orderRepository
                .findByBuyerIdOrderByCreatedAtDesc(buyer.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /*
     * ============================================================
     * SELLER'S ORDERS
     * ============================================================
     *
     * Returns purchase requests for products owned by
     * the logged-in seller.
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> sellingOrders(String email) {

        User seller = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return orderRepository
                .findByProductSellerIdOrderByCreatedAtDesc(seller.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /*
     * ============================================================
     * SELLER ACCEPTS BUYER
     * ============================================================
     *
     * Order:
     * PENDING -> ACCEPTED
     *
     * Product:
     * RESERVED -> SOLD
     */
    @Transactional
    public OrderResponse accept(Long orderId, String email) {

        Order order = getOrder(orderId);

        /*
         * Lock the product while changing its state.
         */
        Product product = productRepository
                .findByIdForUpdate(order.getProduct().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        /*
         * Only the owner/seller of the product can accept
         * the purchase request.
         */
        if (!product.getSeller().getEmail().equals(email)) {
            throw new UnauthorizedException(
                    "Only the seller can accept this order");
        }

        /*
         * Only pending requests can be accepted.
         */
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Only pending orders can be accepted");
        }

        /*
         * Product should still be reserved.
         */
        if (product.getStatus() != ProductStatus.RESERVED) {
            throw new BadRequestException(
                    "Product is not reserved");
        }

        /*
         * Seller accepts the buyer.
         */
        order.setStatus(OrderStatus.ACCEPTED);

        /*
         * Product is now officially sold.
         */
        product.setStatus(ProductStatus.SOLD);

        orderRepository.save(order);

        return toResponse(order);
    }


    /*
     * ============================================================
     * SELLER REJECTS BUYER
     * ============================================================
     *
     * Order:
     * PENDING -> REJECTED
     *
     * Product:
     * RESERVED -> AVAILABLE
     */
    @Transactional
    public OrderResponse reject(Long orderId, String email) {

        Order order = getOrder(orderId);

        /*
         * Lock product while changing its status.
         */
        Product product = productRepository
                .findByIdForUpdate(order.getProduct().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        /*
         * Only the seller can reject the request.
         */
        if (!product.getSeller().getEmail().equals(email)) {
            throw new UnauthorizedException(
                    "Only the seller can reject this order");
        }

        /*
         * Only pending requests can be rejected.
         */
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Only pending orders can be rejected");
        }

        /*
         * Product must currently be reserved.
         */
        if (product.getStatus() != ProductStatus.RESERVED) {
            throw new BadRequestException(
                    "Product is not reserved");
        }

        /*
         * Reject buyer.
         */
        order.setStatus(OrderStatus.REJECTED);

        /*
         * Make product available again.
         */
        product.setStatus(ProductStatus.AVAILABLE);

        orderRepository.save(order);

        return toResponse(order);
    }


    /*
     * ============================================================
     * FIND ORDER
     * ============================================================
     */
    private Order getOrder(Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found"));
    }


    /*
     * ============================================================
     * CONVERT ENTITY -> RESPONSE DTO
     * ============================================================
     *
     * We return both buyer and seller information because:
     *
     * Buyer sees:
     *   -> seller details
     *
     * Seller sees:
     *   -> buyer details
     */
    private OrderResponse toResponse(Order order) {

        OrderResponse response = new OrderResponse();

        User buyer = order.getBuyer();
        User seller = order.getProduct().getSeller();
        Product product = order.getProduct();

        // Order information
        response.setId(order.getId());
        response.setAmount(order.getAmount());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());

        // Buyer information
        response.setBuyerId(buyer.getId());
        response.setBuyerName(buyer.getName());
        response.setBuyerEmail(buyer.getEmail());

        // Seller information
        response.setSellerId(seller.getId());
        response.setSellerName(seller.getName());
        response.setSellerEmail(seller.getEmail());

        // Product information
        response.setProductId(product.getId());
        response.setProductTitle(product.getTitle());

        return response;
    }
}