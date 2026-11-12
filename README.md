# SkillSwap ⚡

> **A peer-to-peer skill exchange platform where knowledge and time are the currency. No money changes hands.**

SkillSwap matches people whose skills complement each other: you teach what you love, and learn what you want. Built with an **Apple-grade** aesthetic—calm, spacious, human, and refined.

---

## ✨ Key Features

- 🎯 **Smart Matching Engine**: Multi-criteria matching algorithm evaluating complementary fit (mutual 2-way swaps), skill level compatibility, timezone/availability overlap, languages, and reputation. Returns a 0–100 score and transparent "Why you match" badges.
- 💬 **Real-Time Messaging**: iMessage-style interface powered by Spring WebSocket & STOMP protocol, with auto-reconnection and seamless HTTP polling fallback.
- 🔄 **Swap Proposals & Lifecycle**: Propose swaps (select skill to teach, skill to learn, and preferred time slots), accept, decline, counter-propose, or reschedule.
- 📅 **Sessions & Scheduling**: Automatic session generation upon swap acceptance with integrated virtual meeting links and conflict checking.
- ⭐ **Reviews & Reputation**: Mutual post-session reviews, star ratings (1–5), verified skill endorsements, and reputation badges.
- 🗂️ **Comprehensive Taxonomy**: 100+ curated skills across 8 core domains (Technology, Creative Arts, Languages, Music, Business, Health, Craft, Sciences).
- 🛡️ **Rate Limiting & Security**: Token-bucket rate limiting via Bucket4j on auth and chat endpoints, RFC 7807 problem details, BCrypt password hashing, and stateless JWT tokens with refresh rotation in `httpOnly` cookies.
- 🛡️ **Admin Moderation Console**: Platform KPI metrics, user suspension/activation, and live taxonomy management.
- 🌓 **Apple-Grade Visual Design**: SF-style typography, `#FBFBFD` canvas, hairline borders, spring-based micro-interactions, and true `#000000` / `#1C1C1E` dark mode.

---

## 🛠️ Tech Stack

### Backend
- **Language & Runtime**: Java 21, Spring Boot 3.3.4, Maven
- **Security**: Spring Security with JWT (HMAC-SHA256) access & refresh tokens in `httpOnly` secure cookies, refresh token rotation
- **Database**: MongoDB (Spring Data MongoDB) with compound, unique, text, and TTL indexes
- **Real-Time**: Spring WebSocket + STOMP in-memory message broker with SockJS support
- **Rate Limiting**: Bucket4j (20 req/min for auth, 60 req/min for chat)
- **Documentation**: springdoc-openapi with Swagger UI (`/swagger-ui/index.html`)
- **Utilities**: MapStruct 1.5.5, Lombok, Bucket4j 8.10.1

### Frontend
- **Framework**: Next.js 15 (App Router, Server Components & Client Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS, custom design tokens, dark mode toggle
- **State & Data Fetching**: TanStack Query (React Query)
- **Forms & Validation**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Real-time Client**: `@stomp/stompjs` + `sockjs-client` with graceful HTTP polling fallback

---

## 👥 Demo Personas (Pre-Seeded)

The database automatically seeds realistic personas on first run. You can test mutual matching, messaging, and reviews immediately. On the login page (`/login`), click the **1-Click Demo Fill** buttons:

| Persona | Email | Password | Role | Skills Offered / Wanted |
|---------|-------|----------|------|-------------------------|
| **Elena Rostova** | `elena@example.com` | `SkillSwap123!` | User | Teaches **Python & Spring Boot**; Wants **Acoustic Guitar** |
| **Marcus Vance** | `marcus@example.com` | `SkillSwap123!` | User | Teaches **Acoustic Guitar & Music Theory**; Wants **Python** |
| **Sophia Chen** | `sophia@example.com` | `SkillSwap123!` | User | Teaches **UI/UX Design & Figma**; Wants **Spanish** |
| **Carlos Mendez** | `carlos@example.com` | `SkillSwap123!` | User | Teaches **Spanish**; Wants **UI/UX Design & Figma** |
| **Admin** | `admin@skillswap.io` | `SkillSwapAdmin123!` | Admin | System moderation and taxonomy management |

> **Mutual Match Highlight**: Elena and Marcus have a **98% mutual match score**. Elena teaches Marcus Python, and Marcus teaches Elena Acoustic Guitar. They already have a past completed session with 5★ reviews and an upcoming confirmed session!

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Docker & Docker Compose **OR**
- Java 21 SDK & Maven 3.9+
- Node.js 18+ & npm
- Local MongoDB running on port 27017

---

### Option 1: Docker Compose (All-in-One)

```bash
# Clone the repository
git clone https://github.com/your-org/skillswap.git
cd skillswap

# Spin up MongoDB and Backend services
docker compose up -d

# Start the frontend
cd frontend
npm install
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) to view the application.
- Open [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) for OpenAPI documentation.

---

### Option 2: Running Locally Without Docker

#### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
brew services start mongodb-community
```

#### 2. Start the Backend
```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@21"  # Or your Java 21 path
export PATH="$JAVA_HOME/bin:$PATH"

cd backend
mvn spring-boot:run
```
The backend starts at `http://localhost:8080`.

#### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:3000`.

---

## 🧪 Running Tests

### Backend Unit & Integration Tests (18 passing tests)
```bash
cd backend
mvn test
```

### Frontend Typecheck & Production Build
```bash
cd frontend
npm run build
```

---

## 📚 Documentation Links

- [ARCHITECTURE.md](docs/ARCHITECTURE.md): System diagrams, database schemas, matching algorithm formula, and STOMP topology.
- [API.md](docs/API.md): Comprehensive REST & WebSocket API specification with payload examples.
- [DEPLOYMENT.md](docs/DEPLOYMENT.md): Production deployment guide for Vercel, Render/Railway, and MongoDB Atlas.
- [DECISIONS.md](docs/DECISIONS.md): Architecture Decision Records (ADRs) tracking core design choices.

---

## 📄 License
MIT License. Built with craft by the SkillSwap team.
