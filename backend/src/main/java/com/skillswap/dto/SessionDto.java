package com.skillswap.dto;

import com.skillswap.model.SessionMode;
import com.skillswap.model.SessionStatus;
import com.skillswap.model.UserSkill;
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
public class SessionDto {
    private String id;
    private String swapRequestId;
    private List<String> participantIds;
    private UserDto userA;
    private UserDto userB;
    private UserSkill skillAOffers;
    private UserSkill skillBOffers;
    private Instant startUtc;
    private Instant endUtc;
    private SessionMode mode;
    private String meetingLinkOrLocation;
    private SessionStatus status;
    private List<String> reviewedByUserIds;
    private Instant completedAt;
    private Instant createdAt;
}
