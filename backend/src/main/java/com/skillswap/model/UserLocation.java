package com.skillswap.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLocation {
    private String city;
    private String country;
    private List<Double> coordinates; // [longitude, latitude]
    @Builder.Default
    private SessionMode mode = SessionMode.ONLINE;
}
