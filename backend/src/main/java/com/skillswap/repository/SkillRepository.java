package com.skillswap.repository;

import com.skillswap.model.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends MongoRepository<Skill, String> {

    Optional<Skill> findBySlug(String slug);

    Optional<Skill> findByNameIgnoreCase(String name);

    List<Skill> findByCategoryIgnoreCase(String category);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'aliases': { '$regex': ?0, '$options': 'i' } }, { 'category': { '$regex': ?0, '$options': 'i' } } ] }")
    List<Skill> searchSkills(String keyword);
}
