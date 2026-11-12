package com.skillswap.service;

import com.skillswap.dto.AuthResponse;
import com.skillswap.dto.LoginRequest;
import com.skillswap.dto.RegisterRequest;
import com.skillswap.dto.UserDto;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.UnauthorizedException;
import com.skillswap.mapper.UserMapper;
import com.skillswap.model.Role;
import com.skillswap.model.User;
import com.skillswap.repository.RefreshTokenRepository;
import com.skillswap.repository.UserRepository;
import com.skillswap.security.CookieUtil;
import com.skillswap.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private CookieUtil cookieUtil;

    @Mock
    private UserMapper userMapper;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private UserDto sampleUserDto;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id("u1")
                .email("alex@example.com")
                .username("alex")
                .name("Alex Rivers")
                .passwordHash("hashedPass")
                .role(Role.USER)
                .status("ACTIVE")
                .build();

        sampleUserDto = UserDto.builder()
                .id("u1")
                .email("alex@example.com")
                .username("alex")
                .name("Alex Rivers")
                .role(Role.USER)
                .status("ACTIVE")
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegisterSuccess() {
        RegisterRequest req = RegisterRequest.builder()
                .email("alex@example.com")
                .username("alex")
                .name("Alex Rivers")
                .password("Password123!")
                .build();

        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(userMapper.toDto(any(User.class))).thenReturn(sampleUserDto);
        when(tokenProvider.generateAccessToken(any(), any(), any())).thenReturn("mock-access");
        when(tokenProvider.generateRefreshToken()).thenReturn("mock-refresh");
        when(tokenProvider.hashToken(anyString())).thenReturn("mock-hash");
        when(tokenProvider.getRefreshTokenExpirationMs()).thenReturn(604800000L);

        AuthResponse res = authService.register(req, response);

        assertNotNull(res);
        assertEquals("alex@example.com", res.getUser().getEmail());
        verify(cookieUtil).addTokenCookies(eq(response), eq("mock-access"), eq("mock-refresh"));
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException if email already taken")
    void testRegisterDuplicateEmail() {
        RegisterRequest req = RegisterRequest.builder()
                .email("alex@example.com")
                .username("alex2")
                .name("Alex")
                .password("Password123!")
                .build();

        when(userRepository.existsByEmailIgnoreCase("alex@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req, response));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void testLoginSuccess() {
        LoginRequest req = LoginRequest.builder()
                .emailOrUsername("alex")
                .password("Password123!")
                .build();

        when(userRepository.findByEmailOrUsername("alex")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password123!", "hashedPass")).thenReturn(true);
        when(userMapper.toDto(sampleUser)).thenReturn(sampleUserDto);
        when(tokenProvider.generateAccessToken(any(), any(), any())).thenReturn("mock-access");
        when(tokenProvider.generateRefreshToken()).thenReturn("mock-refresh");
        when(tokenProvider.hashToken(anyString())).thenReturn("mock-hash");
        when(tokenProvider.getRefreshTokenExpirationMs()).thenReturn(604800000L);

        AuthResponse res = authService.login(req, response);

        assertNotNull(res);
        assertEquals("alex", res.getUser().getUsername());
        verify(cookieUtil).addTokenCookies(eq(response), eq("mock-access"), eq("mock-refresh"));
    }

    @Test
    @DisplayName("Should throw UnauthorizedException for bad password")
    void testLoginBadPassword() {
        LoginRequest req = LoginRequest.builder()
                .emailOrUsername("alex")
                .password("wrongpassword")
                .build();

        when(userRepository.findByEmailOrUsername("alex")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", "hashedPass")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(req, response));
    }
}
