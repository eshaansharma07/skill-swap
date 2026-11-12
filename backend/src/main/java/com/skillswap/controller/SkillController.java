package com.skillswap.controller;

import com.skillswap.model.Skill;
import com.skillswap.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@Tag(name = "Skills Taxonomy", description = "Endpoints for discovering skills categories and querying standard taxonomy")
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    @Operation(summary = "Get all skills in taxonomy")
    public ResponseEntity<List<Skill>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all distinct skill categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(skillService.getAllCategories());
    }

    @GetMapping("/search")
    @Operation(summary = "Search skills by keyword or alias")
    public ResponseEntity<List<Skill>> searchSkills(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(skillService.searchSkills(q));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get skill details by unique slug")
    public ResponseEntity<Skill> getSkillBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(skillService.getSkillBySlug(slug));
    }
}
