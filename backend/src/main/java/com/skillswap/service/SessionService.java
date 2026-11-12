package com.skillswap.service;

import com.skillswap.dto.RescheduleSessionDto;
import com.skillswap.dto.SessionDto;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.exception.UnauthorizedException;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.Session;
import com.skillswap.model.SessionStatus;
import com.skillswap.model.User;
import com.skillswap.repository.SessionRepository;
import com.skillswap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final UserMapper userMapper;

    public List<SessionDto> getUpcomingSessions() {
        User currentUser = authService.getCurrentUserEntity();
        List<Session> sessions = sessionRepository.findUpcomingSessions(currentUser.getId(), Instant.now());
        return sessions.stream().map(this::enrichSession).toList();
    }

    public List<SessionDto> getPastSessions() {
        User currentUser = authService.getCurrentUserEntity();
        List<Session> sessions = sessionRepository.findPastSessions(currentUser.getId(), Instant.now());
        return sessions.stream().map(this::enrichSession).toList();
    }

    public SessionDto getSessionById(String id) {
        User currentUser = authService.getCurrentUserEntity();
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + id));

        if (!session.getParticipantIds().contains(currentUser.getId())) {
            throw new UnauthorizedException("You are not a participant in this session");
        }

        return enrichSession(session);
    }

    public SessionDto completeSession(String id) {
        User currentUser = authService.getCurrentUserEntity();
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getParticipantIds().contains(currentUser.getId())) {
            throw new UnauthorizedException("You are not a participant in this session");
        }

        session.setStatus(SessionStatus.COMPLETED);
        session.setCompletedAt(Instant.now());
        Session updated = sessionRepository.save(session);

        // Increment sessionsCompleted for both participants
        for (String participantId : session.getParticipantIds()) {
            userRepository.findById(participantId).ifPresent(p -> {
                if (p.getReputation() != null) {
                    p.getReputation().setSessionsCompleted(p.getReputation().getSessionsCompleted() + 1);
                    userRepository.save(p);
                }
            });
        }

        return enrichSession(updated);
    }

    public SessionDto cancelSession(String id) {
        User currentUser = authService.getCurrentUserEntity();
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getParticipantIds().contains(currentUser.getId())) {
            throw new UnauthorizedException("You are not a participant in this session");
        }

        session.setStatus(SessionStatus.CANCELLED);
        Session updated = sessionRepository.save(session);
        return enrichSession(updated);
    }

    public SessionDto rescheduleSession(String id, RescheduleSessionDto dto) {
        User currentUser = authService.getCurrentUserEntity();
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getParticipantIds().contains(currentUser.getId())) {
            throw new UnauthorizedException("You are not a participant in this session");
        }

        if (dto.getNewStartUtc().isBefore(Instant.now())) {
            throw new BadRequestException("Rescheduled start time must be in the future");
        }

        session.setStartUtc(dto.getNewStartUtc());
        session.setEndUtc(dto.getNewEndUtc());
        session.setStatus(SessionStatus.RESCHEDULED);

        Session updated = sessionRepository.save(session);
        return enrichSession(updated);
    }

    private SessionDto enrichSession(Session session) {
        User userA = userRepository.findById(session.getUserAId()).orElse(null);
        User userB = userRepository.findById(session.getUserBId()).orElse(null);

        return SessionDto.builder()
                .id(session.getId())
                .swapRequestId(session.getSwapRequestId())
                .participantIds(session.getParticipantIds())
                .userA(userA != null ? userMapper.toDto(userA) : null)
                .userB(userB != null ? userMapper.toDto(userB) : null)
                .skillAOffers(session.getSkillAOffers())
                .skillBOffers(session.getSkillBOffers())
                .startUtc(session.getStartUtc())
                .endUtc(session.getEndUtc())
                .mode(session.getMode())
                .meetingLinkOrLocation(session.getMeetingLinkOrLocation())
                .status(session.getStatus())
                .reviewedByUserIds(session.getReviewedByUserIds())
                .completedAt(session.getCompletedAt())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
