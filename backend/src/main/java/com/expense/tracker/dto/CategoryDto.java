package com.expense.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;
    private String name;
    private String type; // "EXPENSE" or "INCOME"
    private String icon;
    private String color;
    @JsonProperty("isArchived")
    private boolean isArchived;
    @JsonProperty("isGlobal")
    private boolean isGlobal;
    private Long transactionCount;
    private BigDecimal totalAmount;
}
