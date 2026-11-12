package com.skillswap.service;

import com.skillswap.dto.AuthResponse;
import com.skillswap.dto.LoginRequest;
import com.skillswap.dto.RegisterRequest;
import com.skillswap.dto.UserDto;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.UnauthorizedException;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.RefreshToken;
import com.skillswap.model.Role;
import com.skillswap.model.User;
import com.skillswap.repository.RefreshTokenRepository;
import com.skillswap.repository.UserRepository;
import com.skillswap.security.CookieUtil;
import com.skillswap.security.JwtTokenProvider;
import com.skillswap.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final CookieUtil cookieUtil;
    private final UserMapper userMapper;

    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        if (userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            throw new BadRequestException("This username is already taken");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .username(request.getUsername().toLowerCase().trim())
                .name(request.getName().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .status("ACTIVE")
                .onboardingCompleted(false)
                .build();

        User savedUser = userRepository.save(user);

        // Generate tokens & set cookies
        issueTokensAndSetCookies(savedUser, response);

        return AuthResponse.builder()
                .user(userMapper.toDto(savedUser))
                .message("Registration successful")
                .build();
    }

    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String identifier = request.getEmailOrUsername().trim();
        User user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new UnauthorizedException("Invalid email/username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email/username or password");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new UnauthorizedException("Your account is currently suspended. Please contact support.");
        }

        issueTokensAndSetCookies(user, response);

        return AuthResponse.builder()
                .user(userMapper.toDto(user))
                .message("Login successful")
                .build();
    }

    public AuthResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String rawRefreshToken = cookieUtil.extractTokenFromCookie(request, CookieUtil.REFRESH_TOKEN_COOKIE)
                .orElseThrow(() -> new UnauthorizedException("No refresh token provided"));

        String tokenHash = tokenProvider.hashToken(rawRefreshToken);
        RefreshToken tokenDoc = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        if (tokenDoc.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(tokenDoc);
            throw new UnauthorizedException("Refresh token has expired. Please sign in again.");
        }

        User user = userRepository.findById(tokenDoc.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User associated with token not found"));

        // Refresh token rotation: delete old token, issue new pair
        refreshTokenRepository.delete(tokenDoc);
        issueTokensAndSetCookies(user, response);

        return AuthResponse.builder()
                .user(userMapper.toDto(user))
                .message("Token refreshed successfully")
                .build();
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        Optional<String> rawRefreshToken = cookieUtil.extractTokenFromCookie(request, CookieUtil.REFRESH_TOKEN_COOKIE);
        rawRefreshToken.ifPresent(token -> {
            String tokenHash = tokenProvider.hashToken(token);
            refreshTokenRepository.deleteByTokenHash(tokenHash);
        });

        cookieUtil.clearTokenCookies(response);
        SecurityContextHolder.clearContext();
    }

    public UserDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("No authenticated user found");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return userMapper.toDto(user);
    }

    public User getCurrentUserEntity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("No authenticated user found");
        }

        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    private void issueTokensAndSetCookies(User user, HttpServletResponse response) {
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRole().name());
        String rawRefreshToken = tokenProvider.generateRefreshToken();

        // Save hashed refresh token to DB with expiration for TTL index
        String tokenHash = tokenProvider.hashToken(rawRefreshToken);
        RefreshToken refreshTokenDoc = RefreshToken.builder()
                .userId(user.getId())
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusMillis(tokenProvider.getRefreshTokenExpirationMs()))
                .build();
        refreshTokenRepository.save(refreshTokenDoc);

        cookieUtil.addTokenCookies(response, accessToken, rawRefreshToken);
    }
}
