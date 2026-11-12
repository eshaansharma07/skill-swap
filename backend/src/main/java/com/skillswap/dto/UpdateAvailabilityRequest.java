package com.skillswap.dto;

import com.skillswap.model.AvailabilitySlot;
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
public class UpdateAvailabilityRequest {

    @NotNull(message = "Availability slots list cannot be null")
    private List<AvailabilitySlot> availability;
}
