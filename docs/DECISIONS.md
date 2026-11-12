# Architecture & Technical Decisions (ADR) - SkillSwap

## ADR 001: Architecture & Technology Stack
- **Context**: The platform requires a responsive web frontend, real-time messaging, a complementary skill-matching engine, and secure peer-to-peer interactions.
- **Decision**:
  - Backend: Java 21, Spring Boot 3.3.x, Maven, Spring Security (JWT cookies + token rotation), Spring Data MongoDB, Spring WebSocket (STOMP), Actuator, Springdoc OpenAPI.
  - Database: MongoDB (Atlas M0 compatible), utilizing compound indexes for matching, text indexes for discovery, and TTL indexes for token invalidation.
  - Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, TanStack Query, React Hook Form + Zod, Framer Motion, Lucide Icons.
  - Styling: Apple-grade visual design (near-white `#FBFBFD`, hairline borders, SF Pro system font, true dark mode, spring physics).

## ADR 002: Authentication & Token Management
- **Context**: Need secure authentication compatible with Next.js frontend and mobile devices, preventing XSS and CSRF.
- **Decision**:
  - Store JWT access tokens (15-min lifespan) and refresh tokens (7-day lifespan) in `httpOnly`, `Secure`, `SameSite=Lax` cookies.
  - Implement refresh token rotation: each refresh invalidates the old token and issues a new pair.
  - Passwords hashed with BCrypt (strength 12).
  - Next.js rewrites `/api/*` to the Spring Boot backend, ensuring cookies remain first-party across environments.

## ADR 003: Matching Engine Scoring Model
- **Context**: Matching is the core differentiator. It needs to compute complementary fit efficiently and explain *why* users match.
- **Decision**:
  - Maximum Score: 100 points.
    - **Mutual Fit (up to 50 pts)**: A teaches what B wants AND B teaches what A wants. (One-way fit yields partial score: 15-20 pts).
    - **Level Compatibility (up to 15 pts)**: Teacher proficiency level is greater than or equal to learner's target or teacher is EXPERT/ADVANCED.
    - **Availability & Timezone (up to 15 pts)**: Overlap in weekly availability slots and timezone delta $\le 3$ hours.
    - **Language Overlap (up to 10 pts)**: Common spoken languages.
    - **Mode & Location (up to 5 pts)**: Both accept ONLINE, or both prefer IN_PERSON in the same city.
    - **Reputation Boost (up to 5 pts)**: Higher rating ($\ge 4.5$) and verified sessions.
  - Explainability: Return an array of human-readable `reasons[]` alongside the score.
  - Caching: `@Cacheable(value = "matches", key = "#userId")` with automatic eviction (`@CacheEvict`) upon user skill or profile updates.

## ADR 004: Real-Time Communication Architecture
- **Context**: Real-time chat and instantaneous notifications for swap requests and accepts.
- **Decision**:
  - Spring WebSocket with STOMP message broker (`/ws`).
  - Topics: `/topic/conversation.{conversationId}` for chats, `/queue/notifications.{userId}` for user-specific events.
  - Graceful fallback: Frontend includes auto-reconnect and polling fallback if WebSocket connection is interrupted or blocked by proxies.

## ADR 005: Error Handling Standard
- **Context**: Need a consistent, structured error format across all API endpoints.
- **Decision**:
  - Adopt RFC 7807 (`application/problem+json`) global error responses via `@RestControllerAdvice`.
  - Standard fields: `type`, `title`, `status`, `detail`, `instance`, `timestamp`, and `violations` for field-level validation errors.

## ADR 006: Testing Strategy
- **Context**: Need 70%+ test coverage on services and matching engine, with resilient local testing.
- **Decision**:
  - Unit tests using JUnit 5, AssertJ, and Mockito.
  - Embedded MongoDB / Testcontainers for repository and integration tests.
  - Frontend component tests and end-to-end browser verification.

## ADR 007: Rate Limiting Architecture (Bucket4j)
- **Context**: Prevent brute-force credential stuffing on auth endpoints and flood abuse on messaging endpoints.
- **Decision**:
  - Implement token-bucket rate limiting via `Bucket4j` in a dedicated servlet filter (`RateLimitingFilter`).
  - Auth endpoints (`/api/auth/login`, `/api/auth/register`): 20 requests per minute per IP.
  - Messaging POST endpoints (`/api/conversations/**`): 60 messages per minute per IP.
  - Exceeded rate limits return HTTP 429 with RFC 7807 `ProblemDetail` payload and standard `Retry-After: 60` header.
