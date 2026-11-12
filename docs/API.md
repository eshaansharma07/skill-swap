# SkillSwap API Reference

This document provides a comprehensive specification of the SkillSwap REST and WebSocket APIs. All REST endpoints follow RFC 7807 problem details for errors and utilize standard HTTP status codes.

Interactive Swagger UI documentation is available locally at:  
`http://localhost:8080/swagger-ui/index.html`  
OpenAPI JSON is available at:  
`http://localhost:8080/v3/api-docs`

---

## 1. Authentication & Security

All private endpoints require authentication via JWT access token stored in an `httpOnly`, `SameSite=Lax` cookie named `access_token` (or passed as `Authorization: Bearer <token>` header).

Rate limiting is enforced by Bucket4j:
- `/api/auth/**`: 20 requests per minute per IP
- `/api/conversations/**` (POST): 60 requests per minute per IP

---

## 2. API Endpoints

### 2.1 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in and receive access/refresh cookies | No |
| `POST` | `/api/auth/refresh` | Rotate refresh token and obtain new access token | No (Cookie) |
| `POST` | `/api/auth/logout` | Revoke refresh token and clear cookies | Yes |
| `GET`  | `/api/auth/me` | Fetch authenticated user's session profile | Yes |

#### `POST /api/auth/register`
**Request Body**:
```json
{
  "name": "Elena Rostova",
  "username": "elenar",
  "email": "elena@example.com",
  "password": "Password123!"
}
```
**Response (201 Created)**: Returns `UserDto`.

#### `POST /api/auth/login`
**Request Body**:
```json
{
  "email": "elena@example.com",
  "password": "Password123!"
}
```
**Response (200 OK)**:
```json
{
  "user": {
    "id": "6732f91...",
    "email": "elena@example.com",
    "username": "elenar",
    "name": "Elena Rostova",
    "role": "USER",
    "onboardingCompleted": true
  },
  "message": "Login successful"
}
```
*Note: Sets `access_token` (15m) and `refresh_token` (7d) in secure `httpOnly` cookies.*

---

### 2.2 Users & Profiles (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/users` | Search and discover users with query filters | No |
| `GET`  | `/api/users/{username}` | Get public user profile and review summary | No |
| `PUT`  | `/api/users/profile` | Update profile information (bio, location, languages) | Yes |
| `PUT`  | `/api/users/skills` | Update taught and wanted skills list | Yes |
| `PUT`  | `/api/users/availability` | Update weekly schedule availability | Yes |

#### Query Parameters for `GET /api/users`:
- `query` (string): Text search across name, username, bio, and skills
- `category` (string): Skill category filter (e.g., `technology-programming`, `music`)
- `mode` (string): `ONLINE` or `IN_PERSON`
- `level` (string): `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`

---

### 2.3 Skills Taxonomy (`/api/skills`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/skills` | Retrieve all skills, optionally filtered by category or search | No |
| `GET`  | `/api/skills/categories`| List all distinct taxonomy categories | No |
| `GET`  | `/api/skills/{slug}` | Get details of a single skill by slug | No |

---

### 2.4 Smart Matching (`/api/matches`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/matches` | Get AI/rule-based ranked complementary matches | Yes |

**Sample Response (200 OK)**:
```json
[
  {
    "user": {
      "id": "6732fa4...",
      "username": "marcusv",
      "name": "Marcus Vance",
      "bio": "Fingerstyle guitarist...",
      "ratingAverage": 5.0,
      "totalReviews": 18
    },
    "score": 98,
    "mutual": true,
    "reasons": [
      "Direct 2-way match: You teach Python (Marcus wants to learn) & Marcus teaches Acoustic Guitar (You want to learn)",
      "Level compatibility: Expert/Advanced teachers",
      "Availability overlap: 2 matching weekly slots",
      "Shared languages: English",
      "Top-rated community teacher (5.0★)"
    ],
    "matchingSkillsWeTeach": ["Python"],
    "matchingSkillsTheyTeach": ["Acoustic Guitar"]
  }
]
```

---

### 2.5 Swap Proposals (`/api/swaps`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/swaps` | Initiate a new skill swap proposal | Yes |
| `GET`  | `/api/swaps` | List all swap requests (incoming & outgoing) | Yes |
| `GET`  | `/api/swaps/{id}` | Get single swap request details | Yes |
| `POST` | `/api/swaps/{id}/accept` | Accept a proposal (automatically schedules Session) | Yes |
| `POST` | `/api/swaps/{id}/decline` | Decline a proposal with optional reason | Yes |
| `POST` | `/api/swaps/{id}/counter` | Send counter proposal with alternative times/skills | Yes |
| `POST` | `/api/swaps/{id}/cancel` | Cancel an outgoing proposal | Yes |

#### `POST /api/swaps`
**Request Body**:
```json
{
  "toUserId": "6732fa4...",
  "offeredSkillId": "python",
  "requestedSkillId": "acoustic-guitar",
  "message": "Let's exchange Python for acoustic fingerpicking technique!",
  "proposedSlots": [
    {
      "startUtc": "2026-11-20T15:00:00Z",
      "endUtc": "2026-11-20T16:00:00Z",
      "mode": "ONLINE",
      "locationOrLink": "Google Meet"
    }
  ]
}
```

---

### 2.6 Sessions (`/api/sessions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/sessions` | List sessions (`status=SCHEDULED` or `COMPLETED`) | Yes |
| `GET`  | `/api/sessions/{id}` | Get session details | Yes |
| `POST` | `/api/sessions/{id}/complete` | Mark session as completed (unlocks review) | Yes |
| `POST` | `/api/sessions/{id}/cancel` | Cancel an upcoming session | Yes |
| `POST` | `/api/sessions/{id}/reschedule` | Propose new start/end time for session | Yes |

---

### 2.7 Reviews & Reputation (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/reviews` | Submit a review for a completed session | Yes |
| `GET`  | `/api/reviews/user/{userId}` | List reviews received by a user | No |

#### `POST /api/reviews`
**Request Body**:
```json
{
  "sessionId": "6732fb...",
  "revieweeId": "6732fa4...",
  "rating": 5,
  "text": "Marcus is an outstanding teacher! Patient and structured.",
  "endorsedSkill": "Acoustic Guitar"
}
```

---

### 2.8 Messaging & Conversations (`/api/conversations`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/conversations` | List user's active conversations | Yes |
| `POST` | `/api/conversations/start` | Start or retrieve conversation with another user | Yes |
| `GET`  | `/api/conversations/{id}/messages` | Get message history for conversation | Yes |
| `POST` | `/api/conversations/{id}/messages` | Send message (HTTP fallback) | Yes |
| `POST` | `/api/conversations/{id}/read` | Mark all messages in conversation as read | Yes |

---

### 2.9 Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/notifications` | Get user notifications list | Yes |
| `POST` | `/api/notifications/{id}/read`| Mark a specific notification as read | Yes |
| `POST` | `/api/notifications/read-all` | Mark all user notifications as read | Yes |

---

### 2.10 Admin Moderation (`/api/admin`)

*Requires role `ADMIN`.*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/admin/metrics` | Retrieve platform KPIs (users, sessions, swaps, reviews) |
| `GET`  | `/api/admin/users` | List all users with status & moderation controls |
| `POST` | `/api/admin/users/{id}/suspend` | Suspend user access |
| `POST` | `/api/admin/users/{id}/activate` | Reactivate user access |
| `POST` | `/api/admin/skills` | Add new skill to system taxonomy |

---

## 3. Real-Time WebSocket (STOMP)

- **Handshake Endpoint**: `ws://localhost:8080/ws` (or `wss://...` in production)
- **SockJS Endpoint**: `http://localhost:8080/ws`

### Topics & Queues
- **Subscribe to Chat**: `/topic/conversation.{conversationId}`
  - Emitted when any participant sends a message in that conversation.
- **Subscribe to User Notifications**: `/queue/notifications.{userId}`
  - Emitted on new swap requests, session confirmations, cancellations, and reviews.
- **Publish Message**: `/app/chat.send`
  ```json
  {
    "conversationId": "6732f...",
    "recipientId": "6732fa4...",
    "content": "Looking forward to our session!"
  }
  ```

---

## 4. Error Responses (RFC 7807)

All non-2xx responses return `application/problem+json` format:

```json
{
  "type": "https://skillswap.io/errors/validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "One or more fields failed validation requirements.",
  "instance": "/api/auth/register",
  "timestamp": "2026-11-12T16:30:00Z",
  "violations": [
    {
      "field": "email",
      "message": "Must be a valid email address",
      "rejectedValue": "invalid-email"
    }
  ]
}
```
