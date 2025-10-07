<!-- Docs landing for the MicroCourses project -->
# MicroCourses — Documentation

A single-page, practical reference for developers working on MicroCourses (LMS-Next). This document consolidates the most important information you need to build, test, and ship the app.

## Quick overview

- Project: MicroCourses — a modern Learning Management System built with Next.js 15, TypeScript and Tailwind.
- Purpose: support learners, creators, and admins with courses, enrollment, progress tracking and certificates.
- Stack highlights: Next.js 15 (app router), React 19, TypeScript, Tailwind CSS, Zustand, Axios, Framer Motion, ShadCN UI.

## What’s in this repo (high level)

```
src/
├── app/           # Next.js app router pages and route handlers
├── components/    # Reusable UI components (auth, courses, UI primitives)
├── lib/           # API helpers, configuration, utilities
├── store/         # Zustand stores
├── hooks/         # Reusable React hooks
└── public/        # Static assets
```

See the `src/` tree for details. This docs file focuses on getting you productive quickly and covering the project conventions.

## Getting started (developer)

Prerequisites
- Node.js 18+ recommended
- Yarn or npm (project uses npm scripts)
- Backend API (development mode): set `NEXT_PUBLIC_API_BASE_URL` to a running backend (default: `http://localhost:4000`)

Install

```bash
git clone <your-repo-url>
cd microcourses
npm install
```

Environment

Create a `.env.local` (not committed) with at least:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Run (dev)

```bash
npm run dev
```

Build (production)

```bash
npm run build
npm run start
```

Lint

```bash
npm run lint
```

## Core concepts and patterns

- App Router: pages and server components live under `src/app/`.
- Client components: use `"use client"` and live alongside server components where necessary.
- API layer: `src/lib/api.ts` centralizes HTTP calls and helpers (auth, courses, progress, certificates).
- State: small global state uses Zustand; local UI state handled in components/hooks.
- Styling: Tailwind CSS + ShadCN patterns for small, composable primitives.

## Authentication & Roles

Three roles are used across the app:
- LEARNER — enroll and take courses
- CREATOR — create/manage courses
- ADMIN — platform administration

Auth flow summary:
- JWT-based access tokens are returned from the backend and stored client-side via the auth store.
- `ProtectedRoute` / middleware ensure route-level protection.

## Certificates (developer notes)

The app includes a certificates workflow surfaced in several places (lesson page, course detail, dashboard, user certificates page):

- `src/lib/api.ts` exposes helpers: `getCertificate`, `generateCertificate`, `waitForCertificate`, `downloadCertificate`, `getUserCertificates`, `verifyCertificate`.
- The frontend supports an idempotent generate + poll flow: call `generateCertificate(enrollmentId)` then `waitForCertificate` to poll the metadata endpoint until the certificate is ready.
- Download: the client fetches a PDF blob via `downloadCertificate` and triggers user download.
- Public verification: `GET /api/certificates/verify/:serialHash` returns certificate metadata for a public verification page.

If you’re debugging missing certificates, check the backend worker responsible for generation and the `certificates` table/objects in the backend. The frontend tolerates a missing generate endpoint and surfaces friendly messages.

## Project structure (expanded)

- `src/app/` — route-level components and pages. Notable routes:
  - `/learn/[lessonId]` — lesson player with progress and certificate banner
  - `/courses/[id]` — course detail and enrollment
  - `/my-courses` — learner's active/completed courses and quick download
  - `/certificates` — user certificates list

- `src/components/` — organized by area:
  - `auth/` — login/register UI, navigation, protection wrappers
  - `courses/` — CourseCard, CourseDetail, EnrollButton
  - `progress/` — certificate banner, download control, polling hooks
  - `ui/` — Button, Card, Alert, Badge (ShadCN-style primitives)

- `src/lib/api.ts` — central place for REST wrappers. Use it rather than ad-hoc fetch/axios calls.

- `src/hooks/` — hooks used across the app, e.g., polling, debounce, transcript polling

## Development workflow & best practices

- Keep API calls centralized in `src/lib/api.ts`.
- Prefer small, focused components that accept data via props; lift state to stores only when it must be shared.
- Type safety: prefer `unknown` in catch blocks, narrow before rendering; avoid `any` unless unavoidable.
- Lint & types: run `npm run lint` and `npm run build` to surface TypeScript issues early.

## Testing and QA

This project contains no heavy test suite by default. Recommended additions:

- Unit tests: Jest + React Testing Library for components and hooks.
- Integration tests: Playwright or Cypress for core flows (enroll, progress, certificate generation).

## Deployment

Recommended: Vercel for frontend. Minimal steps:

1. Build: `npm run build`
2. Deploy using Vercel or Docker (Dockerfile available if you prefer containerized deploy).

Environment variables should include the backend base URL and any secrets required for server-side route handlers.

## Troubleshooting

- Missing certificate metadata after calling generate: verify backend worker logs and DB rows, check storage upload permissions.
- Type errors during build: run `npm run build` locally and fix TypeScript errors; many issues are due to `unknown` being used directly in JSX — convert to string or narrow types first.
- Lint failures: run `npm run lint` and address rules — the repo follows strict rules for `no-explicit-any` and `react-hooks/exhaustive-deps`.

## Contributing

1. Fork the repository
2. Create a branch (`git checkout -b feat/your-feature`)
3. Make changes, run `npm run lint` and `npm run build` locally
4. Commit and push, open a PR with a clear description and testing steps

Guidelines
- Keep PRs small and focused
- Add types and tests for new behaviors
- Document API changes in `docs/` and update this landing file when routes or contracts change

## Useful commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Contacts & resources

- Primary repo: `LMS-Next` (owner: akashthanda14)
- For architecture notes, see `docs/ARCHITECTURE.md`

---

This file is intended as the canonical entrypoint for developer docs in `docs/`. If you want, I can:

- (A) Expand this into separate pages (`getting-started.md`, `architecture.md`, `api.md`) and wire a simple index, or
- (B) Commit the change now with a descriptive message.

Tell me which follow-up you prefer.
