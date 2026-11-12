package com.skillswap.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, 900000L, 604800000L);
    }

    @Test
    @DisplayName("Should generate a valid access token and extract userId")
    void testGenerateAndValidateAccessToken() {
        String userId = "user123";
        String username = "alex";
        String role = "USER";

        String token = tokenProvider.generateAccessToken(userId, username, role);

        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(userId, tokenProvider.getUserIdFromToken(token));
    }

    @Test
    @DisplayName("Should generate unique refresh tokens")
    void testGenerateRefreshToken() {
        String token1 = tokenProvider.generateRefreshToken();
        String token2 = tokenProvider.generateRefreshToken();

        assertNotNull(token1);
        assertNotNull(token2);
        assertNotEquals(token1, token2);
    }

    @Test
    @DisplayName("Should hash token deterministically with SHA-256")
    void testHashToken() {
        String raw = "sample-token-12345";
        String hash1 = tokenProvider.hashToken(raw);
        String hash2 = tokenProvider.hashToken(raw);

        assertNotNull(hash1);
        assertEquals(hash1, hash2);
        assertEquals(64, hash1.length()); // SHA-256 hex is 64 chars
    }

    @Test
    @DisplayName("Should reject invalid token")
    void testValidateInvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid.token.structure"));
    }
}
