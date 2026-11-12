package com.skillswap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private String id;
    private List<String> participantIds;
    private UserDto otherUser;
    private Instant lastMessageAt;
    private String lastMessageContent;
    private String lastMessageSenderId;
    private int unreadCount;
    private Instant createdAt;
}
