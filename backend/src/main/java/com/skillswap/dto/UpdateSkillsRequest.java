package com.skillswap.dto;

import com.skillswap.model.UserSkill;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSkillsRequest {

    @NotNull(message = "Skills list cannot be null")
    private List<UserSkill> skills;

    private Boolean onboardingCompleted;
}
