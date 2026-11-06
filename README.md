# DevFlow

DevFlow is a developer productivity and career management platform for software engineering students and junior developers. Manage projects, tasks, internships, skills, learning goals and productivity in one dashboard.

## Features

- Email/password authentication with hashed passwords (NextAuth v5, JWT sessions)
- Dashboard with stats, weekly productivity charts, deadlines, recent activity
- Project management with statuses, priorities, deadlines, tech stack, progress
- Task management with List and Kanban views, touch-friendly drag & drop (`@dnd-kit`: pointer, touch, and keyboard sensors), labels, priorities
- Career/internship tracker with a full application pipeline and conversion stats
- Skills tracker grouped by category with proficiency visualization
- Learning goals with milestones
- Activity/time tracking with per-category totals
- Analytics dashboard powered by Recharts
- **Automatic notifications** — DB-generated deadline/interview alerts via a scheduled cron endpoint (`/api/cron/notifications`, protected by `CRON_SECRET`), idempotent with a 20-hour dedupe window; notification dropdown with mark-read, delete, and click-to-navigate
- **Real password reset** — forgot-password flow with crypto-random tokens (SHA-256 hashed at rest), 30-minute expiry, single-use tokens, and email delivery via Resend (with a dev fallback that logs the reset link)
- Global search (⌘K), dark/light/system theme
- Responsive layout (sidebar on desktop, drawer on mobile)
- Full REST API with Zod validation and per-user authorization

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · PostgreSQL · Prisma 6 · NextAuth v5 · Recharts · @dnd-kit · Resend · Zod · React Hook Form · Vitest

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for session signing |
| `AUTH_URL` | Base URL of the app |
| `NEXT_PUBLIC_APP_URL` | Public app URL (used to build reset links) |
| `RESEND_API_KEY` | Resend API key for password reset emails (optional in dev — reset links are logged instead) |
| `EMAIL_FROM` | Sender address for emails |
| `CRON_SECRET` | Bearer token that protects `/api/cron/notifications` |

### 3. Database

```bash
npm run db:migrate   # creates tables
npm run seed         # loads demo data
```

### 4. Develop

```bash
npm run dev
```

Open http://localhost:3000 — demo account: `demo@devflow.dev` / `password123`.

### 5. Notifications (optional)

Generate notifications for your account immediately:

```bash
curl -X POST http://localhost:3000/api/notifications/generate   # (requires a logged-in session)
```

Or via cron (protected):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/notifications
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate Prisma client & production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |
| `npm run seed` | Seed demo data |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

## Folder Structure

```
prisma/            schema, migrations + seed
src/app/           routes (landing, auth, dashboard pages, api/)
src/app/api/       REST endpoints (auth, tasks, projects, notifications, cron, …)
src/components/    reusable UI (dashboard shell, charts, ui kit, topbar)
src/lib/           prisma client, auth, email, notifications, validations, session helpers
tests/             vitest tests
```

## Testing

```bash
npm test
```

Covers validation schemas, password-reset token handling, and notification generation rules.

## Deployment

1. Provision a PostgreSQL database and set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, and `CRON_SECRET` (set `RESEND_API_KEY` + `EMAIL_FROM` to enable reset emails).
2. `npm run db:migrate`, then `npm run build` and `npm start`.
3. Schedule periodic `curl -H "Authorization: Bearer $CRON_SECRET" $APP_URL/api/cron/notifications` calls to generate deadline notifications.

## Roadmap

- Team workspaces, GitHub OAuth login, CSV export, calendar sync.