package com.skillswap.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.exception.ProblemDetail;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> messagingBuckets = new ConcurrentHashMap<>();

    private Bucket createAuthBucket() {
        Bandwidth limit = Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createMessagingBucket() {
        Bandwidth limit = Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        String clientIp = getClientIP(request);

        if (uri.startsWith("/api/auth/login") || uri.startsWith("/api/auth/register")) {
            Bucket bucket = authBuckets.computeIfAbsent(clientIp, k -> createAuthBucket());
            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit exceeded for auth from IP: {}", clientIp);
                sendRateLimitError(request, response, "Too many authentication attempts. Please try again in 1 minute.");
                return;
            }
        } else if (uri.startsWith("/api/conversations") && "POST".equalsIgnoreCase(request.getMethod())) {
            Bucket bucket = messagingBuckets.computeIfAbsent(clientIp, k -> createMessagingBucket());
            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit exceeded for messaging from IP: {}", clientIp);
                sendRateLimitError(request, response, "Too many messages sent. Please slow down.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private void sendRateLimitError(HttpServletRequest request, HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setHeader("Retry-After", "60");

        ProblemDetail problem = ProblemDetail.builder()
                .type("https://skillswap.io/errors/rate-limit-exceeded")
                .title("Too Many Requests")
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .detail(message)
                .instance(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(problem));
    }
}
