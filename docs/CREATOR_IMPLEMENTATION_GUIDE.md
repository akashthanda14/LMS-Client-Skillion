# Creator Functionality Implementation Guide

## Overview
This document details all creator-facing features implemented in the frontend, including course creation, file uploads, lesson management, and optimistic UI patterns.

## Completed Features

### 1. API Integration (`/src/lib/api.ts`)

#### creatorAPI Enhancements
- ✅ `getThumbnailUploadCredentials()` - Get Cloudinary signed upload params for images
- ✅ `uploadThumbnail()` - Direct browser upload to Cloudinary with validation
- ✅ `uploadVideo()` - Video upload with XHR progress tracking
- ✅ `createCourse()` - Create new course in DRAFT status
- ✅ `getDashboard()` - Fetch creator stats and courses
- ✅ `submitApplication()` - Apply to become a creator
- ✅ `getStatus()` - Check creator application status

#### courseAPI Functions
- ✅ `getCourses()` - List courses (creator sees own courses)
- ✅ `getCourseById()` - Get full course details with lessons
- ✅ `updateCourse()` - Update course (DRAFT only)
- ✅ `submitCourse()` - Submit for admin review (DRAFT → PENDING)
- ✅ `getUploadCredentials()` - Get video upload credentials
- ✅ `createLesson()` - Create new lesson after upload
- ✅ `getCourseLessons()` - Get all lessons for a course

#### lessonAPI Functions
- ✅ `getLessonById()` - Get lesson details
- ✅ `updateLesson()` - Update lesson metadata
- ✅ `deleteLesson()` - Delete lesson (with Cloudinary cleanup option)
- ✅ `completeLesson()` - Mark lesson complete (learner action)

### 2. Custom Components

#### ThumbnailUploader (`/src/components/creator/ThumbnailUploader.tsx`)
**Purpose:** Handle course thumbnail uploads with drag-and-drop

**Features:**
- Drag-and-drop image upload
- Instant preview using FileReader
- Size validation (max 5MB)
- Format validation (image/* only)
- Cloudinary signed upload
- Loading states and error handling
- Remove/replace functionality

**Usage:**
```tsx
<ThumbnailUploader
  courseId={courseId}
  currentThumbnail={course.thumbnail}
  onUploadComplete={(url) => handleThumbnailUpdate(url)}
/>
```

**Flow:**
1. User selects/drops image
2. Client-side validation (size, type)
3. Show instant preview
4. Request signed credentials from backend
5. Upload directly to Cloudinary
6. Return secure_url to parent component
7. Parent saves URL to course record

#### LessonUploader (`/src/components/creator/LessonUploader.tsx`)
**Purpose:** Video upload with progress tracking

**Features:**
- File selection with validation
- XHR-based upload with progress bar
- Real-time upload percentage
- Processing status indicators
- Auto-populate lesson title from filename
- Create lesson after successful upload

**States:**
- `uploading` - File is being uploaded
- `processing` - Cloudinary is processing video
- `success` - Upload complete
- `error` - Upload failed

#### CourseCreationModal (`/src/components/creator/CourseCreationModal.tsx`)
**Features:**
- Form with all required fields
- Thumbnail upload integration
- Level selection (BEGINNER/INTERMEDIATE/ADVANCED)
- Category selection
- Duration estimation
- Validation before submission
- Redirect to edit page after creation

#### CourseEditor (`/src/components/creator/CourseEditor.tsx`)
**Features:**
- Edit course metadata
- Update thumbnail
- Add/reorder lessons
- Submit for review workflow
- Draft/pending status indicators

#### LessonList (`/src/components/creator/LessonList.tsx`)
**Features:**
- Display all lessons for a course
- Drag-and-drop reordering
- Edit lesson metadata
- Delete lessons with confirmation
- Transcript status indicators
- Duration display

### 3. Pages

#### Creator Dashboard (`/src/app/creator/dashboard/page.tsx`)
**Displays:**
- Total courses
- Published courses count
- Pending courses count
- Draft courses count
- Course list with status badges
- Quick actions (create, edit, view)

#### Course Edit Page (`/src/app/creator/courses/[id]/edit/page.tsx`)
**Features:**
- Course metadata editing
- Thumbnail management
- Lesson list and upload
- Submit for review button
- Save draft functionality

#### Creator Application (`/src/app/creator/apply/page.tsx`)
**Form fields:**
- Bio (100-500 characters)
- Experience description
- Portfolio URL (optional)
- Why you want to be a creator

#### Application Status (`/src/app/creator/status/page.tsx`)
**Shows:**
- Application status (PENDING/APPROVED/REJECTED)
- Submission date
- Admin feedback (if any)
- Next steps guidance

### 4. Learner Features

#### Custom Hooks
- `useCourse(id)` - Fetch and cache course details
- `useEnrollment()` - Handle course enrollment
- `useProgress()` - Track learning progress
- `useLessonCompletion()` - Mark lessons complete with retry

#### Pages
- `/my-courses` - View enrolled courses with progress
- `/profile` - Manage account settings
- `/progress` - View detailed progress dashboard

#### Navigation
- Updated navigation with learner links
- Profile link in user menu
- Progress tracking indicators

### 5. File Upload Flows

#### Thumbnail Upload Flow
```
1. User selects image → Client validation
2. Show instant preview
3. Request signed credentials: POST /api/courses/:id/thumbnail/upload
4. Upload to Cloudinary with FormData
5. Receive secure_url
6. PATCH /api/courses/:id with thumbnail URL
```

#### Video Upload Flow
```
1. User selects video → Validation (type, size)
2. Request signed credentials: POST /api/courses/:id/lessons/upload
3. Create XHR request with progress listener
4. Upload to Cloudinary with signed params
5. Receive secure_url and duration
6. POST /api/courses/:id/lessons with video data
7. Backend triggers transcript generation
```

### 6. Optimistic UI Patterns

#### Course Creation
```tsx
// Optimistic: Show loading state
setIsCreating(true);

try {
  const course = await creatorAPI.createCourse(data);
  // Success: Redirect to edit page
  router.push(`/creator/courses/${course.id}/edit`);
} catch (err) {
  // Rollback: Show error, stay on form
  showError(err.message);
}
```

#### Lesson Addition
```tsx
// Optimistic: Add placeholder lesson
const tempLesson = { id: `temp-${Date.now()}`, ...data, pending: true };
setLessons(prev => [...prev, tempLesson]);

try {
  const lesson = await courseAPI.createLesson(courseId, data);
  // Replace placeholder with real data
  setLessons(prev => prev.map(l => l.id === tempLesson.id ? lesson : l));
} catch (err) {
  // Rollback: Remove placeholder
  setLessons(prev => prev.filter(l => l.id !== tempLesson.id));
  showError(err.message);
}
```

#### Enrollment
```tsx
// Optimistic: Update UI immediately
setCourse(prev => ({ ...prev, isEnrolled: true }));

try {
  await courseAPI.enrollInCourse(courseId);
  showSuccess('Enrolled successfully');
} catch (err) {
  // Rollback: Revert enrollment status
  setCourse(prev => ({ ...prev, isEnrolled: false }));
  showError('Enrollment failed');
}
```

## API Endpoints Reference

### Creator Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/creator/apply` | POST | Submit creator application |
| `/api/creator/status` | GET | Check application status |
| `/api/creator/dashboard` | GET | Get creator dashboard data |

### Course Management
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/courses` | POST | Create new course (DRAFT) |
| `/api/courses` | GET | List courses (filtered by creator) |
| `/api/courses/:id` | GET | Get course details |
| `/api/courses/:id` | PATCH | Update course (DRAFT only) |
| `/api/courses/:id` | DELETE | Delete course (DRAFT only) |
| `/api/courses/:id/submit` | POST | Submit for review |
| `/api/courses/:id/thumbnail/upload` | POST | Get thumbnail upload credentials |
| `/api/courses/:id/lessons/upload` | POST | Get video upload credentials |

### Lesson Management
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/courses/:courseId/lessons` | POST | Create lesson |
| `/api/courses/:courseId/lessons` | GET | List lessons |
| `/api/lessons/:id` | GET | Get lesson details |
| `/api/lessons/:id` | PATCH | Update lesson |
| `/api/lessons/:id` | DELETE | Delete lesson |
| `/api/lessons/:id/transcript-status` | GET | Get transcript status |

## Security Considerations

### Signed Uploads
- ✅ API secret never exposed to client
- ✅ Backend generates signatures with timestamp
- ✅ Cloudinary validates signature on upload
- ✅ Public ID and folder restricted by creator/course

### Authorization
- ✅ All creator endpoints require `Authorization: Bearer <token>`
- ✅ Backend validates creator role via middleware
- ✅ Ownership checks prevent editing others' courses

### File Validation
- ✅ Client-side: Type and size checks
- ✅ Server-side: Additional validation in Cloudinary transformations
- ✅ Thumbnails: Max 5MB, image/* only
- ✅ Videos: Max 500MB, video/* only

## Error Handling

### Common Errors
- **400**: Validation errors (show field-level errors)
- **401**: Authentication required (redirect to login)
- **403**: Permission denied (show access denied modal)
- **404**: Resource not found (show 404 page)
- **409**: Conflict (e.g., duplicate lesson order)
- **500**: Server error (retry with backoff)

### Error Display Patterns
```tsx
// Field-level errors
{errors.title && <span className="text-red-600">{errors.title}</span>}

// Toast notifications
showError('Failed to upload video. Please try again.');

// Alert components
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>{error}</AlertDescription>
</Alert>
```

## Testing Recommendations

### Unit Tests
- API helper functions (signature validation, URL builders)
- Component rendering and state updates
- Form validation logic

### Integration Tests (MSW)
```tsx
// Mock course creation
rest.post('/api/courses', (req, res, ctx) => {
  return res(ctx.json({
    success: true,
    course: { id: 'uuid', ...req.body, status: 'DRAFT' }
  }));
});

// Mock upload credentials
rest.post('/api/courses/:id/lessons/upload', (req, res, ctx) => {
  return res(ctx.json({
    success: true,
    data: {
      uploadUrl: 'https://api.cloudinary.com/...',
      signature: 'mock-signature',
      timestamp: Date.now(),
      // ... other fields
    }
  }));
});
```

### E2E Tests (Playwright/Cypress)
- Full creator flow: apply → create course → upload thumbnail → add lessons → submit
- Error handling: network failures, invalid files
- Permission checks: LEARNER tries to access creator pages

## Performance Optimizations

### Image Optimization
- Cloudinary transformations: `c_fill,w_1200,h_675/q_auto`
- Eager transformations for common sizes
- WebP format with fallbacks

### Video Optimization
- Cloudinary HLS streaming for adaptive bitrate
- Thumbnail generation at upload time
- Duration extraction for progress tracking

### Caching
- SWR for course and lesson data
- Stale-while-revalidate pattern
- Optimistic updates reduce perceived latency

## Future Enhancements

### Planned Features
- [ ] Bulk lesson upload
- [ ] Video trimming/editing
- [ ] Subtitle file upload
- [ ] Course preview mode
- [ ] Analytics dashboard
- [ ] Revenue tracking (when monetization added)
- [ ] Course templates
- [ ] Collaborative editing

### Nice-to-Have
- [ ] Draft auto-save
- [ ] Version control for courses
- [ ] A/B testing for thumbnails
- [ ] Student feedback integration
- [ ] Email notifications for status changes

## Troubleshooting

### Upload Failures
**Problem:** Video upload fails at 99%
**Solution:** Check Cloudinary quota, increase timeout, implement retry logic

**Problem:** Thumbnail not displaying after upload
**Solution:** Verify secure_url format, check CORS settings, ensure HTTPS

### Permission Issues
**Problem:** Creator can't see own courses
**Solution:** Verify JWT token, check role in database, clear localStorage/cookies

**Problem:** LEARNER role accessing creator pages
**Solution:** Middleware should redirect to /creator/apply

## Documentation References
- [AUTHENTICATION_API.md](./AUTHENTICATION_API.md) - Auth endpoints
- [ENROLLMENT_SYSTEM.md](./ENROLLMENT_SYSTEM.md) - Learner flow
- [COURSE_MANAGEMENT.md](./COURSE_MANAGEMENT.md) - Backend course logic

## Changelog
- **Oct 5, 2025**: Added thumbnail uploader, enhanced creatorAPI, documented all features
- **Oct 4, 2025**: Added optimistic UI patterns, custom hooks
- **Oct 3, 2025**: Initial creator components and pages

---

Last Updated: October 5, 2025
