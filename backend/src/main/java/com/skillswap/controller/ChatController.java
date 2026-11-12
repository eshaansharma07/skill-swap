package com.skillswap.controller;

import com.skillswap.dto.ConversationDto;
import com.skillswap.dto.MessageDto;
import com.skillswap.dto.SendMessageDto;
import com.skillswap.model.User;
import com.skillswap.service.AuthService;
import com.skillswap.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Tag(name = "Messaging & Chat", description = "Endpoints for direct messaging, conversation threads, and STOMP message delivery")
public class ChatController {

    private final ChatService chatService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get all active conversations for the authenticated user")
    public ResponseEntity<List<ConversationDto>> getConversations() {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(chatService.getUserConversations(currentUser.getId()));
    }

    @GetMapping("/{id}/messages")
    @Operation(summary = "Get all messages in a specific conversation")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable String id) {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(chatService.getMessages(id, currentUser.getId()));
    }

    @PostMapping("/messages")
    @Operation(summary = "Send a new chat message (REST fallback)")
    public ResponseEntity<MessageDto> sendMessage(@Valid @RequestBody SendMessageDto dto) {
        User currentUser = authService.getCurrentUserEntity();
        MessageDto sent = chatService.sendMessage(currentUser.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(sent);
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark conversation messages as read")
    public ResponseEntity<Void> markRead(@PathVariable String id) {
        User currentUser = authService.getCurrentUserEntity();
        chatService.markConversationRead(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    // STOMP WebSocket Message Mapping
    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(@Payload SendMessageDto dto, Principal principal) {
        if (principal != null) {
            chatService.sendMessage(principal.getName(), dto);
        }
    }
}
