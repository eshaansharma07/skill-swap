package com.skillswap.dto;

import com.skillswap.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private String id;
    private String userId;
    private NotificationType type;
    private String title;
    private String message;
    private Map<String, Object> payload;
    private Instant readAt;
    private Instant createdAt;
}
