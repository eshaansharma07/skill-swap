package com.skillswap.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposedSlot {
    private Instant startUtc;
    private Instant endUtc;
    @Builder.Default
    private SessionMode mode = SessionMode.ONLINE;
    private String locationOrLink;
}
