package com.skillswap.service;

import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.model.Skill;
import com.skillswap.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public List<Skill> searchSkills(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return skillRepository.findAll();
        }
        return skillRepository.searchSkills(keyword.trim());
    }

    public Skill getSkillBySlug(String slug) {
        return skillRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with slug: " + slug));
    }

    public List<String> getAllCategories() {
        return skillRepository.findAll().stream()
                .map(Skill::getCategory)
                .distinct()
                .sorted()
                .toList();
    }

    public List<Skill> getSkillsByCategory(String category) {
        return skillRepository.findByCategoryIgnoreCase(category);
    }
}
