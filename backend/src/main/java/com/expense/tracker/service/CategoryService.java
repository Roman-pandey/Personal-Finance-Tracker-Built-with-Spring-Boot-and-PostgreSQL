package com.expense.tracker.service;

import com.expense.tracker.dto.CategoryDto;
import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(CategoryDto categoryDto, String email);
    CategoryDto getCategoryById(Long categoryId);
    List<CategoryDto> getAllCategories(String email);
    CategoryDto updateCategory(CategoryDto categoryDto, Long categoryId, String email);
    void deleteCategory(Long categoryId, String email);
}
