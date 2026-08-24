package com.expense.tracker.config;

import com.expense.tracker.entity.Category;
import com.expense.tracker.entity.User;
import com.expense.tracker.repository.CategoryRepository;
import com.expense.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize default categories if not present
        if (categoryRepository.count() == 0) {
            List<Category> defaultCategories = Arrays.asList(
                createCategory("Food", "EXPENSE"),
                createCategory("Transportation", "EXPENSE"),
                createCategory("Shopping", "EXPENSE"),
                createCategory("Bills", "EXPENSE"),
                createCategory("Entertainment", "EXPENSE"),
                createCategory("Health", "EXPENSE"),
                createCategory("Education", "EXPENSE"),
                createCategory("Travel", "EXPENSE"),
                createCategory("Groceries", "EXPENSE"),
                createCategory("Rent", "EXPENSE"),
                createCategory("Utilities", "EXPENSE"),
                createCategory("Other", "EXPENSE"),
                createCategory("Salary", "INCOME"),
                createCategory("Freelance", "INCOME"),
                createCategory("Bonus", "INCOME"),
                createCategory("Investment", "INCOME"),
                createCategory("Contest Earning", "INCOME"),
                createCategory("Scholarship", "INCOME"),
                createCategory("Refund", "INCOME"),
                createCategory("Business", "INCOME"),
                createCategory("Other", "INCOME")
            );
            categoryRepository.saveAll(defaultCategories);
        }

        // Ensure demo user account exists for immediate login
        if (userRepository.findByEmail("demo@example.com").isEmpty()) {
            User demoUser = new User();
            demoUser.setName("Demo User");
            demoUser.setEmail("demo@example.com");
            demoUser.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(demoUser);
        }
    }

    private Category createCategory(String name, String type) {
        Category category = new Category();
        category.setName(name);
        category.setType(type);
        return category;
    }
}
