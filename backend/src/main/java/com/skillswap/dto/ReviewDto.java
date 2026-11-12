package com.skillswap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private String id;
    private String sessionId;
    private String reviewerId;
    private String revieweeId;
    private UserDto reviewer;
    private UserDto reviewee;
    private Integer rating;
    private String text;
    private String endorsedSkill;
    private Instant createdAt;
}
