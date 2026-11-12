package com.skillswap.repository;

import com.skillswap.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    List<Conversation> findByParticipantIdsContainingOrderByLastMessageAtDesc(String userId);

    @Query("{ 'participantIds': { '$all': [?0, ?1] } }")
    Optional<Conversation> findBetweenUsers(String userA, String userB);
}
