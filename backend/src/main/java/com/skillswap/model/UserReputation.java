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
public class UserReputation {
    @Builder.Default
    private Double ratingAverage = 5.0;

    @Builder.Default
    private Integer totalReviews = 0;

    @Builder.Default
    private Integer sessionsCompleted = 0;

    @Builder.Default
    private List<String> badges = new ArrayList<>();
}
