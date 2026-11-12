package com.skillswap.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
@CompoundIndex(name = "user_read_idx", def = "{'userId': 1, 'readAt': 1}")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private NotificationType type;

    private String title;

    private String message;

    @Builder.Default
    private Map<String, Object> payload = new HashMap<>();

    private Instant readAt;

    @CreatedDate
    private Instant createdAt;
}
