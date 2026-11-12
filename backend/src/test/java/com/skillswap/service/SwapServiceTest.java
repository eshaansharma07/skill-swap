package com.skillswap.service;

import com.skillswap.dto.AcceptSwapRequestDto;
import com.skillswap.dto.CreateSwapRequestDto;
import com.skillswap.dto.SwapRequestDto;
import com.skillswap.exception.BadRequestException;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.*;
import com.skillswap.repository.SessionRepository;
import com.skillswap.repository.SwapRequestRepository;
import com.skillswap.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SwapServiceTest {

    @Mock
    private SwapRequestRepository swapRequestRepository;

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthService authService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private SwapService swapService;

    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        userA = User.builder().id("uA").name("Alex").status("ACTIVE").build();
        userB = User.builder().id("uB").name("Elena").status("ACTIVE").build();
    }

    @Test
    @DisplayName("Should prevent user from proposing a swap to themselves")
    void testCannotSwapWithSelf() {
        when(authService.getCurrentUserEntity()).thenReturn(userA);

        CreateSwapRequestDto dto = CreateSwapRequestDto.builder()
                .toUserId("uA")
                .offeredSkill(UserSkill.builder().skillName("Python").build())
                .requestedSkill(UserSkill.builder().skillName("Guitar").build())
                .build();

        assertThrows(BadRequestException.class, () -> swapService.createSwapRequest(dto));
        verify(swapRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Accepting a pending swap creates a scheduled session and updates swap status to ACCEPTED")
    void testAcceptSwapRequest() {
        when(authService.getCurrentUserEntity()).thenReturn(userB);

        SwapRequest pendingSwap = SwapRequest.builder()
                .id("swap1")
                .fromUserId("uA")
                .toUserId("uB")
                .offeredSkill(UserSkill.builder().skillName("Python").build())
                .requestedSkill(UserSkill.builder().skillName("Guitar").build())
                .status(SwapStatus.PENDING)
                .proposedSlots(List.of(
                        ProposedSlot.builder().startUtc(Instant.now().plusSeconds(3600)).endUtc(Instant.now().plusSeconds(7200)).build()
                ))
                .build();

        Session createdSession = Session.builder()
                .id("sess1")
                .swapRequestId("swap1")
                .userAId("uA")
                .userBId("uB")
                .status(SessionStatus.SCHEDULED)
                .build();

        when(swapRequestRepository.findById("swap1")).thenReturn(Optional.of(pendingSwap));
        when(sessionRepository.findConflictingSessions(any(), any(), any())).thenReturn(Collections.emptyList());
        when(sessionRepository.save(any(Session.class))).thenReturn(createdSession);
        when(swapRequestRepository.save(any(SwapRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        AcceptSwapRequestDto acceptDto = new AcceptSwapRequestDto();
        SwapRequestDto result = swapService.acceptSwapRequest("swap1", acceptDto);

        assertNotNull(result);
        assertEquals(SwapStatus.ACCEPTED, result.getStatus());
        assertEquals("sess1", result.getSessionId());
        verify(sessionRepository).save(any(Session.class));
    }
}
