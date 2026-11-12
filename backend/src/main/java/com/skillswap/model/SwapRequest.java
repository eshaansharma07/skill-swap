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
@Document(collection = "swapRequests")
@CompoundIndexes({
        @CompoundIndex(name = "from_user_status_idx", def = "{'fromUserId': 1, 'status': 1}"),
        @CompoundIndex(name = "to_user_status_idx", def = "{'toUserId': 1, 'status': 1}")
})
public class SwapRequest {

    @Id
    private String id;

    @Indexed
    private String fromUserId;

    @Indexed
    private String toUserId;

    private UserSkill offeredSkill; // What initiator offers to teach

    private UserSkill requestedSkill; // What initiator wants to learn

    @Builder.Default
    private SwapStatus status = SwapStatus.PENDING;

    @Builder.Default
    private List<ProposedSlot> proposedSlots = new ArrayList<>();

    private String counterProposalMessage;

    private String message;

    private String sessionId; // Linked session when accepted

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
