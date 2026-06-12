# QuizAI — AI-Powered Quiz Generator

AI-powered quiz generator built with Next.js 16, NextAuth v5, Supabase, Hugging Face Inference, and TypeScript.

## What It Does

- Generate quizzes from pasted text, uploaded files, or any topic.
- Support three quiz modes: `standard`, `study`, and `adaptive`.
- Save quizzes and attempts in Supabase.
- Authenticate users with NextAuth credentials (email/password).
- Protect expensive generation routes with per-user rate limiting.
- Validate AI output before saving it to the database.
- Enforce strong password and email validation on registration.
- Provide accessibility improvements such as semantic HTML, ARIA labels, and reduced-motion support.
- Emit structured logs and lightweight monitoring events.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | Full-stack React framework |
| React | 18 | UI library |
| TypeScript | 5 | Type safety |
| Supabase | — | PostgreSQL database & auth backend |
| NextAuth | v5 beta | Session management (JWT + Credentials) |
| Hugging Face | — | AI quiz generation (Qwen, Llama, Mixtral) |
| Vitest | 1 | Unit testing |
| ESLint | 9 | Linting (Flat Config) |
| Tailwind CSS | 3 | Utility-first styling |

## Project Structure

```text
src/
  app/
    api/
      attempt/        # Quiz attempt CRUD
      auth/            # NextAuth handlers
      keep-alive/      # Supabase health ping
      quiz/            # Quiz generation & retrieval
      register/        # User registration
    dashboard/         # User dashboard page
    login/             # Login page
    quiz/[id]/         # Quiz player & results
    register/          # Registration page
    upload/            # Quiz creation page
    client-layout.tsx  # Client-side layout (navbar, settings, session)
    globals.css        # Global styles & design tokens
    layout.tsx         # Root layout
    page.tsx           # Landing page
  lib/
    supabase.ts        # Supabase client (server-only)
    security.ts        # Shared security validators
  middleware/
    authHardening.ts   # Auth rate-limiting & security headers
    rateLimit.ts       # Per-user rate limiter (Redis / in-memory)
  proxy.ts             # Next.js middleware (auth redirect)
  auth.ts              # NextAuth configuration
  lib.ts               # AI quiz generation logic
  logger.ts            # Structured logger
  monitoring.ts        # Event tracking
supabase/
  setup.sql            # Database schema & RLS guidance
test/
  api.test.ts          # API validation & rate limit tests
  lib.test.ts          # Quiz question validation tests
  security.test.ts     # Security validator tests
```

## Features

### Quiz Generation

- Accepts pasted text, uploaded `.txt`, `.pdf`, and `.md` files, or a topic prompt.
- AI generates questions using a multi-model fallback chain (Qwen → Llama → Mixtral).
- Validates all generated questions before persisting to the database.
- Enforces a 5 MB upload limit on file uploads.
- Applies per-user rate limiting (3 requests/min) on quiz generation.

### Authentication

- Email/password sign-up and sign-in via NextAuth v5.
- Server-side Supabase access using service-role credentials (never exposed to clients).
- Auth hardening middleware for rate limiting and security headers (X-Frame-Options, X-XSS-Protection, etc.).

### Security

- **Email validation**: Rejects malformed email addresses on registration.
- **Strong password enforcement**: Requires 8+ characters with uppercase, lowercase, digit, and special character.
- **AI output validation**: All generated questions are validated before database insertion.
- **Rate limiting**: Quiz generation is rate-limited per user with Redis support (falls back to in-memory).
- **File size limits**: Uploads are capped at 5 MB.
- **Server-only credentials**: Supabase keys are never exposed to the client bundle.
- **XSS/SQL injection helpers**: Shared `escapeHtml` and `sanitizeForDb` utilities in `src/lib/security.ts`.
- **Orphan cleanup**: If question insertion fails, the parent quiz is automatically deleted.

### Data Integrity

- Deletes orphaned quizzes if question insertion fails.
- Uses Supabase schema with RLS guidance in `supabase/setup.sql`.

### Observability

- Structured logs with ISO timestamp and severity level.
- Monitoring hooks for quiz creation, failures, and keep-alive health checks.

### Accessibility

- Reduced-motion support via `prefers-reduced-motion` media query.
- Semantic landmarks and ARIA labels throughout the UI.
- Keyboard-accessible controls (file upload, quiz navigation).
- Form inputs have labels, helper text, and `aria-describedby` hints.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` with:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
NEXTAUTH_SECRET=generate_a_strong_secret
NEXTAUTH_URL=http://localhost:3000
HF_TOKEN=your_huggingface_token
REDIS_URL=redis://localhost:6379          # optional
```

> **Important**: Do not use `NEXT_PUBLIC_SUPABASE_*` for server credentials. `REDIS_URL` is optional — rate limiting falls back to in-memory when Redis is unavailable.

### 3. Apply the database schema

Run `supabase/setup.sql` in Supabase Dashboard → SQL Editor to create tables, indexes, and RLS guidance.

### 4. Start the development server

```bash
npm run dev
```

## Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `next dev` | Start development server |
| `npm run build` | `next build` | Build for production |
| `npm start` | `next start` | Start production server |
| `npm test` | `vitest run` | Run the Vitest test suite |
| `npm run lint` | `eslint src` | Run ESLint (Flat Config) |

## Testing

The repository includes unit tests for validation, rate limiting, and security logic.

```bash
npm test
```

Test files:

- `test/lib.test.ts` — Quiz question validation
- `test/api.test.ts` — API validation & rate limit logic
- `test/security.test.ts` — Email, password, XSS, and SQL injection validators

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/quiz` | Generate quiz (file upload, text, or topic) |
| `GET` | `/api/quiz?id=...` | Fetch a quiz with its questions |
| `POST` | `/api/attempt` | Submit a quiz attempt |
| `GET` | `/api/attempt` | Fetch attempt history (dashboard) |
| `GET` | `/api/attempt?id=...` | Fetch a specific attempt |
| `POST` | `/api/register` | Register a new user |
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth handlers |
| `GET` | `/api/keep-alive` | Health-style ping for Supabase |

## Deployment

Recommended production checklist:

1. Set all required environment variables.
2. Apply the database schema and configure RLS policies.
3. Run `npm test` to verify tests pass.
4. Run `npm run build` to verify the build succeeds.
5. Deploy to Vercel, Netlify, or your host of choice.

## Troubleshooting

| Problem | Solution |
|---|---|
| Login fails | Confirm `NEXTAUTH_SECRET` and Supabase credentials are set correctly |
| Quiz generation fails | Verify `HF_TOKEN` is valid and model endpoints are available |
| Rate limiting unexpected in production | Connect Redis via `REDIS_URL` for distributed rate limiting |
| Database reads fail | Verify RLS policies and table ownership in Supabase |
| Lint fails | Ensure `eslint.config.mjs` exists and `@eslint/eslintrc` is installed |

## License

No license file is currently included.
