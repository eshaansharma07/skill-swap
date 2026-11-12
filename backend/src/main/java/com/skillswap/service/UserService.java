package com.skillswap.service;

import com.skillswap.dto.UpdateAvailabilityRequest;
import com.skillswap.dto.UpdateProfileRequest;
import com.skillswap.dto.UpdateSkillsRequest;
import com.skillswap.dto.UserDto;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.User;
import com.skillswap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final UserMapper userMapper;

    public UserDto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toDto(user);
    }

    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return userMapper.toDto(user);
    }

    @CacheEvict(value = "matches", key = "#root.target.authService.currentUserEntity.id")
    public UserDto updateProfile(UpdateProfileRequest request) {
        User user = authService.getCurrentUserEntity();

        if (request.getName() != null) user.setName(request.getName().trim());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl().trim());
        if (request.getBio() != null) user.setBio(request.getBio().trim());
        if (request.getTimezone() != null) user.setTimezone(request.getTimezone());
        if (request.getLanguages() != null) user.setLanguages(request.getLanguages());
        if (request.getLocation() != null) user.setLocation(request.getLocation());

        User updated = userRepository.save(user);
        return userMapper.toDto(updated);
    }

    @CacheEvict(value = "matches", key = "#root.target.authService.currentUserEntity.id")
    public UserDto updateSkills(UpdateSkillsRequest request) {
        User user = authService.getCurrentUserEntity();

        user.setSkills(request.getSkills());
        if (request.getOnboardingCompleted() != null) {
            user.setOnboardingCompleted(request.getOnboardingCompleted());
        }

        User updated = userRepository.save(user);
        return userMapper.toDto(updated);
    }

    @CacheEvict(value = "matches", key = "#root.target.authService.currentUserEntity.id")
    public UserDto updateAvailability(UpdateAvailabilityRequest request) {
        User user = authService.getCurrentUserEntity();

        user.setAvailability(request.getAvailability());

        User updated = userRepository.save(user);
        return userMapper.toDto(updated);
    }

    public List<UserDto> searchUsers(String query, String category, String mode, Pageable pageable) {
        // Query users
        List<User> users = userRepository.findAllActiveExcept(authService.getCurrentUser().getId());

        return users.stream()
                .filter(u -> {
                    if (query != null && !query.isBlank()) {
                        String q = query.toLowerCase();
                        boolean nameMatch = u.getName() != null && u.getName().toLowerCase().contains(q);
                        boolean bioMatch = u.getBio() != null && u.getBio().toLowerCase().contains(q);
                        boolean skillMatch = u.getSkills().stream().anyMatch(s -> s.getSkillName().toLowerCase().contains(q));
                        if (!nameMatch && !bioMatch && !skillMatch) return false;
                    }
                    if (category != null && !category.isBlank()) {
                        boolean catMatch = u.getSkills().stream().anyMatch(s -> category.equalsIgnoreCase(s.getCategory()));
                        if (!catMatch) return false;
                    }
                    if (mode != null && !mode.isBlank()) {
                        if (u.getLocation() != null && u.getLocation().getMode() != null) {
                            if (!"BOTH".equalsIgnoreCase(u.getLocation().getMode().name()) &&
                                !mode.equalsIgnoreCase(u.getLocation().getMode().name())) {
                                return false;
                            }
                        }
                    }
                    return true;
                })
                .map(userMapper::toDto)
                .toList();
    }

    public void deleteCurrentUser() {
        User user = authService.getCurrentUserEntity();
        user.setStatus("DELETED");
        userRepository.save(user);
    }

    public AuthService getAuthService() {
        return authService;
    }
}
