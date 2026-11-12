package com.skillswap.dto;

import com.skillswap.model.ProposedSlot;
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
public class CounterSwapRequestDto {
    private UserSkill counterOfferedSkill;
    private UserSkill counterRequestedSkill;
    private List<ProposedSlot> counterProposedSlots;
    private String counterMessage;
}
