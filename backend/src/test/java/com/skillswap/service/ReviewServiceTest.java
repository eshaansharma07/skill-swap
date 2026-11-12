package com.skillswap.service;

import com.skillswap.dto.CreateReviewDto;
import com.skillswap.dto.ReviewDto;
import com.skillswap.exception.BadRequestException;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.*;
import com.skillswap.repository.ReviewRepository;
import com.skillswap.repository.SessionRepository;
import com.skillswap.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthService authService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private ReviewService reviewService;

    private User reviewer;
    private User reviewee;
    private Session completedSession;

    @BeforeEach
    void setUp() {
        reviewer = User.builder().id("u1").name("Alex").build();
        reviewee = User.builder()
                .id("u2")
                .name("Elena")
                .reputation(UserReputation.builder().ratingAverage(5.0).totalReviews(1).badges(new ArrayList<>()).build())
                .build();

        completedSession = Session.builder()
                .id("sess1")
                .participantIds(List.of("u1", "u2"))
                .status(SessionStatus.COMPLETED)
                .reviewedByUserIds(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should successfully submit a review for completed session and update rating")
    void testCreateReviewSuccess() {
        when(authService.getCurrentUserEntity()).thenReturn(reviewer);
        when(sessionRepository.findById("sess1")).thenReturn(Optional.of(completedSession));
        when(reviewRepository.existsBySessionIdAndReviewerId("sess1", "u1")).thenReturn(false);
        when(userRepository.findById("u2")).thenReturn(Optional.of(reviewee));

        Review savedReview = Review.builder()
                .id("rev1")
                .sessionId("sess1")
                .reviewerId("u1")
                .revieweeId("u2")
                .rating(5)
                .text("Excellent session, very clear explanations!")
                .endorsedSkill("Python")
                .build();

        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);

        CreateReviewDto dto = CreateReviewDto.builder()
                .sessionId("sess1")
                .revieweeId("u2")
                .rating(5)
                .text("Excellent session, very clear explanations!")
                .endorsedSkill("Python")
                .build();

        ReviewDto result = reviewService.createReview(dto);

        assertNotNull(result);
        assertEquals(5, result.getRating());
        assertEquals("Python", result.getEndorsedSkill());

        verify(reviewRepository).save(any(Review.class));
        verify(userRepository).save(reviewee);
        verify(notificationService).createNotification(eq("u2"), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should reject review if session is not in COMPLETED status")
    void testCannotReviewIncompleteSession() {
        when(authService.getCurrentUserEntity()).thenReturn(reviewer);
        completedSession.setStatus(SessionStatus.SCHEDULED);
        when(sessionRepository.findById("sess1")).thenReturn(Optional.of(completedSession));

        CreateReviewDto dto = CreateReviewDto.builder()
                .sessionId("sess1")
                .revieweeId("u2")
                .rating(5)
                .text("Great")
                .build();

        assertThrows(BadRequestException.class, () -> reviewService.createReview(dto));
        verify(reviewRepository, never()).save(any());
    }
}
