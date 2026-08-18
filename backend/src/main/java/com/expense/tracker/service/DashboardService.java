package com.expense.tracker.service;

import com.expense.tracker.dto.DashboardDto;

public interface DashboardService {
    DashboardDto getDashboardData(String email);
}
