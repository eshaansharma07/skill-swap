package com.skillswap.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSkill {
    private String skillId;
    private String skillName;
    private String category;
    private SkillType type; // TEACH or LEARN
    private SkillLevel level; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    private Integer yearsExp;
    private String description;
}
