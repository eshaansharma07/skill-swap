package com.skillswap.service;

import com.skillswap.dto.MatchDto;
import com.skillswap.dto.UserDto;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.*;
import com.skillswap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchingService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Cacheable(value = "matches", key = "#currentUser.id")
    public List<MatchDto> findMatchesForUser(User currentUser) {
        if (currentUser == null || currentUser.getSkills() == null || currentUser.getSkills().isEmpty()) {
            return Collections.emptyList();
        }

        List<User> candidates = userRepository.findAllActiveExcept(currentUser.getId());
        List<MatchDto> matches = new ArrayList<>();

        for (User candidate : candidates) {
            MatchDto match = evaluateCandidate(currentUser, candidate);
            if (match.getMatchScore() > 0) {
                matches.add(match);
            }
        }

        // Sort descending by score, tie breaking by rating and sessions completed
        matches.sort((a, b) -> {
            int scoreCompare = Integer.compare(b.getMatchScore(), a.getMatchScore());
            if (scoreCompare != 0) return scoreCompare;

            double ratingA = a.getUser().getReputation() != null && a.getUser().getReputation().getRatingAverage() != null
                    ? a.getUser().getReputation().getRatingAverage() : 0.0;
            double ratingB = b.getUser().getReputation() != null && b.getUser().getReputation().getRatingAverage() != null
                    ? b.getUser().getReputation().getRatingAverage() : 0.0;
            int ratingCompare = Double.compare(ratingB, ratingA);
            if (ratingCompare != 0) return ratingCompare;

            int sessA = a.getUser().getReputation() != null && a.getUser().getReputation().getSessionsCompleted() != null
                    ? a.getUser().getReputation().getSessionsCompleted() : 0;
            int sessB = b.getUser().getReputation() != null && b.getUser().getReputation().getSessionsCompleted() != null
                    ? b.getUser().getReputation().getSessionsCompleted() : 0;
            return Integer.compare(sessB, sessA);
        });

        return matches;
    }

    public MatchDto evaluateCandidate(User current, User candidate) {
        int score = 0;
        List<String> reasons = new ArrayList<>();

        List<UserSkill> myTeach = current.getSkills().stream()
                .filter(s -> s.getType() == SkillType.TEACH)
                .toList();
        List<UserSkill> myLearn = current.getSkills().stream()
                .filter(s -> s.getType() == SkillType.LEARN)
                .toList();

        List<UserSkill> candTeach = candidate.getSkills().stream()
                .filter(s -> s.getType() == SkillType.TEACH)
                .toList();
        List<UserSkill> candLearn = candidate.getSkills().stream()
                .filter(s -> s.getType() == SkillType.LEARN)
                .toList();

        // 1. Check Mutual Fit (A teaches what B learns, AND B teaches what A learns)
        List<UserSkill> skillsIGiveThem = findSkillIntersections(myTeach, candLearn);
        List<UserSkill> skillsTheyGiveMe = findSkillIntersections(candTeach, myLearn);

        boolean forwardFit = !skillsIGiveThem.isEmpty();
        boolean reverseFit = !skillsTheyGiveMe.isEmpty();
        boolean isDirectMutual = forwardFit && reverseFit;

        if (isDirectMutual) {
            // Direct Mutual fit (Highest weight: 40 base + up to 10 for multi-skill)
            int mutualWeight = 40 + Math.min(10, (skillsIGiveThem.size() + skillsTheyGiveMe.size() - 2) * 5);
            score += mutualWeight;

            String myTeachNames = skillsIGiveThem.stream().map(UserSkill::getSkillName).collect(Collectors.joining(", "));
            String theirTeachNames = skillsTheyGiveMe.stream().map(UserSkill::getSkillName).collect(Collectors.joining(", "));
            reasons.add(String.format("Direct Mutual Match: You teach %s and %s wants to learn %s; %s teaches %s and you want to learn %s.",
                    myTeachNames, candidate.getName(), myTeachNames, candidate.getName(), theirTeachNames, theirTeachNames));
        } else if (forwardFit) {
            score += 20;
            String myTeachNames = skillsIGiveThem.stream().map(UserSkill::getSkillName).collect(Collectors.joining(", "));
            reasons.add(String.format("Skill Fit: You teach %s, which %s is looking to learn.", myTeachNames, candidate.getName()));
        } else if (reverseFit) {
            score += 20;
            String theirTeachNames = skillsTheyGiveMe.stream().map(UserSkill::getSkillName).collect(Collectors.joining(", "));
            reasons.add(String.format("Skill Fit: %s teaches %s, which matches your learning goals.", candidate.getName(), theirTeachNames));
        }

        // If no skill compatibility whatsoever, don't match
        if (!forwardFit && !reverseFit) {
            return MatchDto.builder()
                    .user(userMapper.toDto(candidate))
                    .matchScore(0)
                    .reasons(Collections.emptyList())
                    .mutualTeachSkills(Collections.emptyList())
                    .mutualLearnSkills(Collections.emptyList())
                    .isDirectMutualMatch(false)
                    .build();
        }

        // 2. Level Compatibility (Max 15 points)
        int levelPoints = 0;
        if (!skillsTheyGiveMe.isEmpty()) {
            for (UserSkill candSkill : skillsTheyGiveMe) {
                UserSkill myGoal = myLearn.stream()
                        .filter(l -> isSkillMatch(candSkill, l))
                        .findFirst()
                        .orElse(null);

                if (myGoal != null && candSkill.getLevel() != null && myGoal.getLevel() != null) {
                    if (candSkill.getLevel().getRank() >= myGoal.getLevel().getRank()) {
                        levelPoints = 15;
                        reasons.add(String.format("Level compatibility: %s is an %s in %s.",
                                candidate.getName(), candSkill.getLevel().name().toLowerCase(), candSkill.getSkillName()));
                        break;
                    } else {
                        levelPoints = Math.max(levelPoints, 8);
                    }
                }
            }
        } else {
            levelPoints = 8;
        }
        score += levelPoints;

        // 3. Availability & Timezone Overlap (Max 15 points)
        int scheduleOverlap = calculateScheduleOverlap(current.getAvailability(), candidate.getAvailability());
        if (scheduleOverlap > 0) {
            int schedPoints = Math.min(10, scheduleOverlap * 3);
            score += schedPoints;
            reasons.add(String.format("Schedule overlap: %d shared weekly time slots.", scheduleOverlap));
        }

        // Timezone check
        if (isTimezoneCompatible(current.getTimezone(), candidate.getTimezone())) {
            score += 5;
            reasons.add("Timezone proximity: Easy live video coordination.");
        }

        // 4. Language Overlap (Max 10 points)
        List<String> commonLanguages = findCommonLanguages(current.getLanguages(), candidate.getLanguages());
        if (!commonLanguages.isEmpty()) {
            score += 10;
            reasons.add(String.format("Shared spoken languages: %s.", String.join(", ", commonLanguages)));
        }

        // 5. Mode Compatibility (Max 5 points)
        if (isModeCompatible(current.getLocation(), candidate.getLocation())) {
            score += 5;
            if (current.getLocation() != null && current.getLocation().getCity() != null &&
                    candidate.getLocation() != null && current.getLocation().getCity().equalsIgnoreCase(candidate.getLocation().getCity())) {
                reasons.add(String.format("Location match: Both in %s for optional in-person sessions.", current.getLocation().getCity()));
            } else {
                reasons.add("Mode alignment: Both available for online sessions.");
            }
        }

        // 6. Reputation Boost (Max 5 points)
        if (candidate.getReputation() != null && candidate.getReputation().getRatingAverage() != null) {
            double rating = candidate.getReputation().getRatingAverage();
            int sessions = candidate.getReputation().getSessionsCompleted() != null ? candidate.getReputation().getSessionsCompleted() : 0;
            if (rating >= 4.8 && sessions >= 1) {
                score += 5;
                reasons.add(String.format("High reputation: %.1f ★ rating with %d completed sessions.", rating, sessions));
            } else if (rating >= 4.5) {
                score += 3;
            }
        }

        int finalScore = Math.min(100, Math.max(0, score));

        return MatchDto.builder()
                .user(userMapper.toDto(candidate))
                .matchScore(finalScore)
                .reasons(reasons)
                .mutualTeachSkills(skillsIGiveThem)
                .mutualLearnSkills(skillsTheyGiveMe)
                .isDirectMutualMatch(isDirectMutual)
                .build();
    }

    private List<UserSkill> findSkillIntersections(List<UserSkill> skillsA, List<UserSkill> skillsB) {
        List<UserSkill> matched = new ArrayList<>();
        for (UserSkill a : skillsA) {
            for (UserSkill b : skillsB) {
                if (isSkillMatch(a, b)) {
                    matched.add(a);
                    break;
                }
            }
        }
        return matched;
    }

    private boolean isSkillMatch(UserSkill s1, UserSkill s2) {
        if (s1.getSkillId() != null && s2.getSkillId() != null && s1.getSkillId().equalsIgnoreCase(s2.getSkillId())) {
            return true;
        }
        return s1.getSkillName() != null && s2.getSkillName() != null &&
                s1.getSkillName().trim().equalsIgnoreCase(s2.getSkillName().trim());
    }

    private int calculateScheduleOverlap(List<AvailabilitySlot> a, List<AvailabilitySlot> b) {
        if (a == null || b == null) return 0;
        int count = 0;
        for (AvailabilitySlot slotA : a) {
            for (AvailabilitySlot slotB : b) {
                if (slotA.getDayOfWeek() != null && slotA.getDayOfWeek().equalsIgnoreCase(slotB.getDayOfWeek())) {
                    if (slotA.getSlots() != null && slotB.getSlots() != null) {
                        for (String sA : slotA.getSlots()) {
                            if (slotB.getSlots().contains(sA)) {
                                count++;
                            }
                        }
                    }
                }
            }
        }
        return count;
    }

    private boolean isTimezoneCompatible(String tzA, String tzB) {
        if (tzA == null || tzB == null) return true;
        return tzA.equalsIgnoreCase(tzB) || tzA.equalsIgnoreCase("UTC") || tzB.equalsIgnoreCase("UTC");
    }

    private List<String> findCommonLanguages(List<String> langA, List<String> langB) {
        if (langA == null || langB == null) return Collections.emptyList();
        Set<String> setA = langA.stream().map(String::toLowerCase).collect(Collectors.toSet());
        return langB.stream()
                .filter(l -> setA.contains(l.toLowerCase()))
                .toList();
    }

    private boolean isModeCompatible(UserLocation locA, UserLocation locB) {
        if (locA == null || locB == null) return true;
        SessionMode modeA = locA.getMode() != null ? locA.getMode() : SessionMode.ONLINE;
        SessionMode modeB = locB.getMode() != null ? locB.getMode() : SessionMode.ONLINE;

        if (modeA == SessionMode.ONLINE || modeB == SessionMode.ONLINE || modeA == SessionMode.BOTH || modeB == SessionMode.BOTH) {
            return true;
        }

        return locA.getCity() != null && locB.getCity() != null && locA.getCity().equalsIgnoreCase(locB.getCity());
    }
}
