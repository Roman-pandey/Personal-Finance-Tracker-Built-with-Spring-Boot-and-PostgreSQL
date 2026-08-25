package com.expense.tracker.service.impl;

import com.expense.tracker.dto.ExpenseDto;
import com.expense.tracker.entity.Category;
import com.expense.tracker.entity.Expense;
import com.expense.tracker.entity.User;
import com.expense.tracker.exception.APIException;
import com.expense.tracker.exception.ResourceNotFoundException;
import com.expense.tracker.repository.CategoryRepository;
import com.expense.tracker.repository.ExpenseRepository;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    public ExpenseDto createExpense(ExpenseDto expenseDto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Category category = null;
        if (expenseDto.getCategoryId() != null) {
            category = categoryRepository.findById(expenseDto.getCategoryId()).orElse(null);
        }

        String catName = expenseDto.getCategoryName();
        if (category == null && catName != null && !catName.isBlank()) {
            category = categoryRepository.findByUserIdOrUserIsNull(user.getId()).stream()
                    .filter(c -> c.getType().equalsIgnoreCase("EXPENSE") && c.getName().equalsIgnoreCase(catName.trim()))
                    .findFirst()
                    .orElse(null);
        }

        if (category == null && catName != null && !catName.isBlank()) {
            Category newCat = new Category();
            newCat.setName(catName.trim());
            newCat.setType("EXPENSE");
            newCat.setIcon("📦");
            newCat.setColor("#3b82f6");
            newCat.setArchived(false);
            newCat.setUser(user);
            category = categoryRepository.save(newCat);
        }

        if (category == null) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Category ID or Name is required");
        }

        Expense expense = new Expense();
        expense.setTitle(expenseDto.getTitle());
        expense.setAmount(expenseDto.getAmount());
        expense.setDate(expenseDto.getDate());
        expense.setPaymentMethod(expenseDto.getPaymentMethod());
        expense.setNotes(expenseDto.getNotes());
        expense.setCategory(category);
        expense.setUser(user);

        Expense savedExpense = expenseRepository.save(expense);
        return mapToDto(savedExpense);
    }

    @Override
    public ExpenseDto getExpenseById(Long expenseId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        return mapToDto(expense);
    }

    @Override
    public List<ExpenseDto> getAllExpenses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDescIdDesc(user.getId());
        return expenses.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public ExpenseDto updateExpense(ExpenseDto expenseDto, Long expenseId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        Category category = null;
        if (expenseDto.getCategoryId() != null) {
            category = categoryRepository.findById(expenseDto.getCategoryId()).orElse(null);
        }

        String catName = expenseDto.getCategoryName();
        if (category == null && catName != null && !catName.isBlank()) {
            category = categoryRepository.findByUserIdOrUserIsNull(user.getId()).stream()
                    .filter(c -> c.getType().equalsIgnoreCase("EXPENSE") && c.getName().equalsIgnoreCase(catName.trim()))
                    .findFirst()
                    .orElse(null);
        }

        if (category == null && catName != null && !catName.isBlank()) {
            Category newCat = new Category();
            newCat.setName(catName.trim());
            newCat.setType("EXPENSE");
            newCat.setIcon("📦");
            newCat.setColor("#3b82f6");
            newCat.setArchived(false);
            newCat.setUser(user);
            category = categoryRepository.save(newCat);
        }

        if (category == null) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Category ID or Name is required");
        }

        expense.setTitle(expenseDto.getTitle());
        expense.setAmount(expenseDto.getAmount());
        expense.setDate(expenseDto.getDate());
        expense.setPaymentMethod(expenseDto.getPaymentMethod());
        expense.setNotes(expenseDto.getNotes());
        expense.setCategory(category);

        Expense updatedExpense = expenseRepository.save(expense);
        return mapToDto(updatedExpense);
    }

    @Override
    public void deleteExpense(Long expenseId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        expenseRepository.delete(expense);
    }

    private ExpenseDto mapToDto(Expense expense){
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
        dto.setPaymentMethod(expense.getPaymentMethod());
        dto.setNotes(expense.getNotes());
        return dto;
    }
}
