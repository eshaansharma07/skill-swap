package com.skillswap.repository;

import com.skillswap.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    long countByConversationIdAndRecipientIdAndReadAtIsNull(String conversationId, String recipientId);
}
