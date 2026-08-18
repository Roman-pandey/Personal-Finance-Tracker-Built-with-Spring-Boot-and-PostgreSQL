package com.expense.tracker.controller;

import com.expense.tracker.dto.ExpenseDto;
import com.expense.tracker.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseDto> createExpense(@RequestBody ExpenseDto expenseDto, Authentication authentication) {
        ExpenseDto savedExpense = expenseService.createExpense(expenseDto, authentication.getName());
        return new ResponseEntity<>(savedExpense, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDto> getExpenseById(@PathVariable("id") Long expenseId, Authentication authentication) {
        ExpenseDto expenseDto = expenseService.getExpenseById(expenseId, authentication.getName());
        return ResponseEntity.ok(expenseDto);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> getAllExpenses(Authentication authentication) {
        List<ExpenseDto> expenses = expenseService.getAllExpenses(authentication.getName());
        return ResponseEntity.ok(expenses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDto> updateExpense(@RequestBody ExpenseDto expenseDto,
                                                    @PathVariable("id") Long expenseId,
                                                    Authentication authentication) {
        ExpenseDto updatedExpense = expenseService.updateExpense(expenseDto, expenseId, authentication.getName());
        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExpense(@PathVariable("id") Long expenseId, Authentication authentication) {
        expenseService.deleteExpense(expenseId, authentication.getName());
        return ResponseEntity.ok("Expense deleted successfully.");
    }
}
