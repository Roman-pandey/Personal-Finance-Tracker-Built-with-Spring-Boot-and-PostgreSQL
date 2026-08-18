package com.expense.tracker.service;

import com.expense.tracker.dto.IncomeDto;

import java.util.List;

public interface IncomeService {
    IncomeDto createIncome(IncomeDto incomeDto, String email);
    IncomeDto getIncomeById(Long incomeId, String email);
    List<IncomeDto> getAllIncomes(String email);
    IncomeDto updateIncome(IncomeDto incomeDto, Long incomeId, String email);
    void deleteIncome(Long incomeId, String email);
}
