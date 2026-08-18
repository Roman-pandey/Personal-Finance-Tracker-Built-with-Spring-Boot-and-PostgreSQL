package com.expense.tracker.controller;

import com.expense.tracker.dto.IncomeDto;
import com.expense.tracker.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @PostMapping
    public ResponseEntity<IncomeDto> createIncome(@RequestBody IncomeDto incomeDto, Authentication authentication) {
        IncomeDto savedIncome = incomeService.createIncome(incomeDto, authentication.getName());
        return new ResponseEntity<>(savedIncome, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeDto> getIncomeById(@PathVariable("id") Long incomeId, Authentication authentication) {
        IncomeDto incomeDto = incomeService.getIncomeById(incomeId, authentication.getName());
        return ResponseEntity.ok(incomeDto);
    }

    @GetMapping
    public ResponseEntity<List<IncomeDto>> getAllIncomes(Authentication authentication) {
        List<IncomeDto> incomes = incomeService.getAllIncomes(authentication.getName());
        return ResponseEntity.ok(incomes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeDto> updateIncome(@RequestBody IncomeDto incomeDto,
                                                  @PathVariable("id") Long incomeId,
                                                  Authentication authentication) {
        IncomeDto updatedIncome = incomeService.updateIncome(incomeDto, incomeId, authentication.getName());
        return ResponseEntity.ok(updatedIncome);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteIncome(@PathVariable("id") Long incomeId, Authentication authentication) {
        incomeService.deleteIncome(incomeId, authentication.getName());
        return ResponseEntity.ok("Income deleted successfully.");
    }
}
