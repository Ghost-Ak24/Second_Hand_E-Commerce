package com.marketplace.service;

import com.marketplace.dto.review.*;
import com.marketplace.entity.*;
import com.marketplace.exception.*;
import com.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse create(ReviewRequest request, String email) {
        User reviewer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getBuyer().getId().equals(reviewer.getId())) {
            throw new UnauthorizedException("Only the buyer can review this order");
        }

        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new BadRequestException("You can review only a completed order");
        }

        if (reviewRepository.findByOrderId(order.getId()).isPresent()) {
            throw new BadRequestException("This order has already been reviewed");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .reviewer(reviewer)
                .order(order)
                .build();

        return toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByOrderProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).toList();
    }

    private ReviewResponse toResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setReviewerId(review.getReviewer().getId());
        response.setReviewerName(review.getReviewer().getName());
        response.setOrderId(review.getOrder().getId());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}
