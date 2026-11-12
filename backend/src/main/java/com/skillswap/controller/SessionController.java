package com.skillswap.controller;

import com.skillswap.dto.RescheduleSessionDto;
import com.skillswap.dto.SessionDto;
import com.skillswap.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Tag(name = "Sessions", description = "Endpoints for managing scheduled skill swap sessions, meeting links, and completion flow")
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    @Operation(summary = "Get all sessions for authenticated user")
    public ResponseEntity<List<SessionDto>> getAllSessions(@RequestParam(required = false) String status) {
        if ("UPCOMING".equalsIgnoreCase(status) || "SCHEDULED".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(sessionService.getUpcomingSessions());
        }
        if ("PAST".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(sessionService.getPastSessions());
        }
        List<SessionDto> all = new java.util.ArrayList<>(sessionService.getUpcomingSessions());
        all.addAll(sessionService.getPastSessions());
        return ResponseEntity.ok(all);
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming scheduled sessions for authenticated user")
    public ResponseEntity<List<SessionDto>> getUpcomingSessions() {
        return ResponseEntity.ok(sessionService.getUpcomingSessions());
    }

    @GetMapping("/past")
    @Operation(summary = "Get past / completed sessions for authenticated user")
    public ResponseEntity<List<SessionDto>> getPastSessions() {
        return ResponseEntity.ok(sessionService.getPastSessions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get session details by ID")
    public ResponseEntity<SessionDto> getSessionById(@PathVariable String id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "Mark a session as completed")
    public ResponseEntity<SessionDto> completeSession(@PathVariable String id) {
        return ResponseEntity.ok(sessionService.completeSession(id));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a scheduled session")
    public ResponseEntity<SessionDto> cancelSession(@PathVariable String id) {
        return ResponseEntity.ok(sessionService.cancelSession(id));
    }

    @PutMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule a session to new start and end time")
    public ResponseEntity<SessionDto> rescheduleSession(
            @PathVariable String id,
            @Valid @RequestBody RescheduleSessionDto dto) {
        return ResponseEntity.ok(sessionService.rescheduleSession(id, dto));
    }
}
