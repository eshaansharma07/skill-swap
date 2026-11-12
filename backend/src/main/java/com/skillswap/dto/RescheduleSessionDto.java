package com.skillswap.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleSessionDto {

    @NotNull(message = "New start time is required")
    private Instant newStartUtc;

    @NotNull(message = "New end time is required")
    private Instant newEndUtc;

    private String reason;
}
