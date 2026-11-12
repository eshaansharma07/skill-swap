package com.skillswap.repository;

import com.skillswap.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.query.TextCriteria;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    @Query("{ '$or': [ { 'email': { '$regex': '^?0$', '$options': 'i' } }, { 'username': { '$regex': '^?0$', '$options': 'i' } } ] }")
    Optional<User> findByEmailOrUsername(String identifier);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    Page<User> findAllBy(TextCriteria criteria, Pageable pageable);

    @Query("{ 'status': 'ACTIVE', 'id': { '$ne': ?0 }, 'skills': { '$elemMatch': { 'type': ?1, 'skillId': ?2 } } }")
    List<User> findCandidatesBySkill(String excludeUserId, String skillType, String skillId);

    @Query("{ 'status': 'ACTIVE', 'id': { '$ne': ?0 } }")
    List<User> findAllActiveExcept(String excludeUserId);
}
