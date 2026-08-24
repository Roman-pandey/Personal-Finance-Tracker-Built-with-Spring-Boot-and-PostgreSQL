package com.expense.tracker.repository;

import com.expense.tracker.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    Page<Expense> findByUserId(Long userId, Pageable pageable);
    List<Expense> findByUserId(Long userId);
    List<Expense> findByUserIdOrderByDateDescIdDesc(Long userId);
    
    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.date BETWEEN :startDate AND :endDate")
    List<Expense> findByUserIdAndDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal getTotalExpenseByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.category.id = :categoryId AND e.user.id = :userId")
    long countByCategoryIdAndUserId(@Param("categoryId") Long categoryId, @Param("userId") Long userId);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.category.id = :categoryId")
    long countByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.category.id = :categoryId AND e.user.id = :userId")
    BigDecimal getTotalAmountByCategoryIdAndUserId(@Param("categoryId") Long categoryId, @Param("userId") Long userId);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Expense e WHERE e.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
