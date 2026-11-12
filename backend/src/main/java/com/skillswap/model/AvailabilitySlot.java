package com.skillswap.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlot {
    private String dayOfWeek; // MONDAY, TUESDAY, etc.
    @Builder.Default
    private List<String> slots = new ArrayList<>(); // MORNING, AFTERNOON, EVENING
}
