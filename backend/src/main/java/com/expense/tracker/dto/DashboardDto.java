package com.expense.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private BigDecimal totalBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal monthlySavings;
    private List<ExpenseDto> recentTransactions; // Combining recent incomes/expenses or just expenses
    private Map<String, BigDecimal> expenseCategoryOverview;
    private Map<String, BigDecimal> dailySpendingAnalytics;
    private Map<String, BigDecimal> weeklySpendingAnalytics;
    private Map<String, BigDecimal> monthlySpendingAnalytics;
    private Map<String, BigDecimal> yearlySpendingAnalytics;
}
