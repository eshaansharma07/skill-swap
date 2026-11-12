package com.skillswap.dto;

import com.skillswap.model.UserLocation;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    private String avatarUrl;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;

    private String timezone;

    private List<String> languages;

    private UserLocation location;
}
