# Creator Course Creation API (Short Reference)

## Endpoint
POST /api/courses

## Access / Auth
- Requires `Authorization: Bearer <JWT>` header
- Authenticated user role must be `CREATOR` (403 otherwise)

## Content Type
`multipart/form-data` (let the browser set the boundary; do NOT manually set `Content-Type`).

## Form Fields
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | yes | 5–100 chars |
| description | string | yes | 20–1000 chars |
| thumbnail | file | no | jpeg/jpg/png/webp/gif, max 5MB |
| category | string | no | free text |
| level | string | no | BEGINNER \| INTERMEDIATE \| ADVANCED |

Notes:
- Omit `thumbnail` to create without an image.
- Server sanitizes and validates; client-side checks are advisory only.

## Server Behavior (Summary)
1. Validates payload (title, description length, enum values, file type/size).
2. If `thumbnail` present: uploads to Cloudinary; resulting URL stored in DB.
3. Persists course as `DRAFT`.
4. Returns 201 with created course JSON.

## Success (201)
```json
{
  "success": true,
  "message": "Course created successfully as DRAFT",
  "course": {
    "id": "<uuid>
","title":"<string>","description":"<string>","thumbnail":"https://.../image.jpg","status":"DRAFT","createdAt":"2025-01-01T12:00:00.000Z"}
}
```

## Errors
| Status | Reason |
|--------|--------|
| 400 | Validation failed (returns `errors` array or message) |
| 400 | Thumbnail upload failure |
| 401 | Missing / invalid token |
| 403 | User role not CREATOR |
| 500 | Internal server error |

Example validation error:
```json
{ "success": false, "message": "Validation failed", "errors": [{"field":"title","message":"Title must be at least 5 characters"}] }
```

## curl Example
```bash
curl -X POST "$API_BASE/api/courses" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Intro to X" \
  -F "description=Long description at least 20 characters..." \
  -F "level=BEGINNER" \
  -F "thumbnail=@/path/to/file.jpg"
```

## Minimal Frontend Snippet (fetch)
```ts
import { getApiBase } from '@/lib/apiBase';

async function createCourse(input: {title: string; description: string; category?: string; level?: string; thumbnailFile?: File}) {
  const base = getApiBase();
  const fd = new FormData();
  fd.append('title', input.title);
  fd.append('description', input.description);
  if (input.category) fd.append('category', input.category);
  if (input.level) fd.append('level', input.level);
  if (input.thumbnailFile) fd.append('thumbnail', input.thumbnailFile);
  const res = await fetch(`${base}/api/courses`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')||''}` }, body: fd });
  if (!res.ok) throw new Error((await res.json().catch(()=>({message:'Create failed'}))).message);
  return res.json();
}
```

## React Query Mutation Example
```ts
import { useMutation } from '@tanstack/react-query';

export function useCreateCourse() {
  return useMutation({ mutationFn: createCourse });
}
```

## TypeScript Interfaces (Client-side convenience)
```ts
export interface CreatedCourse {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
}

export interface CreateCourseResponse {
  success: boolean;
  message: string;
  course: CreatedCourse;
}
```

## Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| 404 to `/creator/undefined/api/courses` | Missing `NEXT_PUBLIC_API_URL` | Add it to `.env.local` and restart dev server |
| 401 Unauthorized | Token absent/expired | Re-login; ensure bearer header set |
| 400 thumbnail error | Invalid file type/size | Ensure <=5MB & correct mime |
| Network CORS error | Backend CORS not permitting origin | Add frontend origin to backend CORS whitelist |

## Related Code (Backend)
- Route: `courseRoutes.js` (`POST /api/courses`)
- Controller: `courseController.js` (`createNewCourse`)
- Validation: `courseValidationService.js`

---
Short, actionable. Extend in a full spec if more fields get added.
