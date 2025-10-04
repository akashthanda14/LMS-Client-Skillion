# Course Management System

Complete course CRUD operations with status workflow for the MicroCourses LMS platform.

## Overview

The course management system allows creators to create, edit, and submit courses for review. Admins can review and publish/reject courses. Learners can only view published courses.

## Status Workflow

```
DRAFT → PENDING → PUBLISHED
              ↘ REJECTED
```

### Status Descriptions

- **DRAFT**: Initial state when course is created. Can be edited and deleted by creator.
- **PENDING**: Course submitted for admin review. Cannot be edited or deleted.
- **PUBLISHED**: Course approved by admin and visible to all learners.
- **REJECTED**: Course rejected by admin with feedback. Creator can view rejection reason.
- **ARCHIVED**: Course is no longer active (future use).

## API Endpoints

### Creator Endpoints

#### Create Course
```http
POST /api/courses
Authorization: Bearer <token>
Role: CREATOR

Body:
{
  "title": "Course Title",
  "description": "Course description (20-1000 chars)",
  "thumbnail": "https://example.com/image.jpg",
  "category": "Web Development",
  "level": "BEGINNER",
  "duration": 120
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "DRAFT",
    "creatorId": "uuid",
    ...
  }
}
```

#### Get All Courses
```http
GET /api/courses
Authorization: Bearer <token>

Response (role-based):
- LEARNER: Only PUBLISHED courses
- CREATOR: Own courses (all statuses)
- ADMIN: All courses

{
  "success": true,
  "data": [...]
}
```

#### Get Course Details
```http
GET /api/courses/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "lessons": [...],
    "creator": {...},
    "_count": {
      "lessons": 5,
      "enrollments": 10
    }
  }
}
```

#### Update Course
```http
PATCH /api/courses/:id
Authorization: Bearer <token>
Role: CREATOR (own courses only)

Note: Only DRAFT courses can be updated

Body:
{
  "title": "Updated Title",
  "description": "Updated description"
}

Response:
{
  "success": true,
  "data": {...}
}
```

#### Submit Course for Review
```http
POST /api/courses/:id/submit
Authorization: Bearer <token>
Role: CREATOR (own courses only)

Requirements:
- Course must be in DRAFT status
- Course must have at least 1 lesson

Response:
{
  "success": true,
  "data": {
    "status": "PENDING",
    "submittedAt": "2025-10-04T12:00:00Z"
  }
}
```

#### Delete Course
```http
DELETE /api/courses/:id
Authorization: Bearer <token>
Role: CREATOR (own courses only)

Note: Only DRAFT courses can be deleted

Response:
{
  "success": true,
  "message": "Course deleted successfully"
}
```

### Admin Endpoints

#### Get Courses for Review
```http
GET /api/admin/courses?status=PENDING
Authorization: Bearer <token>
Role: ADMIN

Response:
{
  "success": true,
  "data": [...]
}
```

#### Get Pending Courses
```http
GET /api/admin/courses/pending
Authorization: Bearer <token>
Role: ADMIN

Response:
{
  "success": true,
  "data": [...]
}
```

#### Get Course for Review
```http
GET /api/admin/courses/:id
Authorization: Bearer <token>
Role: ADMIN

Response:
{
  "success": true,
  "data": {...}
}
```

#### Publish Course
```http
POST /api/admin/courses/:id/publish
Authorization: Bearer <token>
Role: ADMIN

Requirements:
- Course must be in PENDING status

Response:
{
  "success": true,
  "data": {
    "status": "PUBLISHED",
    "publishedAt": "2025-10-04T12:00:00Z"
  }
}
```

#### Reject Course
```http
POST /api/admin/courses/:id/reject
Authorization: Bearer <token>
Role: ADMIN

Requirements:
- Course must be in PENDING status

Body:
{
  "reason": "Detailed feedback for the creator"
}

Response:
{
  "success": true,
  "data": {
    "status": "REJECTED",
    "rejectionReason": "..."
  }
}
```

## Validation Rules

### Course Creation/Update
- **Title**: 5-100 characters
- **Description**: 20-1000 characters
- **Thumbnail**: Valid URL (optional)
- **Category**: String (optional)
- **Level**: BEGINNER | INTERMEDIATE | ADVANCED (default: BEGINNER)
- **Duration**: Integer in minutes (optional)

### Submission Requirements
- Must have at least 1 lesson
- Course must be in DRAFT status

### Permission Checks
- Only course creator can edit/delete their own courses
- Only DRAFT courses can be edited or deleted
- Only PENDING courses can be published or rejected
- Only ADMIN role can publish/reject courses

## Architecture

### Service Layer (`services/`)

**courseService.js** - Business logic for course operations
- `createCourse(creatorId, courseData)`
- `getCourseById(courseId)`
- `getCourses(filters)`
- `updateCourse(courseId, updateData)`
- `submitCourseForReview(courseId)`
- `deleteCourse(courseId)`
- `publishCourse(courseId, adminId)`
- `rejectCourse(courseId, adminId, feedback)`

**courseValidationService.js** - Validation logic
- `validateCourseData(data, isUpdate)`
- `isCreatorOwner(course, userId)`
- `canEditCourse(course)`
- `canDeleteCourse(course)`
- `canSubmitCourse(course)`
- `canReviewCourse(course)`
- `sanitizeCourseData(data)`

### Controller Layer (`controllers/`)

**courseController.js** - HTTP request handling for creators
- `createNewCourse`
- `getAllCourses`
- `getCourseDetails`
- `updateExistingCourse`
- `submitCourse`
- `deleteExistingCourse`

**adminCourseController.js** - HTTP request handling for admins
- `getCoursesForReview`
- `getPendingCourses`
- `getCourseForReview`
- `publishCourseByCourseId`
- `rejectCourseByCourseId`

### Routes (`routes/`)

**courseRoutes.js** - Creator course routes
- All routes protected with `ensureAuth` + `requireCreator`

**adminCourseRoutes.js** - Admin course routes
- All routes protected with `ensureAuth` + `requireAdmin`

## Database Schema

```prisma
model Course {
  id              String        @id @default(uuid())
  creatorId       String
  title           String
  description     String
  thumbnail       String?
  category        String?
  level           CourseLevel   @default(BEGINNER)
  duration        Int?
  status          CourseStatus  @default(DRAFT)
  submittedAt     DateTime?
  publishedAt     DateTime?
  reviewedBy      String?
  rejectionReason String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  creator         User
  reviewer        User?
  lessons         Lesson[]
  enrollments     Enrollment[]
  certificates    Certificate[]
}

enum CourseStatus {
  DRAFT
  PENDING
  PUBLISHED
  REJECTED
  ARCHIVED
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}
```

## Testing

### Basic CRUD Tests
```bash
node test-course-crud.js
```
Tests: 15/15 passing
- Course creation
- Validation
- Update operations
- Delete operations
- Role-based access control

### Complete Workflow Tests
```bash
node test-course-workflow.js
```
Tests: 12/12 passing
- Complete lifecycle from creation to publication
- Status transitions
- Permission checks
- Admin review process
- Rejection workflow

## Example Usage Flow

1. **Creator creates course**
   ```javascript
   POST /api/courses
   // Status: DRAFT
   ```

2. **Creator adds lessons** (using lesson endpoints)
   ```javascript
   POST /api/lessons
   ```

3. **Creator submits for review**
   ```javascript
   POST /api/courses/:id/submit
   // Status: DRAFT → PENDING
   ```

4. **Admin reviews course**
   ```javascript
   GET /api/admin/courses/pending
   GET /api/admin/courses/:id
   ```

5. **Admin publishes or rejects**
   ```javascript
   // Option A: Publish
   POST /api/admin/courses/:id/publish
   // Status: PENDING → PUBLISHED
   
   // Option B: Reject
   POST /api/admin/courses/:id/reject
   // Status: PENDING → REJECTED
   ```

6. **Learners can see published course**
   ```javascript
   GET /api/courses
   // Only PUBLISHED courses visible
   ```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error codes:
- `400`: Validation error or invalid state transition
- `401`: Unauthorized (no token)
- `403`: Forbidden (wrong role or not owner)
- `404`: Course not found
- `500`: Internal server error

## Future Enhancements

- Course versioning for rejected courses
- Bulk course operations for admins
- Course analytics and statistics
- Advanced filtering and search
- Course categories management
- Course tags and keywords
