package com.skillswap.dto;

import com.skillswap.model.UserSkill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchDto {
    private UserDto user;
    private int matchScore; // 0 - 100
    private List<String> reasons;
    private List<UserSkill> mutualTeachSkills; // Skills current user teaches that candidate wants
    private List<UserSkill> mutualLearnSkills; // Skills candidate teaches that current user wants
    private boolean isDirectMutualMatch;
}
