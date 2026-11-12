package com.skillswap.dto;

import com.skillswap.model.ProposedSlot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcceptSwapRequestDto {
    private ProposedSlot selectedSlot;
    private String customMeetingLink;
}
