package com.skillswap.service;

import com.skillswap.dto.*;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.exception.UnauthorizedException;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.*;
import com.skillswap.repository.SessionRepository;
import com.skillswap.repository.SwapRequestRepository;
import com.skillswap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SwapService {

    private final SwapRequestRepository swapRequestRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final UserMapper userMapper;

    public SwapRequestDto createSwapRequest(CreateSwapRequestDto dto) {
        User currentUser = authService.getCurrentUserEntity();

        if (currentUser.getId().equalsIgnoreCase(dto.getToUserId())) {
            throw new BadRequestException("You cannot propose a skill swap with yourself");
        }

        User recipient = userRepository.findById(dto.getToUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        if (!"ACTIVE".equalsIgnoreCase(recipient.getStatus())) {
            throw new BadRequestException("Recipient account is not active");
        }

        SwapRequest swapRequest = SwapRequest.builder()
                .fromUserId(currentUser.getId())
                .toUserId(recipient.getId())
                .offeredSkill(dto.getOfferedSkill())
                .requestedSkill(dto.getRequestedSkill())
                .proposedSlots(dto.getProposedSlots() != null ? dto.getProposedSlots() : new ArrayList<>())
                .message(dto.getMessage())
                .status(SwapStatus.PENDING)
                .build();

        SwapRequest saved = swapRequestRepository.save(swapRequest);
        return enrichSwapRequest(saved);
    }

    public SwapRequestDto acceptSwapRequest(String swapRequestId, AcceptSwapRequestDto dto) {
        User currentUser = authService.getCurrentUserEntity();
        SwapRequest swap = swapRequestRepository.findById(swapRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Swap request not found"));

        if (!swap.getToUserId().equalsIgnoreCase(currentUser.getId())) {
            throw new UnauthorizedException("Only the recipient can accept this swap request");
        }

        if (swap.getStatus() != SwapStatus.PENDING && swap.getStatus() != SwapStatus.COUNTERED) {
            throw new BadRequestException("Cannot accept swap request in " + swap.getStatus() + " state");
        }

        ProposedSlot selectedSlot = dto.getSelectedSlot();
        if (selectedSlot == null && !swap.getProposedSlots().isEmpty()) {
            selectedSlot = swap.getProposedSlots().get(0);
        }

        Instant startUtc = selectedSlot != null && selectedSlot.getStartUtc() != null
                ? selectedSlot.getStartUtc()
                : Instant.now().plus(Duration.ofDays(1));
        Instant endUtc = selectedSlot != null && selectedSlot.getEndUtc() != null
                ? selectedSlot.getEndUtc()
                : startUtc.plus(Duration.ofHours(1));

        // Conflict check
        List<Session> conflictsA = sessionRepository.findConflictingSessions(swap.getFromUserId(), startUtc, endUtc);
        List<Session> conflictsB = sessionRepository.findConflictingSessions(swap.getToUserId(), startUtc, endUtc);
        if (!conflictsA.isEmpty() || !conflictsB.isEmpty()) {
            log.warn("Warning: Scheduled swap has existing overlapping session; proceeding with explicit user acceptance.");
        }

        SessionMode mode = selectedSlot != null && selectedSlot.getMode() != null
                ? selectedSlot.getMode()
                : SessionMode.ONLINE;

        String meetingLink = dto.getCustomMeetingLink();
        if (meetingLink == null || meetingLink.isBlank()) {
            meetingLink = mode == SessionMode.ONLINE
                    ? "https://meet.skillswap.io/room/" + UUID.randomUUID().toString().substring(0, 8)
                    : (selectedSlot != null ? selectedSlot.getLocationOrLink() : "Community Library / In-Person Hub");
        }

        Session session = Session.builder()
                .swapRequestId(swap.getId())
                .participantIds(List.of(swap.getFromUserId(), swap.getToUserId()))
                .userAId(swap.getFromUserId())
                .userBId(swap.getToUserId())
                .skillAOffers(swap.getOfferedSkill())
                .skillBOffers(swap.getRequestedSkill())
                .startUtc(startUtc)
                .endUtc(endUtc)
                .mode(mode)
                .meetingLinkOrLocation(meetingLink)
                .status(SessionStatus.SCHEDULED)
                .build();

        Session savedSession = sessionRepository.save(session);

        swap.setStatus(SwapStatus.ACCEPTED);
        swap.setSessionId(savedSession.getId());
        SwapRequest updated = swapRequestRepository.save(swap);

        return enrichSwapRequest(updated);
    }

    public SwapRequestDto declineSwapRequest(String swapRequestId) {
        User currentUser = authService.getCurrentUserEntity();
        SwapRequest swap = swapRequestRepository.findById(swapRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Swap request not found"));

        if (!swap.getToUserId().equalsIgnoreCase(currentUser.getId())) {
            throw new UnauthorizedException("Only the recipient can decline this swap request");
        }

        swap.setStatus(SwapStatus.DECLINED);
        SwapRequest updated = swapRequestRepository.save(swap);
        return enrichSwapRequest(updated);
    }

    public SwapRequestDto counterSwapRequest(String swapRequestId, CounterSwapRequestDto dto) {
        User currentUser = authService.getCurrentUserEntity();
        SwapRequest swap = swapRequestRepository.findById(swapRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Swap request not found"));

        if (!swap.getToUserId().equalsIgnoreCase(currentUser.getId()) && !swap.getFromUserId().equalsIgnoreCase(currentUser.getId())) {
            throw new UnauthorizedException("You are not a participant in this swap request");
        }

        if (dto.getCounterOfferedSkill() != null) swap.setOfferedSkill(dto.getCounterOfferedSkill());
        if (dto.getCounterRequestedSkill() != null) swap.setRequestedSkill(dto.getCounterRequestedSkill());
        if (dto.getCounterProposedSlots() != null && !dto.getCounterProposedSlots().isEmpty()) {
            swap.setProposedSlots(dto.getCounterProposedSlots());
        }
        swap.setCounterProposalMessage(dto.getCounterMessage());
        swap.setStatus(SwapStatus.COUNTERED);

        SwapRequest updated = swapRequestRepository.save(swap);
        return enrichSwapRequest(updated);
    }

    public SwapRequestDto cancelSwapRequest(String swapRequestId) {
        User currentUser = authService.getCurrentUserEntity();
        SwapRequest swap = swapRequestRepository.findById(swapRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Swap request not found"));

        if (!swap.getFromUserId().equalsIgnoreCase(currentUser.getId())) {
            throw new UnauthorizedException("Only the initiator can cancel this swap request");
        }

        swap.setStatus(SwapStatus.CANCELLED);
        SwapRequest updated = swapRequestRepository.save(swap);
        return enrichSwapRequest(updated);
    }

    public List<SwapRequestDto> getSwapRequestsForCurrentUser(String type) {
        User currentUser = authService.getCurrentUserEntity();
        List<SwapRequest> list;

        if ("sent".equalsIgnoreCase(type)) {
            list = swapRequestRepository.findByFromUserIdOrderByCreatedAtDesc(currentUser.getId());
        } else if ("received".equalsIgnoreCase(type)) {
            list = swapRequestRepository.findByToUserIdOrderByCreatedAtDesc(currentUser.getId());
        } else {
            list = swapRequestRepository.findAllForUser(currentUser.getId());
        }

        return list.stream().map(this::enrichSwapRequest).toList();
    }

    public SwapRequestDto getSwapRequestById(String id) {
        SwapRequest swap = swapRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Swap request not found"));
        return enrichSwapRequest(swap);
    }

    private SwapRequestDto enrichSwapRequest(SwapRequest swap) {
        User fromUser = userRepository.findById(swap.getFromUserId()).orElse(null);
        User toUser = userRepository.findById(swap.getToUserId()).orElse(null);

        return SwapRequestDto.builder()
                .id(swap.getId())
                .fromUserId(swap.getFromUserId())
                .toUserId(swap.getToUserId())
                .fromUser(fromUser != null ? userMapper.toDto(fromUser) : null)
                .toUser(toUser != null ? userMapper.toDto(toUser) : null)
                .offeredSkill(swap.getOfferedSkill())
                .requestedSkill(swap.getRequestedSkill())
                .status(swap.getStatus())
                .proposedSlots(swap.getProposedSlots())
                .counterProposalMessage(swap.getCounterProposalMessage())
                .message(swap.getMessage())
                .sessionId(swap.getSessionId())
                .createdAt(swap.getCreatedAt())
                .updatedAt(swap.getUpdatedAt())
                .build();
    }
}
