package com.skillswap.repository;

import com.skillswap.model.SwapRequest;
import com.skillswap.model.SwapStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SwapRequestRepository extends MongoRepository<SwapRequest, String> {

    List<SwapRequest> findByFromUserIdOrderByCreatedAtDesc(String fromUserId);

    List<SwapRequest> findByToUserIdOrderByCreatedAtDesc(String toUserId);

    @Query("{ '$or': [ { 'fromUserId': ?0 }, { 'toUserId': ?0 } ] }")
    List<SwapRequest> findAllForUser(String userId);

    @Query("{ '$or': [ { 'fromUserId': ?0 }, { 'toUserId': ?0 } ], 'status': ?1 }")
    List<SwapRequest> findAllForUserByStatus(String userId, SwapStatus status);
}
