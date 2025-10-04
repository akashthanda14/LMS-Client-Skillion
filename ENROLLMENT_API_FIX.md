# Enrollment API Fix Documentation

## Overview
Updated all enrollment-related TypeScript interfaces in `/src/lib/api.ts` to match the backend API documentation (`ENROLLMENT_SYSTEM.md`).

## Changes Made

### 1. Updated EnrollmentResponse Interface
**Before:**
```typescript
export interface EnrollmentResponse {
  id: string;
  progress: number;
  enrolledAt: string;
}
```

**After:**
```typescript
export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    enrollment: {
      id: string;
      progress: number;
      enrolledAt: string;
    };
  };
}
```

**Reason:** Backend returns a standardized response with `success`, `message`, and nested `data.enrollment` structure.

### 2. Added New Enrollment Interfaces

#### LessonProgressItem
```typescript
export interface LessonProgressItem {
  lessonId: string;
  lessonTitle: string;
  completedAt: string | null;
}
```
Represents individual lesson completion status within a course.

#### EnrollmentDetail
```typescript
export interface EnrollmentDetail {
  id: string;
  progress: number;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    lessonCount: number;
    creator: {
      id: string;
      name: string | null;
      username?: string;
    };
  };
  lessonProgress: LessonProgressItem[];
}
```
Complete enrollment details including course information and lesson progress.

#### GetProgressResponse
```typescript
export interface GetProgressResponse {
  success: boolean;
  data: {
    enrollments: EnrollmentDetail[];
  };
}
```
Response for `GET /api/progress` - returns all user enrollments.

#### GetCourseProgressResponse
```typescript
export interface GetCourseProgressResponse {
  success: boolean;
  data: {
    enrollment: EnrollmentDetail;
  };
}
```
Response for `GET /api/courses/:id/progress` - returns single course enrollment details.

#### CompleteLessonResponse
```typescript
export interface CompleteLessonResponse {
  success: boolean;
  message: string;
  data: {
    lessonProgress: {
      lessonId: string;
      completedAt: string;
    };
    enrollment: {
      id: string;
      progress: number;
    };
  };
}
```
Response for `POST /api/lessons/:id/complete` - marks lesson as complete.

#### EnrollmentStatusResponse
```typescript
export interface EnrollmentStatusResponse {
  success: boolean;
  data: {
    isEnrolled: boolean;
    enrollment?: {
      id: string;
      progress: number;
      enrolledAt: string;
    };
  };
}
```
Response for `GET /api/courses/:id/enrollment` - checks enrollment status.

### 3. Fixed getCourseProgress Method
**Before:**
```typescript
getCourseProgress: async (courseId: string): Promise<{ success: boolean; data: CourseProgress }> => {
  const response = await api.get<{ success: boolean; data: CourseProgress }>(`/api/courses/${courseId}/progress`);
  return response.data;
}
```

**After:**
```typescript
getCourseProgress: async (courseId: string): Promise<GetCourseProgressResponse> => {
  const response = await api.get<GetCourseProgressResponse>(`/api/courses/${courseId}/progress`);
  return response.data;
}
```

**Reason:** The `CourseProgress` type didn't exist. Now uses the correct `GetCourseProgressResponse` interface.

### 4. Removed Duplicate Interfaces
- Removed duplicate `CourseProgress` interface (undefined type)
- Removed duplicate `GetProgressResponse` definition that conflicted with the correct one
- Removed duplicate `CompleteLessonResponse` definition

### 5. Updated enrollInCourse Mock Response
**Before:**
```typescript
return {
  id: 'mock-enrollment-id',
  progress: 0,
  enrolledAt: new Date().toISOString(),
};
```

**After:**
```typescript
return {
  success: true,
  message: 'Successfully enrolled in course',
  data: {
    enrollment: {
      id: 'mock-enrollment-id',
      progress: 0,
      enrolledAt: new Date().toISOString(),
    },
  },
};
```

## API Endpoint Mapping

| Endpoint | Method | Request | Response Interface |
|----------|--------|---------|-------------------|
| `/api/courses/:id/enroll` | POST | `{ courseId: string }` | `EnrollmentResponse` |
| `/api/progress` | GET | - | `GetProgressResponse` |
| `/api/courses/:id/progress` | GET | - | `GetCourseProgressResponse` |
| `/api/lessons/:id/complete` | POST | `{ lessonId: string }` | `CompleteLessonResponse` |
| `/api/courses/:id/enrollment` | GET | - | `EnrollmentStatusResponse` |

## Backend Response Structure

All enrollment endpoints follow this pattern:
```typescript
{
  success: boolean,
  message?: string,  // For mutations (POST/PUT/DELETE)
  data: {
    // Actual data here
  }
}
```

## Testing Checklist

- [ ] Test course enrollment: `POST /api/courses/:id/enroll`
- [ ] Test getting all progress: `GET /api/progress`
- [ ] Test getting course progress: `GET /api/courses/:id/progress`
- [ ] Test completing a lesson: `POST /api/lessons/:id/complete`
- [ ] Test checking enrollment status: `GET /api/courses/:id/enrollment`
- [ ] Verify EnrollButton component works with new response format
- [ ] Verify CourseContext enrollInCourse function handles new response
- [ ] Test progress tracking in UI

## Components Affected

These components use enrollment APIs and may need updates:
1. `/src/contexts/CourseContext.tsx` - Uses `enrollInCourse`, `getCourseProgress`
2. `/src/components/courses/EnrollButton.tsx` - Triggers enrollment
3. Any progress tracking components that display lesson completion
4. Any certificate components that check completion status

## Notes

- All interfaces now match the backend documentation exactly
- No more TypeScript compilation errors in `api.ts`
- The enrollment system uses a nested data structure for better API consistency
- Progress is tracked at both course level (overall percentage) and lesson level (individual completion)

## Related Documentation

- `ENROLLMENT_SYSTEM.md` - Backend API documentation
- `ENROLLMENT_QUICK_START.md` - Backend quick start guide
- `COURSE_MANAGEMENT.md` - Course creation and management
- `CREATOR_API_FIX.md` - Related creator API fixes

## Date
Fixed: December 2024
