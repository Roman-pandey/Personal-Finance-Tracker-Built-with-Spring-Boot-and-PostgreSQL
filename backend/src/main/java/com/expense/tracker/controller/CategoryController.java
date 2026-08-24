package com.expense.tracker.controller;

import com.expense.tracker.dto.CategoryDto;
import com.expense.tracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto categoryDto, Authentication authentication) {
        CategoryDto savedCategory = categoryService.createCategory(categoryDto, authentication.getName());
        return new ResponseEntity<>(savedCategory, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable("id") Long categoryId) {
        CategoryDto categoryDto = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(categoryDto);
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories(
            @RequestParam(value = "includeArchived", required = false, defaultValue = "false") Boolean includeArchived,
            @RequestParam(value = "type", required = false) String type,
            Authentication authentication
    ) {
        List<CategoryDto> categories = categoryService.getAllCategories(authentication.getName(), includeArchived, type);
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(@RequestBody CategoryDto categoryDto,
                                                      @PathVariable("id") Long categoryId,
                                                      Authentication authentication) {
        CategoryDto updatedCategory = categoryService.updateCategory(categoryDto, categoryId, authentication.getName());
        return ResponseEntity.ok(updatedCategory);
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<CategoryDto> archiveCategory(@PathVariable("id") Long categoryId, Authentication authentication) {
        CategoryDto archivedCategory = categoryService.archiveCategory(categoryId, authentication.getName());
        return ResponseEntity.ok(archivedCategory);
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<CategoryDto> restoreCategory(@PathVariable("id") Long categoryId, Authentication authentication) {
        CategoryDto restoredCategory = categoryService.restoreCategory(categoryId, authentication.getName());
        return ResponseEntity.ok(restoredCategory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable("id") Long categoryId, Authentication authentication) {
        categoryService.deleteCategory(categoryId, authentication.getName());
        return ResponseEntity.ok("Category deleted successfully.");
    }
}
