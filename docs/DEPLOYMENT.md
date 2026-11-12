# SkillSwap Production Deployment Guide

This guide details how to deploy **SkillSwap** across a production infrastructure stack:
- **Frontend**: [Vercel](https://vercel.com) (Next.js 15 App Router)
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app) (Dockerized Java 21 / Spring Boot 3.3)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Managed M0 Free Cluster)

---

## 1. Architecture Split & Networking Strategy

```
               [ User Browser ]
                 /          \
      (HTTPS API & UI)   (Direct WSS)
               /              \
              v                v
      +---------------+   +-----------------------+
      | Vercel        |   | Render / Railway      |
      | Next.js App   |   | Spring Boot Container |
      | /api/* proxy  |-->| Port 8080             |
      +---------------+   +-----------------------+
                                     |
                                     v
                          +-----------------------+
                          | MongoDB Atlas Cluster |
                          +-----------------------+
```

### Cookie Strategy (First-Party via Next.js Rewrites)
Because Vercel and the backend container exist on different domains, directly setting cross-domain cookies requires `SameSite=None; Secure`, which is often blocked by privacy features in Safari (ITP) and Firefox.  
**SkillSwap's Solution**: The Next.js frontend uses **Next.js Rewrites** (`next.config.ts`):
```typescript
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.BACKEND_INTERNAL_URL || "http://localhost:8080"}/api/:path*`,
    },
  ];
}
```
All API calls are directed to `/api/*` on the frontend domain. Next.js proxies them server-side to the Java backend. The browser sees cookies from the same origin (`SameSite=Lax`), eliminating cross-origin cookie dropping.

### WebSocket Caveat
Vercel serverless functions do not proxy stateful persistent WebSockets. Therefore, **WebSocket connections bypass the rewrite proxy** and connect directly to the backend URL via:
`NEXT_PUBLIC_WS_URL=wss://<your-render-backend-url>/ws`

---

## 2. Step 1: Provision MongoDB Atlas Cluster

1. Sign up or log into [MongoDB Atlas](https://cloud.mongodb.com).
2. Click **Create Deployment** -> Select **M0 (Free)** -> Choose your preferred cloud provider and region (e.g. AWS / us-east-1).
3. Under **Security Quickstart**:
   - Create a database user with username (e.g. `skillswap_app`) and a strong password. Note these down.
   - Under **Network Access**, click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render/Railway containers can connect.
4. Click **Connect** -> **Drivers** -> Copy the connection URI:
   ```
   mongodb+srv://skillswap_app:<password>@cluster0.abcde.mongodb.net/skillswap?retryWrites=true&w=majority
   ```

---

## 3. Step 2: Deploy Backend to Render (or Railway)

### Option A: Render (Web Service from Docker)
1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:
   - **Name**: `skillswap-backend`
   - **Region**: Choose closest to your MongoDB Atlas region (e.g. Frankfurt or Ohio).
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
   - **Instance Type**: Free or Starter
6. In **Environment Variables**, add:
   ```env
   SPRING_DATA_MONGODB_URI=mongodb+srv://skillswap_app:<password>@cluster0.abcde.mongodb.net/skillswap?retryWrites=true&w=majority
   APP_JWT_SECRET=your_super_secret_base64_encoded_key_that_is_at_least_256_bits_long_abcdef123456
   APP_CORS_ALLOWED_ORIGINS=https://skillswap.vercel.app,https://*.vercel.app
   APP_COOKIE_SECURE=true
   SERVER_PORT=8080
   ```
7. In **Health Check Path**, enter:
   `/actuator/health`
8. Click **Create Web Service**. Wait for Docker multi-stage build to finish.
9. Note your public backend URL: `https://skillswap-backend.onrender.com`.

### Option B: Railway
1. Click **New Project** -> **Deploy from GitHub repo**.
2. Set root directory to `/backend`. Railway will automatically detect `backend/Dockerfile`.
3. Add the same environment variables under the **Variables** tab.
4. Under **Settings**, add a Custom Domain or generate a Railway domain (e.g. `skillswap-backend.up.railway.app`).

---

## 4. Step 3: Deploy Frontend to Vercel

1. Log into [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
2. Import the same GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click edit and select `frontend`.
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)
4. Add Environment Variables:
   | Key | Value | Description |
   |-----|-------|-------------|
   | `BACKEND_INTERNAL_URL` | `https://skillswap-backend.onrender.com` | Internal backend URL for Next.js API proxying |
   | `NEXT_PUBLIC_WS_URL` | `wss://skillswap-backend.onrender.com/ws` | Direct WebSocket/STOMP endpoint for browser |
5. Click **Deploy**. Vercel will build the Next.js pages and deploy globally on Edge CDN.
6. Once deployed, copy your production frontend URL (e.g. `https://skillswap.vercel.app`).
7. Update `APP_CORS_ALLOWED_ORIGINS` on Render/Railway with your exact Vercel production domain.

---

## 5. Post-Deployment Verification Checklist

1. [ ] **Health Check**: Open `https://skillswap-backend.onrender.com/actuator/health` - should return `{"status":"UP"}`.
2. [ ] **Swagger UI**: Visit `https://skillswap-backend.onrender.com/swagger-ui/index.html` to confirm OpenAPI docs.
3. [ ] **Demo Seed Data**: Login on your Vercel URL using `elena@example.com` / `SkillSwap123!` using the 1-click button.
4. [ ] **Smart Matching**: Verify Elena sees Marcus Vance with 95%+ match score.
5. [ ] **Real-time Chat**: Verify STOMP WebSocket connection opens cleanly to `wss://...` in browser DevTools Network tab.
6. [ ] **Rate Limiting**: Confirm excessive auth attempts receive HTTP 429 RFC 7807 responses.
