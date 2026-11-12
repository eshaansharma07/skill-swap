package com.skillswap.repository;

import com.skillswap.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByRevieweeIdOrderByCreatedAtDesc(String revieweeId);

    List<Review> findBySessionId(String sessionId);

    Optional<Review> findBySessionIdAndReviewerId(String sessionId, String reviewerId);

    boolean existsBySessionIdAndReviewerId(String sessionId, String reviewerId);
}
