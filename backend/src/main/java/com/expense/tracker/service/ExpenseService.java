package com.expense.tracker.service;

import com.expense.tracker.dto.ExpenseDto;

import java.util.List;

public interface ExpenseService {
    ExpenseDto createExpense(ExpenseDto expenseDto, String email);
    ExpenseDto getExpenseById(Long expenseId, String email);
    List<ExpenseDto> getAllExpenses(String email);
    ExpenseDto updateExpense(ExpenseDto expenseDto, Long expenseId, String email);
    void deleteExpense(Long expenseId, String email);
}
