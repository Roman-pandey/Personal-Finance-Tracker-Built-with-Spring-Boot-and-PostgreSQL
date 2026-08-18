package com.expense.tracker.service.impl;

import com.expense.tracker.dto.JwtAuthenticationResponse;
import com.expense.tracker.dto.LoginRequest;
import com.expense.tracker.dto.RegisterRequest;
import com.expense.tracker.dto.UserDto;
import com.expense.tracker.entity.User;
import com.expense.tracker.exception.APIException;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.security.JwtTokenProvider;
import com.expense.tracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public String register(RegisterRequest registerRequest) {
        // check if email exists in database
        if(userRepository.existsByEmail(registerRequest.getEmail())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Email is already registered.");
        }

        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        userRepository.save(user);

        return "User registered successfully.";
    }

    @Override
    public JwtAuthenticationResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail(), user.getProfileImage());

        return new JwtAuthenticationResponse(token, userDto);
    }
}
