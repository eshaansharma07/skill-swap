package com.skillswap.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sessions")
@CompoundIndexes({
        @CompoundIndex(name = "participants_status_idx", def = "{'participantIds': 1, 'status': 1}"),
        @CompoundIndex(name = "participants_start_idx", def = "{'participantIds': 1, 'startUtc': 1}")
})
public class Session {

    @Id
    private String id;

    @Indexed
    private String swapRequestId;

    @Indexed
    @Builder.Default
    private List<String> participantIds = new ArrayList<>();

    private String userAId; // Initiator
    private String userBId; // Recipient

    private UserSkill skillAOffers; // What User A teaches User B
    private UserSkill skillBOffers; // What User B teaches User A

    private Instant startUtc;
    private Instant endUtc;

    @Builder.Default
    private SessionMode mode = SessionMode.ONLINE;

    private String meetingLinkOrLocation;

    @Builder.Default
    private SessionStatus status = SessionStatus.SCHEDULED;

    @Builder.Default
    private List<String> reviewedByUserIds = new ArrayList<>();

    private Instant completedAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
