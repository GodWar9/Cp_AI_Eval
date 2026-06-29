# CP Tracker / ALL IN

A full-stack competitive programming tracker and AI mentoring platform. Built as an evolution of a GDG hackathon project, CP Tracker integrates Codeforces, LeetCode, and AtCoder into a single unified dashboard with a global leaderboard and context-aware AI chatbot.

## Architecture

This project is structured as a monorepo with a distinct frontend and backend:

### Frontend (Next.js 15)
- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS + shadcn/ui components
- **State/Auth:** Custom React Contexts (`AuthContext`, `SocketContext`)

### Backend (`/server` - Node/Express)
- **Framework:** Express.js + Socket.IO
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT (Access + Refresh tokens) + bcrypt
- **AI Integration:** Google Generative AI (`gemini-2.5-flash`)
- **Background Jobs:** `node-cron` for polling external APIs

## Key Features

1. **Unified CP Dashboard:** Visual heatmap and timeline of your submissions across CF, LC, and AC.
2. **Global Leaderboard:** Ranks users based on our custom Code Quality Index (CQI) algorithm (volume, consistency, and contest rating).
3. **Context-Aware AI Chatbot:** Chat with Gemini 2.5 Flash. It has access to your actual CP profile context (CQI, recent submissions, linked platforms) and supports code file uploads for deep debugging.
4. **Real-time Contests:** Socket.IO powered widget showing live and upcoming contests.

## Local Development

### 1. Database Setup
You will need a PostgreSQL database. [Neon](https://neon.tech) is recommended for a quick serverless instance.
```bash
cd server
npm install
# Set DATABASE_URL in server/.env
npx prisma db push
npx prisma generate
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the root and fill it out:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- `GOOGLE_GENAI_API_KEY`
- `RESEND_API_KEY` (optional, for password resets)

### 3. Run Backend
```bash
cd server
npm run dev
# Starts on port 3001
```

### 4. Run Frontend
```bash
npm install
npm run dev
# Starts on port 9002
```

## Documentation
- **[Architecture Decisions (DECISIONS.md)](DECISIONS.md)**
- **[API Reference (API.md)](API.md)**
- **[CQI Formula (CQI_FORMULA.md)](CQI_FORMULA.md)**
