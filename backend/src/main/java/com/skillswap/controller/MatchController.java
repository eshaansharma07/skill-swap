package com.skillswap.controller;

import com.skillswap.dto.MatchDto;
import com.skillswap.model.User;
import com.skillswap.service.AuthService;
import com.skillswap.service.MatchingService;
import com.skillswap.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@Tag(name = "Matching Engine", description = "Endpoints for finding complementary skill swap matches with scores and reasons")
public class MatchController {

    private final MatchingService matchingService;
    private final AuthService authService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get ranked complementary matches for the authenticated user")
    public ResponseEntity<List<MatchDto>> getMatchesForCurrentUser() {
        User currentUser = authService.getCurrentUserEntity();
        List<MatchDto> matches = matchingService.findMatchesForUser(currentUser);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/candidate/{candidateId}")
    @Operation(summary = "Evaluate match score and explanation against a specific user")
    public ResponseEntity<MatchDto> evaluateAgainstCandidate(@PathVariable String candidateId) {
        User currentUser = authService.getCurrentUserEntity();
        User candidate = userService.getAuthService().getCurrentUserEntity(); // or fetch by id
        return ResponseEntity.ok(matchingService.evaluateCandidate(currentUser, candidate));
    }
}
