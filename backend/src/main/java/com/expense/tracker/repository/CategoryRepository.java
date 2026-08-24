package com.expense.tracker.repository;

import com.expense.tracker.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findByName(String name);
    Optional<Category> findByNameAndType(String name, String type);
    
    // Find categories for a specific user OR global categories (where user is null)
    @Query("SELECT c FROM Category c WHERE c.user.id = :userId OR c.user IS NULL")
    List<Category> findByUserIdOrUserIsNull(@Param("userId") Long userId);
    
    List<Category> findByType(String type);
}
