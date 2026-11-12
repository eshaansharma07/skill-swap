package com.skillswap.controller;

import com.skillswap.dto.UpdateAvailabilityRequest;
import com.skillswap.dto.UpdateProfileRequest;
import com.skillswap.dto.UpdateSkillsRequest;
import com.skillswap.dto.UserDto;
import com.skillswap.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users & Profiles", description = "User profile management, skills list, and availability updates")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Get user public profile by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/profile/{username}")
    @Operation(summary = "Get user public profile by username")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile info (name, bio, timezone, languages, location)")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PutMapping("/skills")
    @Operation(summary = "Update current user skills (teach and learn lists with levels)")
    public ResponseEntity<UserDto> updateSkills(@Valid @RequestBody UpdateSkillsRequest request) {
        return ResponseEntity.ok(userService.updateSkills(request));
    }

    @PutMapping("/availability")
    @Operation(summary = "Update current user availability schedule")
    public ResponseEntity<UserDto> updateAvailability(@Valid @RequestBody UpdateAvailabilityRequest request) {
        return ResponseEntity.ok(userService.updateAvailability(request));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users by keyword, skill category, or mode")
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String mode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.searchUsers(q, category, mode, PageRequest.of(page, size)));
    }

    @DeleteMapping("/me")
    @Operation(summary = "Soft delete current user account")
    public ResponseEntity<Void> deleteAccount() {
        userService.deleteCurrentUser();
        return ResponseEntity.noContent().build();
    }
}
