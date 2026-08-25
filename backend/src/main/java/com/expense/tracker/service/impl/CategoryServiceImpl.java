package com.expense.tracker.service.impl;

import com.expense.tracker.dto.CategoryDto;
import com.expense.tracker.entity.Category;
import com.expense.tracker.entity.User;
import com.expense.tracker.exception.APIException;
import com.expense.tracker.exception.ResourceNotFoundException;
import com.expense.tracker.repository.CategoryRepository;
import com.expense.tracker.repository.ExpenseRepository;
import com.expense.tracker.repository.IncomeRepository;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        String trimmedName = validateAndTrimName(categoryDto.getName());
        String type = validateType(categoryDto.getType());

        // Prevent duplicate category name for same user and same type
        boolean exists = categoryRepository.findByUserIdOrUserIsNull(user.getId())
                .stream()
                .anyMatch(c -> c.getType().equalsIgnoreCase(type) && c.getName().equalsIgnoreCase(trimmedName) && !c.isArchived());

        if (exists) {
            throw new APIException(HttpStatus.BAD_REQUEST, "A category named '" + trimmedName + "' already exists for " + type);
        }

        Category category = new Category();
        category.setName(trimmedName);
        category.setType(type);
        category.setIcon(categoryDto.getIcon() != null && !categoryDto.getIcon().isBlank() ? categoryDto.getIcon() : "📦");
        category.setColor(categoryDto.getColor() != null && !categoryDto.getColor().isBlank() ? categoryDto.getColor() : "#3b82f6");
        category.setArchived(false);
        category.setUser(user);

        Category savedCategory = categoryRepository.save(category);
        return mapToDto(savedCategory, user.getId());
    }

    @Override
    public CategoryDto getCategoryById(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        return mapToDto(category, null);
    }

    @Override
    public List<CategoryDto> getAllCategories(String email, Boolean includeArchived, String type) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        List<Category> allCategories = categoryRepository.findByUserIdOrUserIsNull(user.getId());

        // User-specific categories override global default categories by (type + name)
        Map<String, Category> categoryMap = new LinkedHashMap<>();

        // Add global categories first
        for (Category c : allCategories) {
            if (c.getUser() == null) {
                categoryMap.put(c.getType().toUpperCase() + ":" + c.getName().toLowerCase(), c);
            }
        }
        // Override with user-specific categories
        for (Category c : allCategories) {
            if (c.getUser() != null) {
                categoryMap.put(c.getType().toUpperCase() + ":" + c.getName().toLowerCase(), c);
            }
        }

        return categoryMap.values().stream()
                .filter(c -> includeArchived == null || includeArchived || !c.isArchived())
                .filter(c -> type == null || type.isBlank() || type.equalsIgnoreCase("undefined") || type.equalsIgnoreCase("null") || c.getType().equalsIgnoreCase(type))
                .map(c -> mapToDto(c, user.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDto updateCategory(CategoryDto categoryDto, Long categoryId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (category.getUser() != null && !category.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "You don't have permission to update this category");
        }

        String trimmedName = validateAndTrimName(categoryDto.getName());
        String type = category.getType();

        // Prevent duplicate name on update if name changed
        boolean exists = categoryRepository.findByUserIdOrUserIsNull(user.getId())
                .stream()
                .anyMatch(c -> !c.getId().equals(categoryId) && c.getType().equalsIgnoreCase(type) && c.getName().equalsIgnoreCase(trimmedName) && !c.isArchived());

        if (exists) {
            throw new APIException(HttpStatus.BAD_REQUEST, "A category named '" + trimmedName + "' already exists for " + type);
        }

        if (category.getUser() == null) {
            // Create user-specific override category for system global category
            Category userCategory = Category.builder()
                    .name(trimmedName)
                    .type(type)
                    .icon(categoryDto.getIcon() != null && !categoryDto.getIcon().isBlank() ? categoryDto.getIcon() : category.getIcon())
                    .color(categoryDto.getColor() != null && !categoryDto.getColor().isBlank() ? categoryDto.getColor() : category.getColor())
                    .isArchived(category.isArchived())
                    .user(user)
                    .build();
            Category savedCategory = categoryRepository.save(userCategory);
            return mapToDto(savedCategory, user.getId());
        }

        category.setName(trimmedName);
        if (categoryDto.getIcon() != null && !categoryDto.getIcon().isBlank()) {
            category.setIcon(categoryDto.getIcon());
        }
        if (categoryDto.getColor() != null && !categoryDto.getColor().isBlank()) {
            category.setColor(categoryDto.getColor());
        }

        Category updatedCategory = categoryRepository.save(category);
        return mapToDto(updatedCategory, user.getId());
    }

    @Override
    public CategoryDto archiveCategory(Long categoryId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (category.getUser() != null && !category.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "You don't have permission to archive this category");
        }

        if (category.getUser() == null) {
            // Find existing user copy or create new user copy for global category
            Category userCategory = categoryRepository.findByUserIdOrUserIsNull(user.getId()).stream()
                    .filter(c -> c.getUser() != null && c.getType().equalsIgnoreCase(category.getType()) && c.getName().equalsIgnoreCase(category.getName()))
                    .findFirst()
                    .orElseGet(() -> Category.builder()
                            .name(category.getName())
                            .type(category.getType())
                            .icon(category.getIcon())
                            .color(category.getColor())
                            .user(user)
                            .build());
            userCategory.setArchived(true);
            Category savedCategory = categoryRepository.save(userCategory);
            return mapToDto(savedCategory, user.getId());
        } else {
            category.setArchived(true);
            Category archivedCategory = categoryRepository.save(category);
            return mapToDto(archivedCategory, user.getId());
        }
    }

    @Override
    public CategoryDto restoreCategory(Long categoryId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (category.getUser() != null && !category.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "You don't have permission to restore this category");
        }

        if (category.getUser() == null) {
            Category userCategory = categoryRepository.findByUserIdOrUserIsNull(user.getId()).stream()
                    .filter(c -> c.getUser() != null && c.getType().equalsIgnoreCase(category.getType()) && c.getName().equalsIgnoreCase(category.getName()))
                    .findFirst()
                    .orElseGet(() -> Category.builder()
                            .name(category.getName())
                            .type(category.getType())
                            .icon(category.getIcon())
                            .color(category.getColor())
                            .user(user)
                            .build());
            userCategory.setArchived(false);
            Category savedCategory = categoryRepository.save(userCategory);
            return mapToDto(savedCategory, user.getId());
        } else {
            category.setArchived(false);
            Category restoredCategory = categoryRepository.save(category);
            return mapToDto(restoredCategory, user.getId());
        }
    }

    @Override
    public void deleteCategory(Long categoryId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (category.getUser() != null && !category.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "You don't have permission to delete this category");
        }

        // Check if THIS user has any transactions using this category
        long expenseCount = expenseRepository.countByCategoryIdAndUserId(categoryId, user.getId());
        long incomeCount = incomeRepository.countByCategoryIdAndUserId(categoryId, user.getId());
        long totalCount = expenseCount + incomeCount;

        if (totalCount > 0) {
            throw new APIException(HttpStatus.BAD_REQUEST, "This category cannot be permanently deleted because it is being used by " + totalCount + " existing transaction(s). You can archive it instead.");
        }

        if (category.getUser() == null) {
            // Archive/hide global category for this user
            Category userCategory = Category.builder()
                    .name(category.getName())
                    .type(category.getType())
                    .icon(category.getIcon())
                    .color(category.getColor())
                    .isArchived(true)
                    .user(user)
                    .build();
            categoryRepository.save(userCategory);
        } else {
            categoryRepository.delete(category);
        }
    }

    private String validateAndTrimName(String name) {
        if (name == null || name.trim().length() < 2) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Category name must be at least 2 characters");
        }
        return name.trim();
    }

    private String validateType(String type) {
        if (type == null || (!type.equalsIgnoreCase("EXPENSE") && !type.equalsIgnoreCase("INCOME"))) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Category type must be EXPENSE or INCOME");
        }
        return type.toUpperCase();
    }

    private CategoryDto mapToDto(Category category, Long userId) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setType(category.getType());
        dto.setIcon(category.getIcon() != null ? category.getIcon() : "📦");
        dto.setColor(category.getColor() != null ? category.getColor() : "#3b82f6");
        dto.setArchived(category.isArchived());
        dto.setGlobal(category.getUser() == null);

        if (userId != null) {
            if ("EXPENSE".equalsIgnoreCase(category.getType())) {
                long count = expenseRepository.countByCategoryIdAndUserId(category.getId(), userId);
                BigDecimal sum = expenseRepository.getTotalAmountByCategoryIdAndUserId(category.getId(), userId);
                java.time.LocalDate latestDate = expenseRepository.findLatestDateByCategoryIdAndUserId(category.getId(), userId);
                dto.setTransactionCount(count);
                dto.setTotalAmount(sum != null ? sum : BigDecimal.ZERO);
                dto.setLastTransactionDate(latestDate != null ? latestDate.toString() : null);
            } else {
                long count = incomeRepository.countByCategoryIdAndUserId(category.getId(), userId);
                BigDecimal sum = incomeRepository.getTotalAmountByCategoryIdAndUserId(category.getId(), userId);
                java.time.LocalDate latestDate = incomeRepository.findLatestDateByCategoryIdAndUserId(category.getId(), userId);
                dto.setTransactionCount(count);
                dto.setTotalAmount(sum != null ? sum : BigDecimal.ZERO);
                dto.setLastTransactionDate(latestDate != null ? latestDate.toString() : null);
            }
        }

        return dto;
    }
}
