package com.expense.tracker.service;

import com.expense.tracker.dto.UserDto;

public interface UserService {
    UserDto updateProfile(String email, UserDto userDto);
    UserDto updateProfileImage(String email, String profileImage);
    UserDto getUserProfile(String email);
}
