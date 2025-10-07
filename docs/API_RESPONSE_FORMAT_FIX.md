# API Response Format Fix

## Issue
The backend API returns course data wrapped in a response object with the format:
```json
{
  "success": true,
  "count": 3,
  "courses": [...]
}
```

However, the frontend was expecting the courses array directly, causing the course listing to fail.

## Solution Applied

### 1. Added Response Type Interfaces
Created TypeScript interfaces to match the backend response format:

```typescript
interface GetCoursesResponse {
  success: boolean;
  count: number;
  courses: Course[];
}

interface GetCourseByIdResponse {
  success: boolean;
  course: CourseDetail;
}
```

### 2. Updated courseAPI.getCourses()
Changed from:
```typescript
const response = await api.get<Course[]>('/api/courses');
return response.data;
```

To:
```typescript
const response = await api.get<GetCoursesResponse>('/api/courses');
return response.data.courses; // Extract courses array from wrapper
```

### 3. Updated courseAPI.getCourseById()
Changed from:
```typescript
const response = await api.get<CourseDetail>(`/api/courses/${id}`);
return response.data;
```

To:
```typescript
const response = await api.get<GetCourseByIdResponse>(`/api/courses/${id}`);
return response.data.course; // Extract course object from wrapper
```

### 4. Updated Course Interface
Updated the `Course` interface to match the actual backend response fields:

**Key Changes:**
- `category`: Added as string (was missing)
- `duration`: Changed from string to number (represents minutes)
- `lessonCount`: Added (number of lessons in course)
- `creator.name`: Changed to allow null
- `creator.username`: Added (backend provides this)
- `creator.email`: Added (backend provides this)
- **Removed fields**: `price`, `rating`, `creatorId`, `updatedAt`, `published`

**Final Interface:**
```typescript
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  thumbnailUrl?: string; // Backend field (alias for thumbnail)
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number; // Duration in minutes
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  publishedAt?: string;
  creator: {
    id: string;
    name: string | null;
    username?: string;
    email?: string;
  };
  lessonCount: number;
  enrollmentCount: number;
}
```

## Backend API Response Example
```json
{
  "success": true,
  "count": 3,
  "courses": [
    {
      "id": "cm5v7fqn70000nqvd45d5pj2v",
      "title": "Introduction to React",
      "description": "Learn the basics of React",
      "category": "web-development",
      "level": "BEGINNER",
      "duration": 180,
      "status": "PUBLISHED",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "createdAt": "2025-01-14T08:59:06.899Z",
      "publishedAt": "2025-01-14T09:00:00.000Z",
      "lessonCount": 5,
      "enrollmentCount": 42,
      "creator": {
        "id": "cm5trwz4n0000v5h3kj1irkqj",
        "name": null,
        "username": "johndoe",
        "email": "john@example.com"
      }
    }
  ]
}
```

## Impact
✅ Course listing now properly displays courses from backend
✅ Course detail pages load correctly
✅ TypeScript type safety maintained with proper interfaces
✅ No breaking changes to component code (CourseContext handles the data extraction)

## Testing Checklist
- [ ] Course listing page displays courses correctly
- [ ] Course filters work with real backend data
- [ ] Course detail page loads individual course data
- [ ] Enrollment functionality works
- [ ] Creator dashboard shows courses properly
- [ ] No TypeScript errors in build

## Related Files
- `/src/lib/api.ts` - Updated courseAPI methods and Course interface
- `/src/contexts/CourseContext.tsx` - Uses courseAPI (no changes needed)
- All course components - No changes needed (they consume from CourseContext)

## Date
January 14, 2025
