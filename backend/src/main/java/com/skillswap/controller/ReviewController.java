package com.skillswap.controller;

import com.skillswap.dto.CreateReviewDto;
import com.skillswap.dto.ReviewDto;
import com.skillswap.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews & Reputation", description = "Post-session review submission, rating calculation, and skill endorsements")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Submit a rating and review for a completed swap session")
    public ResponseEntity<ReviewDto> createReview(@Valid @RequestBody CreateReviewDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(dto));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all reviews and endorsements for a user")
    public ResponseEntity<List<ReviewDto>> getReviewsForUser(@PathVariable String userId) {
        return ResponseEntity.ok(reviewService.getReviewsForUser(userId));
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get reviews submitted for a specific session")
    public ResponseEntity<List<ReviewDto>> getReviewsForSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(reviewService.getReviewsForSession(sessionId));
    }
}
