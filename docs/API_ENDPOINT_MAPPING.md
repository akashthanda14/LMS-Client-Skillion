# API Endpoint Mapping - Frontend to Backend

Complete mapping of frontend API functions to backend endpoints for the microcourses platform.

## Table of Contents
1. [Authentication](#authentication)
2. [Course Management](#course-management)
3. [Lesson Management](#lesson-management)
4. [Creator Workflows](#creator-workflows)
5. [Learner Workflows](#learner-workflows)
6. [Admin Workflows](#admin-workflows)

---

## Authentication

### Login
- **Frontend**: `authAPI.login(email, password)`
- **Endpoint**: `POST /api/auth/login`
- **Auth**: None (public)
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "LEARNER|CREATOR|ADMIN"
    }
  }
  ```

### Register
- **Frontend**: `authAPI.register(name, email, password)`
- **Endpoint**: `POST /api/auth/register`
- **Auth**: None (public)
- **Payload**:
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: Same as login

### Get Current User
- **Frontend**: `authAPI.getCurrentUser()`
- **Endpoint**: `GET /api/auth/me`
- **Auth**: Required (Bearer token)
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "LEARNER"
    }
  }
  ```

### Update Profile
- **Frontend**: `authAPI.updateProfile(data)`
- **Endpoint**: `PATCH /api/auth/profile`
- **Auth**: Required
- **Payload**:
  ```json
  {
    "name": "Jane Doe",
    "bio": "Updated bio"
  }
  ```

---

## Course Management

### List Courses
- **Frontend**: `courseAPI.getCourses(filters)`
- **Endpoint**: `GET /api/courses`
- **Auth**: Required
- **Query Params**: `?status=PUBLISHED&search=react&page=1&limit=10`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "Course Title",
        "description": "...",
        "status": "PUBLISHED",
        "thumbnailUrl": "...",
        "creator": { "name": "..." }
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10
    }
  }
  ```

### Get Course Details
- **Frontend**: `courseAPI.getCourseById(courseId)`
- **Endpoint**: `GET /api/courses/:id`
- **Auth**: Required
- **Path Param**: UUID validated
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "Course Title",
      "description": "...",
      "status": "PUBLISHED",
      "lessons": [...],
      "enrollmentStatus": "enrolled|not_enrolled",
      "progress": { "completed": 5, "total": 10 }
    }
  }
  ```

### Create Course (CREATOR)
- **Frontend**: `creatorAPI.createCourse(data)` or `courseAPI.createCourse(data)`
- **Endpoint**: `POST /api/courses`
- **Auth**: Required - CREATOR role
- **Payload**:
  ```json
  {
    "title": "Intro to Go",
    "description": "Short blurb",
    "category": "Programming",
    "level": "Beginner",
    "price": 0
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "Course created successfully as DRAFT",
    "course": {
      "id": "uuid",
      "title": "Intro to Go",
      "status": "DRAFT",
      "createdAt": "2024-..."
    }
  }
  ```

### Update Course (CREATOR)
- **Frontend**: `courseAPI.updateCourse(courseId, data)`
- **Endpoint**: `PATCH /api/courses/:id`
- **Auth**: Required - CREATOR (owner only)
- **Restrictions**: DRAFT courses only
- **Payload**: Partial course fields
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "course": { "id": "...", "title": "Updated Title", ... }
  }
  ```

### Submit Course for Review (CREATOR)
- **Frontend**: `courseAPI.submitCourse(courseId)`
- **Endpoint**: `POST /api/courses/:id/submit`
- **Auth**: Required - CREATOR (owner)
- **Validation**: Must have at least one lesson
- **Status Change**: DRAFT → PENDING
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Course submitted for review",
    "course": { "id": "...", "status": "PENDING" }
  }
  ```

### Delete Course (CREATOR)
- **Frontend**: `courseAPI.deleteCourse(courseId)`
- **Endpoint**: `DELETE /api/courses/:id`
- **Auth**: Required - CREATOR (owner)
- **Restrictions**: DRAFT courses only
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Course deleted successfully"
  }
  ```

---

## Lesson Management

### List Course Lessons
- **Frontend**: `courseAPI.getCourseLessons(courseId)`
- **Endpoint**: `GET /api/courses/:courseId/lessons`
- **Auth**: Required
- **Access**: CREATOR sees all, LEARNER limited by course status
- **Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "Lesson 1",
        "mediaUrl": "https://...",
        "duration": 300,
        "order": 1,
        "completed": false
      }
    ]
  }
  ```

### Get Lesson Details
- **Frontend**: `lessonAPI.getLessonById(lessonId)`
- **Endpoint**: `GET /api/lessons/:id`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "Lesson Title",
      "description": "...",
      "mediaUrl": "https://...",
      "duration": 300,
      "transcript": "...",
      "completed": false
    }
  }
  ```

### Create Lesson (CREATOR)
- **Frontend**: `courseAPI.createLesson(courseId, data)`
- **Endpoint**: `POST /api/courses/:courseId/lessons`
- **Auth**: Required - CREATOR
- **Payload**:
  ```json
  {
    "title": "Lesson 1 - Intro",
    "description": "Overview",
    "videoUrl": "https://res.cloudinary.com/.../video.mp4",
    "duration": 300,
    "order": 1,
    "transcript": "optional transcript text"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "title": "Lesson 1 - Intro",
      "videoUrl": "...",
      "createdAt": "..."
    }
  }
  ```

### Update Lesson (CREATOR)
- **Frontend**: `lessonAPI.updateLesson(lessonId, data)`
- **Endpoint**: `PATCH /api/lessons/:id`
- **Auth**: Required - CREATOR (owner)
- **Payload**: Partial fields
  ```json
  {
    "title": "Updated Title",
    "duration": 360
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": { "id": "...", "title": "Updated Title", ... }
  }
  ```

### Delete Lesson (CREATOR)
- **Frontend**: `lessonAPI.deleteLesson(lessonId)`
- **Endpoint**: `DELETE /api/lessons/:id`
- **Auth**: Required - CREATOR (owner)
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Lesson deleted successfully"
  }
  ```

### Get Transcript Status
- **Frontend**: `lessonAPI.getTranscriptStatus(lessonId)`
- **Endpoint**: `GET /api/lessons/:id/transcript-status`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "success": true,
    "status": "processing|completed|failed",
    "progress": 42,
    "transcriptUrl": "https://..."
  }
  ```

### Mark Lesson Complete (LEARNER)
- **Frontend**: `lessonAPI.completeLesson(lessonId)`
- **Endpoint**: `POST /api/lessons/:lessonId/complete`
- **Auth**: Required - LEARNER
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Lesson marked as complete",
    "progress": { "completedLessons": 5, "totalLessons": 10 }
  }
  ```

---

## Creator Workflows

### Thumbnail Upload Flow

#### Step 1: Get Upload Credentials
- **Frontend**: `creatorAPI.getThumbnailUploadCredentials(courseId)`
- **Endpoint**: `POST /api/courses/:courseId/thumbnail/upload`
- **Auth**: Required - CREATOR
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "uploadUrl": "https://api.cloudinary.com/v1_1/dumurymxf/image/upload",
      "signature": "...",
      "timestamp": 1234567890,
      "apiKey": "124497175293455",
      "publicId": "...",
      "cloudName": "dumurymxf",
      "folder": "course-thumbnails",
      "resourceType": "image"
    }
  }
  ```

#### Step 2: Upload to Cloudinary (Direct)
- **Frontend**: `creatorAPI.uploadThumbnail(credentials, file)`
- **Endpoint**: Cloudinary direct upload
- **Method**: `POST` to `credentials.uploadUrl`
- **Form Data**:
  - `file`: File object
  - `api_key`: from credentials
  - `timestamp`: from credentials
  - `signature`: from credentials
  - `public_id`: from credentials
  - `folder`: from credentials
  - `eager`: 'c_fill,w_1200,h_675/q_auto'
- **Response**: Cloudinary returns `{ secure_url: "https://..." }`

#### Step 3: Save Thumbnail URL
- **Frontend**: `creatorAPI.updateThumbnail(courseId, thumbnailUrl)`
- **Endpoint**: `PATCH /api/courses/:courseId/thumbnail`
- **Auth**: Required - CREATOR
- **Payload**:
  ```json
  {
    "thumbnailUrl": "https://res.cloudinary.com/.../image.jpg"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Thumbnail saved",
    "course": { "id": "...", "thumbnailUrl": "..." }
  }
  ```

### Lesson Video Upload Flow

#### Step 1: Get Upload Credentials
- **Frontend**: `courseAPI.getUploadCredentials(courseId)`
- **Endpoint**: `POST /api/courses/:courseId/lessons/upload`
- **Auth**: Required - CREATOR
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "uploadUrl": "https://api.cloudinary.com/v1_1/dumurymxf/video/upload",
      "signature": "...",
      "timestamp": 1234567890,
      "apiKey": "124497175293455",
      "publicId": "...",
      "folder": "lesson-videos",
      "resourceType": "video"
    }
  }
  ```

#### Step 2: Upload to Cloudinary (Direct)
- **Frontend**: Custom XHR upload in `LessonUploader.tsx`
- **Endpoint**: Cloudinary direct upload
- **Method**: `POST` to `credentials.uploadUrl`
- **Form Data**:
  - `file`: Video file
  - `api_key`: from credentials
  - `timestamp`: from credentials
  - `signature`: from credentials
  - `public_id`: from credentials
  - `folder`: from credentials
  - `resource_type`: 'video'
- **Response**: Cloudinary returns `{ secure_url: "...", duration: 123 }`

#### Step 3: Create Lesson with Video URL
- **Frontend**: `courseAPI.createLesson(courseId, data)`
- **Endpoint**: `POST /api/courses/:courseId/lessons`
- **Payload**:
  ```json
  {
    "title": "Lesson Title",
    "videoUrl": "https://res.cloudinary.com/.../video.mp4",
    "order": 1
  }
  ```

### Creator Application
- **Frontend**: `creatorAPI.submitApplication(data)`
- **Endpoint**: `POST /api/creator/apply`
- **Auth**: Required - LEARNER role
- **Payload**:
  ```json
  {
    "bio": "I'm an experienced instructor...",
    "experienceYears": 5,
    "portfolio": "https://myportfolio.com"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "Application submitted successfully",
    "application": { "id": "...", "status": "PENDING" }
  }
  ```

### Get Application Status
- **Frontend**: `creatorAPI.getStatus()`
- **Endpoint**: `GET /api/creator/status`
- **Auth**: Required
- **Response**:
  ```json
  {
    "success": true,
    "status": "PENDING|APPROVED|REJECTED",
    "application": { ... }
  }
  ```

### Get Creator Dashboard
- **Frontend**: `creatorAPI.getDashboard()`
- **Endpoint**: `GET /api/creator/dashboard`
- **Auth**: Required - CREATOR
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalCourses": 5,
      "publishedCourses": 3,
      "draftCourses": 1,
      "pendingCourses": 1,
      "totalStudents": 150,
      "totalRevenue": 5000
    }
  }
  ```

---

## Learner Workflows

### Enroll in Course
- **Frontend**: `enrollmentAPI.enrollCourse(courseId)`
- **Endpoint**: `POST /api/enrollments`
- **Auth**: Required - LEARNER
- **Payload**:
  ```json
  {
    "courseId": "uuid"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "message": "Enrolled successfully",
    "enrollment": {
      "id": "...",
      "courseId": "...",
      "enrolledAt": "..."
    }
  }
  ```

### Get My Enrollments
- **Frontend**: `enrollmentAPI.getMyEnrollments()`
- **Endpoint**: `GET /api/enrollments/my-courses`
- **Auth**: Required - LEARNER
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "enrollment-id",
        "course": {
          "id": "...",
          "title": "...",
          "thumbnailUrl": "..."
        },
        "progress": {
          "completedLessons": 3,
          "totalLessons": 10,
          "percentage": 30
        },
        "enrolledAt": "..."
      }
    ]
  }
  ```

### Get Course Progress
- **Frontend**: `courseAPI.getCourseProgress(courseId)`
- **Endpoint**: `GET /api/courses/:courseId/progress`
- **Auth**: Required - LEARNER
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "courseId": "...",
      "completedLessons": 5,
      "totalLessons": 10,
      "percentage": 50,
      "lastAccessedAt": "...",
      "completedAt": null
    }
  }
  ```

---

## Admin Workflows

### Get Admin Metrics
- **Frontend**: `adminAPI.getMetrics()`
- **Endpoint**: `GET /api/admin/metrics`
- **Auth**: Required - ADMIN
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 1000,
      "totalCreators": 50,
      "totalCourses": 200,
      "publishedCourses": 150,
      "totalEnrollments": 5000,
      "pendingApplications": 5,
      "pendingCourses": 10
    }
  }
  ```

### Get Pending Applications
- **Frontend**: `adminAPI.getApplications('PENDING')`
- **Endpoint**: `GET /api/admin/applications?status=PENDING`
- **Auth**: Required - ADMIN
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "userId": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "bio": "...",
        "portfolioUrl": "...",
        "experienceYears": 5,
        "createdAt": "..."
      }
    ]
  }
  ```

### Approve Application
- **Frontend**: `adminAPI.approveApplication(id, comments)`
- **Endpoint**: `POST /api/admin/applications/:id/approve`
- **Auth**: Required - ADMIN
- **Payload** (optional):
  ```json
  {
    "comments": "Welcome to the platform!"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Application approved"
  }
  ```

### Reject Application
- **Frontend**: `adminAPI.rejectApplication(id, comments)`
- **Endpoint**: `POST /api/admin/applications/:id/reject`
- **Auth**: Required - ADMIN
- **Payload**:
  ```json
  {
    "comments": "Reason for rejection"
  }
  ```

### Get Pending Courses
- **Frontend**: `adminAPI.getPendingCourses('PENDING')`
- **Endpoint**: `GET /api/admin/courses?status=PENDING`
- **Auth**: Required - ADMIN
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "title": "Course Title",
        "description": "...",
        "creatorName": "...",
        "lessonCount": 5,
        "thumbnailUrl": "...",
        "createdAt": "..."
      }
    ]
  }
  ```

### Publish Course
- **Frontend**: `adminAPI.publishCourse(id, comments)`
- **Endpoint**: `POST /api/admin/courses/:id/publish`
- **Auth**: Required - ADMIN
- **Status Change**: PENDING → PUBLISHED
- **Payload** (optional):
  ```json
  {
    "comments": "Approved for publication"
  }
  ```

### Reject Course
- **Frontend**: `adminAPI.rejectCourse(id, comments)`
- **Endpoint**: `POST /api/admin/courses/:id/reject`
- **Auth**: Required - ADMIN
- **Status Change**: PENDING → REJECTED
- **Payload**:
  ```json
  {
    "comments": "Feedback for creator"
  }
  ```

---

## Common Headers & Error Handling

### Request Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Standard Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Field X is required", "Invalid UUID format"]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

#### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Environment Variables

### Required Backend Variables
```env
CLOUDINARY_CLOUD_NAME=dumurymxf
CLOUDINARY_API_KEY=124497175293455
CLOUDINARY_API_SECRET=8o1poyk1rM_nCsJ7LUFPOjK_tvE

JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
```

### Frontend Configuration
- API Base URL configured in `src/lib/api.ts`
- Default: `http://localhost:5000` (development)

---

## UUID Validation

All path parameters with IDs are validated as UUIDs:
- Invalid UUID format → 400 Bad Request
- Use the `validateUUID` middleware on backend routes
- Frontend should always use IDs returned from API responses

---

## Complete Creator Flow Example

```typescript
// 1. Create course
const courseResponse = await creatorAPI.createCourse({
  title: "React Masterclass",
  description: "Learn React from scratch",
  category: "Web Development",
  level: "Beginner",
  price: 0
});
const courseId = courseResponse.course.id;

// 2. Upload thumbnail
const thumbCreds = await creatorAPI.getThumbnailUploadCredentials(courseId);
const thumbnailUrl = await creatorAPI.uploadThumbnail(thumbCreds.data, thumbnailFile);
await creatorAPI.updateThumbnail(courseId, thumbnailUrl);

// 3. Upload lesson video
const videoCreds = await courseAPI.getUploadCredentials(courseId);
const videoUrl = await uploadToCloudinary(videoFile, videoCreds.data);

// 4. Create lesson
await courseAPI.createLesson(courseId, {
  title: "Introduction",
  videoUrl: videoUrl,
  order: 1
});

// 5. Submit for review
await courseAPI.submitCourse(courseId);
```

---

**Last Updated**: December 2024  
**API Version**: 1.0.0
