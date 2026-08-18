package com.expense.tracker.controller;

import com.expense.tracker.dto.UserDto;
import com.expense.tracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getUserProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UserDto userDto, 
                                                Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), userDto));
    }

    @PutMapping("/profile-image")
    public ResponseEntity<UserDto> updateProfileImage(@RequestBody Map<String, String> request, 
                                                     Authentication authentication) {
        String profileImage = request.get("profileImage");
        return ResponseEntity.ok(userService.updateProfileImage(authentication.getName(), profileImage));
    }
}
