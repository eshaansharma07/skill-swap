package com.skillswap.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversations")
@CompoundIndex(name = "participants_lastmsg_idx", def = "{'participantIds': 1, 'lastMessageAt': -1}")
public class Conversation {

    @Id
    private String id;

    @Indexed
    @Builder.Default
    private List<String> participantIds = new ArrayList<>();

    private Instant lastMessageAt;

    private String lastMessageContent;

    private String lastMessageSenderId;

    @Builder.Default
    private Map<String, Integer> unreadCount = new HashMap<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
