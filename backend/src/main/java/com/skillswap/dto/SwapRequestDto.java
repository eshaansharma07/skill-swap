package com.skillswap.dto;

import com.skillswap.model.ProposedSlot;
import com.skillswap.model.SwapStatus;
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
public class SwapRequestDto {
    private String id;
    private String fromUserId;
    private String toUserId;
    private UserDto fromUser;
    private UserDto toUser;
    private UserSkill offeredSkill;
    private UserSkill requestedSkill;
    private SwapStatus status;
    private List<ProposedSlot> proposedSlots;
    private String counterProposalMessage;
    private String message;
    private String sessionId;
    private Instant createdAt;
    private Instant updatedAt;
}
