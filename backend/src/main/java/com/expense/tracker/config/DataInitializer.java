package com.expense.tracker.config;

import com.expense.tracker.entity.Category;
import com.expense.tracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            List<Category> defaultCategories = Arrays.asList(
                createCategory("Food", "EXPENSE"),
                createCategory("Transport", "EXPENSE"),
                createCategory("Shopping", "EXPENSE"),
                createCategory("Bills", "EXPENSE"),
                createCategory("Entertainment", "EXPENSE"),
                createCategory("Salary", "INCOME"),
                createCategory("Freelance", "INCOME"),
                createCategory("Investments", "INCOME"),
                createCategory("Business", "INCOME"),
                createCategory("Other", "INCOME")
            );
            categoryRepository.saveAll(defaultCategories);
        }
    }

    private Category createCategory(String name, String type) {
        Category category = new Category();
        category.setName(name);
        category.setType(type);
        return category;
    }
}
