package com.skillswap.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
@CompoundIndexes({
        @CompoundIndex(name = "session_reviewer_unique_idx", def = "{'sessionId': 1, 'reviewerId': 1}", unique = true),
        @CompoundIndex(name = "reviewee_created_idx", def = "{'revieweeId': 1, 'createdAt': -1}")
})
public class Review {

    @Id
    private String id;

    @Indexed
    private String sessionId;

    @Indexed
    private String reviewerId;

    @Indexed
    private String revieweeId;

    private Integer rating; // 1 to 5

    private String text;

    private String endorsedSkill;

    @CreatedDate
    private Instant createdAt;
}
