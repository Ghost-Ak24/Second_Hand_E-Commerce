package com.marketplace.service;

import com.marketplace.dto.product.*;
import com.marketplace.entity.*;
import com.marketplace.exception.*;
import com.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public ProductResponse create(ProductRequest request, String email) {
        User seller = getUser(email);
        Category category = getCategory(request.getCategoryId());

        Product product = Product.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .price(request.getPrice())
                .productCondition(request.getProductCondition())
                .status(ProductStatus.AVAILABLE)
                .seller(seller)
                .category(category)
                .build();

        addImages(product, request.getImageUrls());
        return toResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String keyword, Long categoryId, int page, int size) {
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        String cleanKeyword = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return productRepository.search(cleanKeyword, categoryId, ProductStatus.AVAILABLE, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request, String email) {
        Product product = getProduct(id);
        ensureOwner(product, email);

        Category category = getCategory(request.getCategoryId());
        product.setTitle(request.getTitle().trim());
        product.setDescription(request.getDescription().trim());
        product.setPrice(request.getPrice());
        product.setProductCondition(request.getProductCondition());
        product.setCategory(category);

        product.getImages().clear();
        addImages(product, request.getImageUrls());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id, String email) {
        Product product = getProduct(id);
        ensureOwner(product, email);

        if (product.getStatus() == ProductStatus.SOLD) {
            throw new BadRequestException("Sold product cannot be deleted");
        }

        productRepository.delete(product);
    }

    private Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private Category getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureOwner(Product product, String email) {
        if (!product.getSeller().getEmail().equals(email)) {
            throw new UnauthorizedException("You are not the owner of this product");
        }
    }

    private void addImages(Product product, List<String> imageUrls) {
        if (imageUrls == null) return;

        imageUrls.stream()
                .limit(5)
                .forEach(url -> product.getImages().add(
                        ProductImage.builder()
                                .imageUrl(url)
                                .product(product)
                                .build()
                ));
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = modelMapper.map(product, ProductResponse.class);
        response.setSellerId(product.getSeller().getId());
        response.setSellerName(product.getSeller().getName());
        response.setCategoryId(product.getCategory().getId());
        response.setCategoryName(product.getCategory().getName());
        response.setImageUrls(
                product.getImages().stream().map(ProductImage::getImageUrl).toList()
        );
        return response;
    }
}
