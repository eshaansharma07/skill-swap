package com.skillswap.controller;

import com.skillswap.dto.UserDto;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.Skill;
import com.skillswap.model.User;
import com.skillswap.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Moderation", description = "Endpoints for moderation, skills taxonomy maintenance, and system metrics")
public class AdminController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final SwapRequestRepository swapRequestRepository;
    private final SessionRepository sessionRepository;
    private final UserMapper userMapper;

    @GetMapping("/stats")
    @Operation(summary = "Get platform metrics (user counts, sessions, swaps, skills)")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalSkills", skillRepository.count());
        stats.put("totalSwaps", swapRequestRepository.count());
        stats.put("totalSessions", sessionRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    @Operation(summary = "List all users for moderation")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream().map(userMapper::toDto).toList());
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Update user status (ACTIVE, SUSPENDED)")
    public ResponseEntity<UserDto> updateUserStatus(@PathVariable String id, @RequestParam String status) {
        User user = userRepository.findById(id).orElseThrow();
        user.setStatus(status.toUpperCase());
        User updated = userRepository.save(user);
        return ResponseEntity.ok(userMapper.toDto(updated));
    }

    @PostMapping("/skills")
    @Operation(summary = "Add a new skill to the global taxonomy")
    public ResponseEntity<Skill> addSkill(@Valid @RequestBody Skill skill) {
        if (skill.getSlug() == null || skill.getSlug().isBlank()) {
            skill.setSlug(skill.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(skillRepository.save(skill));
    }
}
