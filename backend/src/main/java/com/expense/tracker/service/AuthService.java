package com.expense.tracker.service;

import com.expense.tracker.dto.JwtAuthenticationResponse;
import com.expense.tracker.dto.LoginRequest;
import com.expense.tracker.dto.RegisterRequest;

public interface AuthService {
    String register(RegisterRequest registerRequest);
    JwtAuthenticationResponse login(LoginRequest loginRequest);
}
