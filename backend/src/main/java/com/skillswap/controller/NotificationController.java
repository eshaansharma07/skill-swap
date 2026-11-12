package com.skillswap.controller;

import com.skillswap.dto.NotificationDto;
import com.skillswap.model.User;
import com.skillswap.service.AuthService;
import com.skillswap.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification feed, unread counter, and mark-as-read actions")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get list of notifications for the authenticated user")
    public ResponseEntity<List<NotificationDto>> getNotifications() {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(notificationService.getUserNotifications(currentUser.getId()));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User currentUser = authService.getCurrentUserEntity();
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a specific notification as read")
    public ResponseEntity<Void> markRead(@PathVariable String id) {
        User currentUser = authService.getCurrentUserEntity();
        notificationService.markRead(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications for authenticated user as read")
    public ResponseEntity<Void> markAllRead() {
        User currentUser = authService.getCurrentUserEntity();
        notificationService.markAllRead(currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
