package com.skillswap.repository;

import com.skillswap.model.Session;
import com.skillswap.model.SessionStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface SessionRepository extends MongoRepository<Session, String> {

    List<Session> findByParticipantIdsContainingOrderByStartUtcDesc(String userId);

    @Query("{ 'participantIds': ?0, 'status': ?1 }")
    List<Session> findByUserIdAndStatus(String userId, SessionStatus status);

    @Query("{ 'participantIds': ?0, 'status': 'SCHEDULED', 'startUtc': { '$gte': ?1 } }")
    List<Session> findUpcomingSessions(String userId, Instant now);

    @Query("{ 'participantIds': ?0, '$or': [ { 'status': 'COMPLETED' }, { 'startUtc': { '$lt': ?1 } } ] }")
    List<Session> findPastSessions(String userId, Instant now);

    // Conflict check query: returns existing scheduled sessions for a participant overlapping [startUtc, endUtc]
    @Query("{ 'participantIds': ?0, 'status': 'SCHEDULED', 'startUtc': { '$lt': ?2 }, 'endUtc': { '$gt': ?1 } }")
    List<Session> findConflictingSessions(String userId, Instant startUtc, Instant endUtc);
}
