package com.expense.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeDto {
    private Long id;
    private String title;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private LocalDate date;
    private String notes;
}
