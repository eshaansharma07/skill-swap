package com.skillswap.service;

import com.skillswap.dto.MatchDto;
import com.skillswap.dto.UserDto;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.*;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private MatchingService matchingService;

    private User userA;
    private User userB_Mutual;
    private User userC_OneSided;
    private User userD_NoOverlap;

    @BeforeEach
    void setUp() {
        // User A: Teaches Python (Expert), Wants Guitar (Beginner)
        userA = User.builder()
                .id("uA")
                .name("Alex")
                .email("alex@example.com")
                .timezone("UTC")
                .languages(List.of("English", "Spanish"))
                .location(UserLocation.builder().mode(SessionMode.ONLINE).city("San Francisco").build())
                .availability(List.of(
                        new AvailabilitySlot("MONDAY", List.of("EVENING")),
                        new AvailabilitySlot("WEDNESDAY", List.of("EVENING"))
                ))
                .skills(List.of(
                        UserSkill.builder().skillName("Python").category("Tech").type(SkillType.TEACH).level(SkillLevel.EXPERT).build(),
                        UserSkill.builder().skillName("Guitar").category("Music").type(SkillType.LEARN).level(SkillLevel.BEGINNER).build()
                ))
                .build();

        // User B: Direct Mutual Match! Teaches Guitar (Advanced), Wants Python (Beginner)
        userB_Mutual = User.builder()
                .id("uB")
                .name("Elena")
                .email("elena@example.com")
                .timezone("UTC")
                .languages(List.of("English", "French"))
                .location(UserLocation.builder().mode(SessionMode.ONLINE).city("New York").build())
                .availability(List.of(
                        new AvailabilitySlot("MONDAY", List.of("EVENING")),
                        new AvailabilitySlot("FRIDAY", List.of("MORNING"))
                ))
                .skills(List.of(
                        UserSkill.builder().skillName("Guitar").category("Music").type(SkillType.TEACH).level(SkillLevel.ADVANCED).build(),
                        UserSkill.builder().skillName("Python").category("Tech").type(SkillType.LEARN).level(SkillLevel.BEGINNER).build()
                ))
                .reputation(UserReputation.builder().ratingAverage(4.9).sessionsCompleted(10).build())
                .build();

        // User C: One-sided Match! Teaches French, Wants Python (Beginner). Does NOT teach Guitar.
        userC_OneSided = User.builder()
                .id("uC")
                .name("Chloe")
                .email("chloe@example.com")
                .timezone("UTC")
                .languages(List.of("English", "French"))
                .skills(List.of(
                        UserSkill.builder().skillName("French").category("Languages").type(SkillType.TEACH).level(SkillLevel.EXPERT).build(),
                        UserSkill.builder().skillName("Python").category("Tech").type(SkillType.LEARN).level(SkillLevel.BEGINNER).build()
                ))
                .build();

        // User D: No Overlap! Teaches Pottery, Wants Cooking.
        userD_NoOverlap = User.builder()
                .id("uD")
                .name("David")
                .email("david@example.com")
                .skills(List.of(
                        UserSkill.builder().skillName("Pottery").category("Craft").type(SkillType.TEACH).level(SkillLevel.ADVANCED).build(),
                        UserSkill.builder().skillName("Cooking").category("Food").type(SkillType.LEARN).level(SkillLevel.BEGINNER).build()
                ))
                .build();
    }

    @Test
    @DisplayName("Direct Mutual Match should have high score, mutual flags, and clear reasons")
    void testDirectMutualMatch() {
        when(userMapper.toDto(userB_Mutual)).thenReturn(UserDto.builder().id("uB").name("Elena").build());

        MatchDto match = matchingService.evaluateCandidate(userA, userB_Mutual);

        assertNotNull(match);
        assertTrue(match.isDirectMutualMatch());
        assertTrue(match.getMatchScore() >= 70, "Direct mutual match should score at least 70, was: " + match.getMatchScore());
        assertFalse(match.getReasons().isEmpty());
        assertTrue(match.getReasons().stream().anyMatch(r -> r.contains("Direct Mutual Match")));
        assertTrue(match.getReasons().stream().anyMatch(r -> r.contains("Shared spoken languages")));
        assertEquals(1, match.getMutualTeachSkills().size()); // Python
        assertEquals(1, match.getMutualLearnSkills().size()); // Guitar
    }

    @Test
    @DisplayName("One-sided Match should have moderate score and isDirectMutualMatch = false")
    void testOneSidedMatch() {
        when(userMapper.toDto(userC_OneSided)).thenReturn(UserDto.builder().id("uC").name("Chloe").build());

        MatchDto match = matchingService.evaluateCandidate(userA, userC_OneSided);

        assertNotNull(match);
        assertFalse(match.isDirectMutualMatch());
        assertTrue(match.getMatchScore() > 0 && match.getMatchScore() < 65);
        assertTrue(match.getReasons().stream().anyMatch(r -> r.contains("Skill Fit")));
    }

    @Test
    @DisplayName("No skill overlap should produce matchScore = 0 and empty reasons")
    void testNoOverlapMatch() {
        when(userMapper.toDto(userD_NoOverlap)).thenReturn(UserDto.builder().id("uD").name("David").build());

        MatchDto match = matchingService.evaluateCandidate(userA, userD_NoOverlap);

        assertNotNull(match);
        assertEquals(0, match.getMatchScore());
        assertFalse(match.isDirectMutualMatch());
        assertTrue(match.getReasons().isEmpty());
    }

    @Test
    @DisplayName("findMatchesForUser should filter out 0-score candidates and sort descending")
    void testFindMatchesForUserSortingAndFiltering() {
        when(userRepository.findAllActiveExcept("uA")).thenReturn(List.of(userD_NoOverlap, userC_OneSided, userB_Mutual));
        when(userMapper.toDto(userB_Mutual)).thenReturn(UserDto.builder().id("uB").name("Elena").reputation(userB_Mutual.getReputation()).build());
        when(userMapper.toDto(userC_OneSided)).thenReturn(UserDto.builder().id("uC").name("Chloe").build());
        when(userMapper.toDto(userD_NoOverlap)).thenReturn(UserDto.builder().id("uD").name("David").build());

        List<MatchDto> results = matchingService.findMatchesForUser(userA);

        assertEquals(2, results.size(), "Should only return candidates with score > 0");
        assertEquals("uB", results.get(0).getUser().getId(), "Top match should be direct mutual match Elena");
        assertEquals("uC", results.get(1).getUser().getId(), "Second match should be Chloe");
        assertTrue(results.get(0).getMatchScore() > results.get(1).getMatchScore());
    }
}
