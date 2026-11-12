package com.skillswap.controller;

import com.skillswap.dto.AcceptSwapRequestDto;
import com.skillswap.dto.CounterSwapRequestDto;
import com.skillswap.dto.CreateSwapRequestDto;
import com.skillswap.dto.SwapRequestDto;
import com.skillswap.service.SwapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/swaps")
@RequiredArgsConstructor
@Tag(name = "Swap Requests", description = "Lifecycle endpoints for proposing, accepting, countering, declining, and viewing skill swaps")
public class SwapController {

    private final SwapService swapService;

    @PostMapping
    @Operation(summary = "Propose a new skill swap request to a peer")
    public ResponseEntity<SwapRequestDto> createSwapRequest(@Valid @RequestBody CreateSwapRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(swapService.createSwapRequest(dto));
    }

    @GetMapping
    @Operation(summary = "Get swap requests for authenticated user (filter by type: sent, received, or all)")
    public ResponseEntity<List<SwapRequestDto>> getSwapRequests(@RequestParam(required = false, defaultValue = "all") String type) {
        return ResponseEntity.ok(swapService.getSwapRequestsForCurrentUser(type));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single swap request details by ID")
    public ResponseEntity<SwapRequestDto> getSwapRequestById(@PathVariable String id) {
        return ResponseEntity.ok(swapService.getSwapRequestById(id));
    }

    @PutMapping("/{id}/accept")
    @Operation(summary = "Accept a swap request and schedule confirmed session")
    public ResponseEntity<SwapRequestDto> acceptSwapRequest(
            @PathVariable String id,
            @RequestBody(required = false) AcceptSwapRequestDto dto) {
        AcceptSwapRequestDto payload = dto != null ? dto : new AcceptSwapRequestDto();
        return ResponseEntity.ok(swapService.acceptSwapRequest(id, payload));
    }

    @PutMapping("/{id}/decline")
    @Operation(summary = "Decline a swap request")
    public ResponseEntity<SwapRequestDto> declineSwapRequest(@PathVariable String id) {
        return ResponseEntity.ok(swapService.declineSwapRequest(id));
    }

    @PutMapping("/{id}/counter")
    @Operation(summary = "Counter-propose alternative skills or time slots")
    public ResponseEntity<SwapRequestDto> counterSwapRequest(
            @PathVariable String id,
            @RequestBody CounterSwapRequestDto dto) {
        return ResponseEntity.ok(swapService.counterSwapRequest(id, dto));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a swap request initiated by the current user")
    public ResponseEntity<SwapRequestDto> cancelSwapRequest(@PathVariable String id) {
        return ResponseEntity.ok(swapService.cancelSwapRequest(id));
    }
}
