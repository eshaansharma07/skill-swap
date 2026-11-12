package com.skillswap.service;

import com.skillswap.dto.NotificationDto;
import com.skillswap.model.Notification;
import com.skillswap.model.NotificationType;
import com.skillswap.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationDto createNotification(String userId, NotificationType type, String title, String message, Map<String, Object> payload) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .payload(payload)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = toDto(saved);

        // Push live via STOMP WebSocket
        try {
            messagingTemplate.convertAndSend("/queue/notifications." + userId, dto);
        } catch (Exception ex) {
            log.warn("Could not send real-time notification to user {}: {}", userId, ex.getMessage());
        }

        return dto;
    }

    public List<NotificationDto> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto)
                .toList();
    }

    public void markRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equalsIgnoreCase(userId)) {
                n.setReadAt(Instant.now());
                notificationRepository.save(n);
            }
        });
    }

    public void markAllRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(n -> n.getReadAt() == null)
                .toList();

        Instant now = Instant.now();
        unread.forEach(n -> n.setReadAt(now));
        notificationRepository.saveAll(unread);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .payload(n.getPayload())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
