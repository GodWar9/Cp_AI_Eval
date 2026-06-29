# CP Tracker — Current State Audit

**Date:** 2026-06-29
**Audited by:** Antigravity build agent
**Repo:** `netalgupta/All-In_CodeEvaluator_GDG`

---

## 1. Current Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 3.4 + tailwindcss-animate |
| UI Components | Radix UI primitives + shadcn/ui |
| Auth | Firebase Auth (email/password) |
| Database | Firestore (NoSQL) |
| AI | Genkit 1.20 + Google Gemini (`gemini-2.5-flash`) |
| Charts | Recharts |
| Hosting | Firebase App Hosting (`apphosting.yaml`) |

> **Note:** The README references `server.js` and `integrate.js` — these files **do not exist**. They are from an earlier version of the project. The current app uses Next.js App Router with Genkit server actions.

---

## 2. Routes / Pages

| Route | File | Description | Data Source |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Landing page with hero + feature grid | Unsplash placeholder images |
| `/evaluate` | `src/app/evaluate/page.tsx` | Code evaluation with AI feedback | Real AI (Genkit) — **working** |
| `/leaderboard` | `src/app/leaderboard/page.tsx` | Leaderboard table | **100% hardcoded mock data** |
| `/cp-tracker` | `src/app/cp-tracker/page.tsx` | Submissions + heatmap + contest timeline | **100% hardcoded mock data** |
| `/chatbot` | `src/app/chatbot/page.tsx` | AI chatbot interface | Real AI (Genkit) but **single-turn only** |
| `/login` | `src/app/login/page.tsx` | Login form | Firebase Auth |
| `/signup` | `src/app/signup/page.tsx` | Signup form | Firebase Auth |
| `/profile` | `src/app/profile/page.tsx` | User profile | **Hardcoded mock data** with some Firebase user info |

---

## 3. Hardcoded / Mock Data Inventory

### Leaderboard (`src/app/leaderboard/page.tsx`, lines 6-14)
- 7 fake users: "Alex Turing", "Brendan Eich", "Grace Hopper", "Linus Torvalds", "Ada Lovelace", "Yukihiro Matsumoto", "Guido van Rossum"
- All use `pravatar.cc` placeholder avatars
- Fake scores: 4850, 4700, 4680, 4520, 4310, 4200, 4150

### CP Tracker Submissions (`src/app/cp-tracker/page.tsx`, lines 7-31)
- 23 hardcoded submissions mixing LeetCode and Codeforces problems
- All from July 2024
- Fake ratings (3.0-4.9) that don't correspond to any real metric

### Contest Heatmap (`src/components/cp-tracker/contest-heatmap.tsx`, lines 9-16)
- 365 days of data generated with `Math.random() * 5`
- Completely random, not tied to any real submissions

### Contest Timeline (`src/components/cp-tracker/contest-timeline.tsx`, lines 19-60)
- 5 hardcoded contests from August 2024
- Mix of Codeforces, LeetCode, and AtCoder
- "Set Reminder" button just shows a dialog — no real notification

### Profile (`src/app/profile/page.tsx`, lines 14-26)
- Hardcoded "Netal Gupta" profile with fake bio, skills, stats
- Uses `pravatar.cc` avatar
- Stats: 342 problems, 4.6 avg rating, 47 contests, 12 projects — all fake
- Falls back to this mock data even when a real user is logged in

### Placeholder Images (`src/lib/placeholder-images.json`)
- 2 Unsplash stock photos used on the landing page hero
- Loaded via `PlaceHolderImages` helper (`src/lib/placeholder-images.ts`)

---

## 4. AI / Genkit Integration

### Working Flows
1. **`ai-coding-assistant.ts`** — Single-turn chatbot. Takes a `query` string, returns a `response`. No conversation history, no context.
2. **`personalized-code-feedback.ts`** — Code evaluation. Takes code + language + skill level, returns structured feedback with ratings, explanations, and AI detection.

### Configuration
- Provider: Google AI (Gemini 2.5 Flash)
- Setup: `src/ai/genkit.ts`
- Dev entry: `src/ai/dev.ts`
- API key handling: via Genkit's Google AI plugin (expects `GOOGLE_GENAI_API_KEY` env var)

---

## 5. Firebase Integration

### Auth
- Email/password sign-in via `signInWithEmailAndPassword`
- Email/password sign-up via `createUserWithEmailAndPassword`
- Auth state managed via `FirebaseProvider` + `onAuthStateChanged`
- Hooks: `useUser()`, `useAuth()`, `useFirebase()`

### Firestore
- 3 collections under `/users/{userId}/`:
  - `userProfiles/{userProfileId}` — user profile
  - `codeEvaluations/{codeEvaluationId}` — code evaluation results
  - `competitiveProgrammingSubmissions/{submissionId}` — CP submissions
- Security rules enforce user-ownership model (path-based)
- Hooks: `useCollection()`, `useDoc()`

### Config
- Firebase config is **hardcoded** in `src/firebase/config.ts` (API key, project ID, etc.)
- `.env*` is in `.gitignore` but no `.env.example` exists

---

## 6. Secrets / Environment Variables

- **No `.env.example` exists**
- Firebase config hardcoded in source (`src/firebase/config.ts`)
- Genkit expects `GOOGLE_GENAI_API_KEY` but it's not documented
- `.env*` is in `.gitignore` ✓

---

## 7. What integrate.js Currently Does

**`integrate.js` does not exist in the codebase.** The README describes it as "Core data pipeline" that "fetches data" from GitHub API and LeetCode scraping — this is from a prior version. No such pipeline exists in the current Next.js app. Data fetching would need to be built from scratch.

---

## 8. Assets to Remove

- `src/lib/placeholder-images.json` — Unsplash stock photos
- `src/lib/placeholder-images.ts` — Placeholder image helper
- All `pravatar.cc` avatar URLs (leaderboard + profile)
- `next.config.ts` remote image patterns for `placehold.co`, `picsum.photos`
