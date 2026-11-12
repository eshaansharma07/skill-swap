package com.skillswap.service;

import com.skillswap.dto.ConversationDto;
import com.skillswap.dto.MessageDto;
import com.skillswap.dto.SendMessageDto;
import com.skillswap.dto.UserDto;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.exception.UnauthorizedException;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.Conversation;
import com.skillswap.model.Message;
import com.skillswap.model.NotificationType;
import com.skillswap.model.User;
import com.skillswap.repository.ConversationRepository;
import com.skillswap.repository.MessageRepository;
import com.skillswap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserMapper userMapper;

    public Conversation getOrCreateConversation(String userAId, String userBId) {
        Optional<Conversation> existing = conversationRepository.findBetweenUsers(userAId, userBId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Conversation newConv = Conversation.builder()
                .participantIds(List.of(userAId, userBId))
                .lastMessageAt(Instant.now())
                .unreadCount(new HashMap<>())
                .build();
        newConv.getUnreadCount().put(userAId, 0);
        newConv.getUnreadCount().put(userBId, 0);

        return conversationRepository.save(newConv);
    }

    public List<ConversationDto> getUserConversations(String currentUserId) {
        List<Conversation> conversations = conversationRepository.findByParticipantIdsContainingOrderByLastMessageAtDesc(currentUserId);
        List<ConversationDto> dtos = new ArrayList<>();

        for (Conversation conv : conversations) {
            String otherUserId = conv.getParticipantIds().stream()
                    .filter(id -> !id.equalsIgnoreCase(currentUserId))
                    .findFirst()
                    .orElse(null);

            User otherUser = otherUserId != null ? userRepository.findById(otherUserId).orElse(null) : null;
            int unread = conv.getUnreadCount() != null ? conv.getUnreadCount().getOrDefault(currentUserId, 0) : 0;

            dtos.add(ConversationDto.builder()
                    .id(conv.getId())
                    .participantIds(conv.getParticipantIds())
                    .otherUser(otherUser != null ? userMapper.toDto(otherUser) : null)
                    .lastMessageAt(conv.getLastMessageAt())
                    .lastMessageContent(conv.getLastMessageContent())
                    .lastMessageSenderId(conv.getLastMessageSenderId())
                    .unreadCount(unread)
                    .createdAt(conv.getCreatedAt())
                    .build());
        }

        return dtos;
    }

    public List<MessageDto> getMessages(String conversationId, String currentUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(currentUserId)) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }

        markConversationRead(conversationId, currentUserId);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(this::toMessageDto)
                .toList();
    }

    public MessageDto sendMessage(String senderId, SendMessageDto dto) {
        Conversation conversation;
        String recipientId = dto.getRecipientId();

        if (dto.getConversationId() != null && !dto.getConversationId().isBlank()) {
            conversation = conversationRepository.findById(dto.getConversationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
            recipientId = conversation.getParticipantIds().stream()
                    .filter(id -> !id.equalsIgnoreCase(senderId))
                    .findFirst()
                    .orElse(recipientId);
        } else if (recipientId != null) {
            conversation = getOrCreateConversation(senderId, recipientId);
        } else {
            throw new IllegalArgumentException("Either conversationId or recipientId must be provided");
        }

        Message message = Message.builder()
                .conversationId(conversation.getId())
                .senderId(senderId)
                .recipientId(recipientId)
                .content(dto.getContent().trim())
                .build();

        Message savedMessage = messageRepository.save(message);

        // Update conversation summary
        conversation.setLastMessageAt(savedMessage.getCreatedAt());
        conversation.setLastMessageContent(savedMessage.getContent());
        conversation.setLastMessageSenderId(senderId);

        if (conversation.getUnreadCount() == null) {
            conversation.setUnreadCount(new HashMap<>());
        }
        int currentUnread = conversation.getUnreadCount().getOrDefault(recipientId, 0);
        conversation.getUnreadCount().put(recipientId, currentUnread + 1);
        conversationRepository.save(conversation);

        MessageDto messageDto = toMessageDto(savedMessage);

        // Broadcast to STOMP destination: /topic/conversation.{conversationId}
        try {
            messagingTemplate.convertAndSend("/topic/conversation." + conversation.getId(), messageDto);
        } catch (Exception ex) {
            log.warn("Could not broadcast message over WebSocket: {}", ex.getMessage());
        }

        // Send in-app notification to recipient
        User sender = userRepository.findById(senderId).orElse(null);
        String senderName = sender != null ? sender.getName() : "A peer";
        notificationService.createNotification(
                recipientId,
                NotificationType.NEW_MESSAGE,
                "New message from " + senderName,
                savedMessage.getContent(),
                Map.of("conversationId", conversation.getId(), "senderId", senderId)
        );

        return messageDto;
    }

    public void markConversationRead(String conversationId, String currentUserId) {
        conversationRepository.findById(conversationId).ifPresent(conv -> {
            if (conv.getUnreadCount() != null && conv.getUnreadCount().containsKey(currentUserId)) {
                conv.getUnreadCount().put(currentUserId, 0);
                conversationRepository.save(conv);
            }
        });

        List<Message> unread = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .filter(m -> currentUserId.equalsIgnoreCase(m.getRecipientId()) && m.getReadAt() == null)
                .toList();

        if (!unread.isEmpty()) {
            Instant now = Instant.now();
            unread.forEach(m -> m.setReadAt(now));
            messageRepository.saveAll(unread);
        }
    }

    private MessageDto toMessageDto(Message m) {
        return MessageDto.builder()
                .id(m.getId())
                .conversationId(m.getConversationId())
                .senderId(m.getSenderId())
                .recipientId(m.getRecipientId())
                .content(m.getContent())
                .readAt(m.getReadAt())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
