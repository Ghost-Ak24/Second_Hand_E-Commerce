package com.marketplace.service;

import com.marketplace.dto.category.*;
import com.marketplace.entity.Category;
import com.marketplace.exception.BadRequestException;
import com.marketplace.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Category already exists");
        }
        Category category = Category.builder().name(request.getName().trim()).build();
        categoryRepository.save(category);
        return new CategoryResponse(category.getId(), category.getName());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName()))
                .toList();
    }
}
