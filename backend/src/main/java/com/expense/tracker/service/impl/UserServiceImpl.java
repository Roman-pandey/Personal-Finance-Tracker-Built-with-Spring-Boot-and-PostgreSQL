package com.expense.tracker.service.impl;

import com.expense.tracker.dto.UserDto;
import com.expense.tracker.entity.User;
import com.expense.tracker.exception.ResourceNotFoundException;
import com.expense.tracker.repository.UserRepository;
import com.expense.tracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserDto updateProfile(String email, UserDto userDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));
        
        user.setName(userDto.getName());
        User updatedUser = userRepository.save(user);
        
        return mapToDto(updatedUser);
    }

    @Override
    public UserDto updateProfileImage(String email, String profileImage) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));
        
        user.setProfileImage(profileImage);
        User updatedUser = userRepository.save(user);
        
        return mapToDto(updatedUser);
    }

    @Override
    public UserDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", 0L));
        return mapToDto(user);
    }

    private UserDto mapToDto(User user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getProfileImage());
    }
}
