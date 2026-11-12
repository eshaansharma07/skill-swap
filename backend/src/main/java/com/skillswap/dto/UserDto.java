package com.skillswap.dto;

import com.skillswap.model.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String email;
    private String username;
    private String name;
    private String avatarUrl;
    private String bio;
    private String timezone;
    private List<String> languages;
    private UserLocation location;
    private List<AvailabilitySlot> availability;
    private List<UserSkill> skills;
    private UserReputation reputation;
    private Role role;
    private String status;
    private Boolean onboardingCompleted;
    private Instant createdAt;
}
