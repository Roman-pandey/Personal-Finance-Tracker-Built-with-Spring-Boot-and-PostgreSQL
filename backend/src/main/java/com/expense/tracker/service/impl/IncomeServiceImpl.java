package com.expense.tracker.service.impl;

import com.expense.tracker.dto.IncomeDto;
import com.expense.tracker.entity.Category;
import com.expense.tracker.entity.Income;
import com.expense.tracker.entity.User;
import com.expense.tracker.exception.APIException;
import com.expense.tracker.exception.ResourceNotFoundException;
import com.expense.tracker.repository.CategoryRepository;
import com.expense.tracker.repository.IncomeRepository;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    public IncomeDto createIncome(IncomeDto incomeDto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Category category;
        if (incomeDto.getCategoryId() != null) {
            category = categoryRepository.findById(incomeDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", incomeDto.getCategoryId()));
        } else if (incomeDto.getCategoryName() != null) {
            category = categoryRepository.findByName(incomeDto.getCategoryName())
                    .stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "name", 0L));
        } else {
            throw new APIException(HttpStatus.BAD_REQUEST, "Category ID or Name is required");
        }

        Income income = new Income();
        income.setTitle(incomeDto.getTitle());
        income.setAmount(incomeDto.getAmount());
        income.setDate(incomeDto.getDate());
        income.setNotes(incomeDto.getNotes());
        income.setCategory(category);
        income.setUser(user);

        Income savedIncome = incomeRepository.save(income);
        return mapToDto(savedIncome);
    }

    @Override
    public IncomeDto getIncomeById(Long incomeId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", incomeId));

        if (!income.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        return mapToDto(income);
    }

    @Override
    public List<IncomeDto> getAllIncomes(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        List<Income> incomes = incomeRepository.findByUserIdOrderByDateDescIdDesc(user.getId());
        return incomes.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public IncomeDto updateIncome(IncomeDto incomeDto, Long incomeId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", incomeId));

        if (!income.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        Category category;
        if (incomeDto.getCategoryId() != null) {
            category = categoryRepository.findById(incomeDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", incomeDto.getCategoryId()));
        } else if (incomeDto.getCategoryName() != null) {
            category = categoryRepository.findByName(incomeDto.getCategoryName())
                    .stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "name", 0L));
        } else {
            throw new APIException(HttpStatus.BAD_REQUEST, "Category ID or Name is required");
        }

        income.setTitle(incomeDto.getTitle());
        income.setAmount(incomeDto.getAmount());
        income.setDate(incomeDto.getDate());
        income.setNotes(incomeDto.getNotes());
        income.setCategory(category);

        Income updatedIncome = incomeRepository.save(income);
        return mapToDto(updatedIncome);
    }

    @Override
    public void deleteIncome(Long incomeId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));

        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", incomeId));

        if (!income.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        incomeRepository.delete(income);
    }

    private IncomeDto mapToDto(Income income){
        IncomeDto dto = new IncomeDto();
        dto.setId(income.getId());
        dto.setTitle(income.getTitle());
        dto.setAmount(income.getAmount());
        dto.setCategoryId(income.getCategory().getId());
        dto.setCategoryName(income.getCategory().getName());
        dto.setDate(income.getDate());
        dto.setNotes(income.getNotes());
        return dto;
    }
}
