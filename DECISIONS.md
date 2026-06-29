# CP Tracker — Architecture Decisions

This document records key technology and design decisions made during the CP Tracker revamp.

---

## Decision 1: Frontend Framework

**Choice:** Keep Next.js 15 (App Router) + React 19 + TypeScript

**Alternatives considered:** Vite + React (as spec suggested)

**Rationale:** The existing codebase is already Next.js with a rich component library (35+ shadcn/ui components), Tailwind config, proper routing, and working AI integration via Genkit server actions. Migrating to Vite would mean losing App Router features (server components, server actions, built-in API routes) and rebuilding what already works. The spec assumed static HTML — it's actually Next.js already.

---

## Decision 2: Styling

**Choice:** Keep Tailwind CSS 3.4 + tailwindcss-animate

**Rationale:** Already in place with a well-configured design system (CSS custom properties for theming, shadcn/ui integration). Consistent with the spec's Tailwind preference.

---

## Decision 3: Backend Architecture

**Choice:** Separate Express.js backend (`server/` directory) alongside the Next.js frontend

**Rationale:** The spec requires long-lived WebSocket connections (Socket.IO) and persistent cron jobs for polling contest APIs — neither works reliably on serverless platforms. A separate Express server runs on Railway/Render with persistent connections. The Next.js frontend deploys to Vercel/Firebase App Hosting for edge performance.

---

## Decision 4: Database

**Choice:** PostgreSQL via Neon (serverless Postgres)

**Alternatives considered:** MongoDB, Supabase Postgres, Railway Postgres

**Rationale:**
- The data is relational (users → submissions, users → contests, users → chat conversations → messages)
- Neon offers a generous free tier, serverless scaling, and excellent Prisma support
- PostgreSQL is the "boring, well-supported option" per the spec's guidance
- Prisma provides type-safe queries and migration management

---

## Decision 5: ORM

**Choice:** Prisma

**Rationale:** Type-safe queries, automatic migration management, excellent PostgreSQL support, widely adopted in the Next.js ecosystem. Per spec guidance.

---

## Decision 6: Authentication

**Choice:** JWT (access + refresh token pair) with bcrypt for password hashing

**Replaces:** Firebase Auth

**Rationale:** Explicit spec requirement. Access token (15 min, in-memory on client) + refresh token (30 days, httpOnly secure cookie). bcrypt cost factor 12.

---

## Decision 7: Real-time Communication

**Choice:** Socket.IO

**Rationale:** Spec requirement for live contest status + leaderboard updates. Socket.IO provides automatic fallback to polling, room-based broadcasting, and reconnection handling.

---

## Decision 8: Contest API Data Sources

| Platform | Source | Why |
|---|---|---|
| Codeforces | Official Codeforces API (`contest.list`, `user.rating`, `user.status`) | Well-documented, stable, officially supported |
| LeetCode | LeetCode's internal GraphQL endpoint | No official public API; this is what their frontend uses. Rate-limit respectfully, cache aggressively |
| AtCoder | Kenkoooo's AtCoder Problems API (`https://kenkoooo.com/atcoder/`) | Community-maintained standard source. More stable than scraping AtCoder directly |

---

## Decision 9: Background Jobs

**Choice:** `node-cron` for scheduling, running in the Express server process

**Alternatives considered:** BullMQ (Redis-backed queue)

**Rationale:** At current scale, `node-cron` is simpler and avoids the Redis dependency. The polling interval (10 min for contests, 10 min for submissions) doesn't require queue semantics. Can migrate to BullMQ later if scale demands it.

---

## Decision 10: AI Provider

**Choice:** Keep Genkit + Google Gemini (`gemini-2.5-flash`)

**Rationale:** Already working in the codebase. Genkit provides structured output schemas (Zod), prompt management, and Google AI integration. Will extend with conversation context and user CP data in the system prompt.

---

## Decision 11: File Storage (Chat Attachments)

**Choice:** Local filesystem on the backend host with signed URL serving

**Alternatives considered:** Supabase Storage, Cloudflare R2

**Rationale:** Simplest option for initial launch. Files are small code files (< 1MB typically). Can migrate to cloud storage later. The Express server stores files in a `uploads/` directory and serves them via authenticated endpoints.

---

## Decision 12: Email Service (Password Reset)

**Choice:** Resend

**Rationale:** Simple API, generous free tier (100 emails/day), excellent developer experience, no complex configuration needed.

---

## Decision 13: Hosting Architecture

**Choice:** Split deployment

| Component | Host | Why |
|---|---|---|
| Next.js frontend | Vercel or Firebase App Hosting | Edge deployment, fast static/SSR delivery |
| Express backend | Railway | Persistent process for WebSockets, cron, file storage |
| PostgreSQL | Neon | Serverless Postgres, auto-scaling |

**Rationale:** Vercel serverless cannot maintain WebSocket connections or run persistent cron jobs. Railway provides a persistent Node.js process with good free tier and easy deployment.

---

## Decision 14: Keep Code Evaluation Feature

**Choice:** Yes — keep the `/evaluate` page and its AI-powered code feedback

**Rationale:** It's the most polished feature in the current codebase, with a working AI pipeline, radar chart visualization, and AI authorship detection. The spec doesn't mention it, but it adds significant value and differentiates the product.
