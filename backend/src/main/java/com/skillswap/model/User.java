package com.skillswap.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
@CompoundIndex(name = "user_role_status_idx", def = "{'role': 1, 'status': 1}")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String username;

    @JsonIgnore
    private String passwordHash;

    @TextIndexed(weight = 2)
    private String name;

    private String avatarUrl;

    @TextIndexed(weight = 1)
    private String bio;

    @Builder.Default
    private String timezone = "UTC";

    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @Builder.Default
    private UserLocation location = new UserLocation();

    @Builder.Default
    private List<AvailabilitySlot> availability = new ArrayList<>();

    @Builder.Default
    private List<UserSkill> skills = new ArrayList<>();

    @Builder.Default
    private UserReputation reputation = new UserReputation();

    @Builder.Default
    private Role role = Role.USER;

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED

    @Builder.Default
    private Boolean onboardingCompleted = false;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
