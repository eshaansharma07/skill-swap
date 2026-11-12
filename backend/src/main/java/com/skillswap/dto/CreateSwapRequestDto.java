package com.skillswap.dto;

import com.skillswap.model.ProposedSlot;
import com.skillswap.model.UserSkill;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
public class CreateSwapRequestDto {

    @NotBlank(message = "Recipient user ID is required")
    private String toUserId;

    @NotNull(message = "Offered skill is required")
    private UserSkill offeredSkill;

    @NotNull(message = "Requested skill is required")
    private UserSkill requestedSkill;

    @NotEmpty(message = "At least one proposed time slot is required")
    private List<ProposedSlot> proposedSlots;

    private String message;
}
