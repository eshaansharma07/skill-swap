package com.skillswap.service;

import com.skillswap.dto.CreateReviewDto;
import com.skillswap.dto.ReviewDto;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.exception.UnauthorizedException;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.*;
import com.skillswap.repository.ReviewRepository;
import com.skillswap.repository.SessionRepository;
import com.skillswap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final NotificationService notificationService;
    private final UserMapper userMapper;

    public ReviewDto createReview(CreateReviewDto dto) {
        User currentUser = authService.getCurrentUserEntity();

        Session session = sessionRepository.findById(dto.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getParticipantIds().contains(currentUser.getId())) {
            throw new UnauthorizedException("You were not a participant in this session");
        }

        if (session.getStatus() != SessionStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted for completed sessions");
        }

        if (reviewRepository.existsBySessionIdAndReviewerId(dto.getSessionId(), currentUser.getId())) {
            throw new BadRequestException("You have already submitted a review for this session");
        }

        if (currentUser.getId().equalsIgnoreCase(dto.getRevieweeId())) {
            throw new BadRequestException("You cannot review yourself");
        }

        User reviewee = userRepository.findById(dto.getRevieweeId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewee user not found"));

        Review review = Review.builder()
                .sessionId(session.getId())
                .reviewerId(currentUser.getId())
                .revieweeId(reviewee.getId())
                .rating(dto.getRating())
                .text(dto.getText().trim())
                .endorsedSkill(dto.getEndorsedSkill())
                .build();

        Review saved = reviewRepository.save(review);

        // Mark reviewer in session reviewed list
        if (session.getReviewedByUserIds() == null) {
            session.setReviewedByUserIds(new ArrayList<>());
        }
        if (!session.getReviewedByUserIds().contains(currentUser.getId())) {
            session.getReviewedByUserIds().add(currentUser.getId());
            sessionRepository.save(session);
        }

        // Recalculate reviewee rating & reputation
        updateUserReputation(reviewee, dto.getRating());

        // Send in-app notification to reviewee
        notificationService.createNotification(
                reviewee.getId(),
                NotificationType.REVIEW_RECEIVED,
                "New review from " + currentUser.getName(),
                String.format("%s gave you a %d ★ rating: \"%s\"", currentUser.getName(), dto.getRating(), dto.getText()),
                Map.of("sessionId", session.getId(), "rating", dto.getRating())
        );

        return enrichReview(saved);
    }

    public List<ReviewDto> getReviewsForUser(String userId) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId).stream()
                .map(this::enrichReview)
                .toList();
    }

    public List<ReviewDto> getReviewsForSession(String sessionId) {
        return reviewRepository.findBySessionId(sessionId).stream()
                .map(this::enrichReview)
                .toList();
    }

    private void updateUserReputation(User user, int newRating) {
        if (user.getReputation() == null) {
            user.setReputation(new UserReputation());
        }

        UserReputation rep = user.getReputation();
        int total = rep.getTotalReviews() != null ? rep.getTotalReviews() : 0;
        double currentAvg = rep.getRatingAverage() != null ? rep.getRatingAverage() : 5.0;

        double updatedAvg = (currentAvg * total + newRating) / (total + 1);
        rep.setTotalReviews(total + 1);
        rep.setRatingAverage(Math.round(updatedAvg * 10.0) / 10.0);

        // Badges: "Top Rated" for rating >= 4.8 with 3+ reviews
        if (rep.getRatingAverage() >= 4.8 && rep.getTotalReviews() >= 3) {
            if (!rep.getBadges().contains("Top Rated")) {
                rep.getBadges().add("Top Rated");
            }
        }

        userRepository.save(user);
    }

    private ReviewDto enrichReview(Review r) {
        User reviewer = userRepository.findById(r.getReviewerId()).orElse(null);
        User reviewee = userRepository.findById(r.getRevieweeId()).orElse(null);

        return ReviewDto.builder()
                .id(r.getId())
                .sessionId(r.getSessionId())
                .reviewerId(r.getReviewerId())
                .revieweeId(r.getRevieweeId())
                .reviewer(reviewer != null ? userMapper.toDto(reviewer) : null)
                .reviewee(reviewee != null ? userMapper.toDto(reviewee) : null)
                .rating(r.getRating())
                .text(r.getText())
                .endorsedSkill(r.getEndorsedSkill())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
