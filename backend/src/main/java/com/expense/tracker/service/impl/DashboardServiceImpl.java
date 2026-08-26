package com.expense.tracker.service.impl;

import com.expense.tracker.dto.DashboardDto;
import com.expense.tracker.dto.ExpenseDto;
import com.expense.tracker.entity.Expense;
import com.expense.tracker.entity.User;
import com.expense.tracker.exception.ResourceNotFoundException;
import com.expense.tracker.repository.ExpenseRepository;
import com.expense.tracker.repository.IncomeRepository;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    @Override
    public DashboardDto getDashboardData(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));
        
        Long userId = user.getId();

        BigDecimal totalIncome = incomeRepository.getTotalIncomeByUserId(userId);
        if(totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpense = expenseRepository.getTotalExpenseByUserId(userId);
        if(totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal totalBalance = totalIncome.subtract(totalExpense);

        // Recent transactions (just expenses for simplicity in this demo)
        List<Expense> recentExpenses = expenseRepository.findByUserId(userId, 
                PageRequest.of(0, 5, Sort.by("date").descending())).getContent();
        
        List<ExpenseDto> recentTransactions = recentExpenses.stream().map(expense -> {
            ExpenseDto dto = new ExpenseDto();
            dto.setId(expense.getId());
            dto.setTitle(expense.getTitle());
            dto.setAmount(expense.getAmount());
            if (expense.getCategory() != null) {
                dto.setCategoryId(expense.getCategory().getId());
                dto.setCategoryName(expense.getCategory().getName());
                dto.setCategoryIcon(expense.getCategory().getIcon());
                dto.setCategoryColor(expense.getCategory().getColor());
            }
            dto.setDate(expense.getDate());
            return dto;
        }).collect(Collectors.toList());

        // Expense category overview
        List<Expense> allExpenses = expenseRepository.findByUserId(userId);
        Map<String, BigDecimal> categoryOverview = new HashMap<>();
        for(Expense expense : allExpenses) {
            String catName = expense.getCategory().getName();
            categoryOverview.put(catName, categoryOverview.getOrDefault(catName, BigDecimal.ZERO).add(expense.getAmount()));
        }

        // Sort expenses chronologically for analytics
        allExpenses.sort(java.util.Comparator.comparing(Expense::getDate));

        java.time.format.DateTimeFormatter dailyFormatter = java.time.format.DateTimeFormatter.ofPattern("MMM dd");
        java.time.format.DateTimeFormatter monthlyFormatter = java.time.format.DateTimeFormatter.ofPattern("MMM yyyy");

        Map<String, BigDecimal> dailyAnalytics = new java.util.LinkedHashMap<>();
        Map<String, BigDecimal> weeklyAnalytics = new java.util.LinkedHashMap<>();
        Map<String, BigDecimal> monthlyAnalytics = new java.util.LinkedHashMap<>();
        Map<String, BigDecimal> yearlyAnalytics = new java.util.LinkedHashMap<>();

        for(Expense expense : allExpenses) {
            java.time.LocalDate date = expense.getDate();
            if (date == null) continue;

            // Daily key (e.g. "May 21")
            String dayKey = date.format(dailyFormatter);
            dailyAnalytics.put(dayKey, dailyAnalytics.getOrDefault(dayKey, BigDecimal.ZERO).add(expense.getAmount()));

            // Weekly key (e.g. "Week of May 18")
            java.time.LocalDate startOfWeek = date.with(java.time.DayOfWeek.MONDAY);
            String weekKey = "Week of " + startOfWeek.format(dailyFormatter);
            weeklyAnalytics.put(weekKey, weeklyAnalytics.getOrDefault(weekKey, BigDecimal.ZERO).add(expense.getAmount()));

            // Monthly key (e.g. "May 2026")
            String monthKey = date.format(monthlyFormatter);
            monthlyAnalytics.put(monthKey, monthlyAnalytics.getOrDefault(monthKey, BigDecimal.ZERO).add(expense.getAmount()));

            // Yearly key (e.g. "2026")
            String yearKey = String.valueOf(date.getYear());
            yearlyAnalytics.put(yearKey, yearlyAnalytics.getOrDefault(yearKey, BigDecimal.ZERO).add(expense.getAmount()));
        }

        DashboardDto dashboardDto = new DashboardDto();
        dashboardDto.setTotalBalance(totalBalance);
        dashboardDto.setTotalIncome(totalIncome);
        dashboardDto.setTotalExpense(totalExpense);
        dashboardDto.setMonthlySavings(totalBalance);
        dashboardDto.setRecentTransactions(recentTransactions);
        dashboardDto.setExpenseCategoryOverview(categoryOverview);
        dashboardDto.setDailySpendingAnalytics(dailyAnalytics);
        dashboardDto.setWeeklySpendingAnalytics(weeklyAnalytics);
        dashboardDto.setMonthlySpendingAnalytics(monthlyAnalytics);
        dashboardDto.setYearlySpendingAnalytics(yearlyAnalytics);

        return dashboardDto;
    }
}
