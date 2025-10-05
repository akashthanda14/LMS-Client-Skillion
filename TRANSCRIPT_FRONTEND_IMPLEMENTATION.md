# Transcript Frontend Implementation (for Mini-LMS)

This document gives a compact, ready-to-implement plan for integrating the backend transcription flow into your Next.js frontend. It assumes your backend exposes these routes (already present in the repo):

- GET /api/lessons/:id — returns lesson with `transcript` field
- GET /api/lessons/:id/transcript-status — returns transcription job status

Goal: display transcripts to learners as soon as they are ready, provide progress UI while the worker runs, and handle errors/fallbacks gracefully. No backend changes required.

---

Quick checklist
- [ ] Add API service functions: getLessonWithTranscript, getTranscriptStatus
- [ ] Implement `useTranscriptPolling` hook (polling + backoff + cleanup)
- [ ] Create `TranscriptViewer` presentational component (copy/paste from guide or use shared UI)
- [ ] Integrate component into lesson page (server component fetches lesson; pass initialTranscript to client component)
- [ ] Add small tests and accessibility attributes

---

Design decisions / constraints
- Keep data fetching for lesson details on the server (App Router server component) and pass `initialTranscript` to client components for hydration and polling.
- Use client component only where necessary (polling & clipboard/download require browser APIs). Use `use client` at component top.
- Use existing api client (axios) and auth header handling already in the frontend.
- Poll at 3–5s initially and back off; stop on `completed` or `failed` or after N attempts.

---

1) API service (typescript)

Create `src/services/transcriptService.ts` (or extend your existing services):

```ts
import apiClient from './api';

export const getLessonWithTranscript = async (lessonId: string) => {
  const res = await apiClient.get(`/api/lessons/${lessonId}`);
  return res.data; // { success: true, lesson }
};

export const getTranscriptStatus = async (lessonId: string) => {
  const res = await apiClient.get(`/api/lessons/${lessonId}/transcript-status`);
  return res.data; // { success:true, data: { status, transcript?, progress?, ... }}
};
```

Notes:
- `apiClient` must attach Authorization header (existing interceptor).
- Keep returned shapes unchanged from backend.

---

2) Polling hook (client)

Create `src/hooks/useTranscriptPolling.ts` (small, resilient):

Key behavior:
- Start only if `initialTranscript` is falsy
- Poll immediately then at interval (3s x10 → 5s x20 → 10s afterwards)
- Stop on `completed` or `failed` or after `maxAttempts`
- Clean up interval on unmount

Return value:
- { status, transcript, isPolling, error, startPolling, stopPolling }

Implement using the version in `FRONTEND_VIDEO_TRANSCRIPTION_GUIDE.md` (it is production-ready).

---

3) TranscriptViewer component (client)

Create `src/components/lesson/TranscriptViewer.tsx` as a client component.

Responsibilities:
- Accept props: { lessonId, initialTranscript?: string, lessonTitle?: string }
- Use `useTranscriptPolling` when no initial transcript
- Show: loading skeleton, status alerts, transcript card, copy and download buttons
- Provide aria attributes: `role="region" aria-label="Video transcript" aria-live="polite"`
- Ensure keyboard access and visible focus states

Accessibility notes:
- Buttons have discernible text + icons
- Copy/Download provide toast or aria-live confirmation
- Transcript container uses `whitespace-pre-wrap` and `aria-live` when new transcript arrives

---

4) Integrate in Lesson Page (App Router)

Pattern (recommended):
- Server component `app/.../page.tsx` fetches lesson via server-side call (using existing fetch wrapper or `getLessonWithTranscript`) and passes `initialTranscript` to client `TranscriptViewer`.

Example snippet:

```tsx
// server component
const lesson = await getLessonWithTranscript(lessonId);
return (
  <div>
    <VideoPlayer videoUrl={lesson.videoUrl} />
    <TranscriptViewer lessonId={lessonId} initialTranscript={lesson.transcript} lessonTitle={lesson.title} />
  </div>
)
```

Why server-fetch? server components are faster and avoid an extra client request; the client component only polls when necessary.

---

5) Creator UX (optional small hook)

For creators, show transcript readiness in lesson list. Use `lesson.transcript` boolean; if missing, optionally call `GET /api/lessons/:id/transcript-status` to show queued/active/failed.

---

6) UI/UX details
- Show unobtrusive loader while transcription runs; do not block playback
- Provide a toast when transcript becomes available (use existing toast library)
- Allow copy/download of transcript
- Collapse transcript on mobile into a sheet
- For failed/transcript-not-queued, show a helpful message and link to contact/support

---

7) Tests & QA
- Unit test `useTranscriptPolling` behavior (mock API) — happy path, failure, backoff, cleanup
- Integration test that `TranscriptViewer` shows skeleton → transcript when mocked status returns `completed`
- Manual tests: large file (>25MB) fallback; network timeouts; not queued case

---

8) Security & performance
- Respect OpenAI file size limits; backend already falls back to dummy transcript for >25MB
- Avoid polling all open tabs: add visibility check to reduce polling when tab is hidden

Snippet:

```ts
if (document.hidden) return; // skip poll
```

---

9) Debugging tips
- If transcript never completes: check worker logs, Redis connectivity, and transcription queue status
- If OpenAI returns 401: verify `OPENAI_API_KEY` in backend environment
- If download fails: ensure Cloudinary URL is accessible and not private

---

10) Acceptance criteria
- Transcript appears in UI within expected time for typical videos
- Polling stops after `completed` or `failed`
- Copy & download work on desktop and mobile
- Accessibility checks: aria labels, keyboard navigation, aria-live updates
- No changes to backend or API shapes

---

If you want, I can:
- Generate the exact `TranscriptViewer.tsx` and `useTranscriptPolling.ts` client components in your repo (small, tested components)
- Add React Query hooks for caching
- Add unit tests (Vitest) for the polling hook

Which one should I implement next? (component, hook, or tests)
