package com.expense.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDto {
    private Long id;
    private String title;
    private BigDecimal amount;
    @JsonAlias({"category_id"})
    private Long categoryId;
    @JsonAlias({"category", "category_name"})
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private LocalDate date;
    private String paymentMethod;
    private String notes;
}
