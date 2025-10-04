# Lesson Management System Documentation

## Overview

Complete lesson CRUD system with direct-to-Cloudinary video uploads, BullMQ job queue integration, and comprehensive validation.

## Architecture

### Two-Step Upload Flow

1. **Get Upload Credentials** - Backend generates signed Cloudinary upload parameters
2. **Frontend Direct Upload** - Client uploads video directly to Cloudinary (never hits backend)
3. **Create Lesson** - Backend stores lesson with Cloudinary URL and queues transcription job

### Benefits

- ✅ **Scalable**: Videos don't pass through backend (saves bandwidth)
- ✅ **Fast**: Direct CDN upload with automatic encoding
- ✅ **Secure**: Signed uploads with expiration
- ✅ **Async**: Transcription processed in background via BullMQ

## API Endpoints

### 1. Get Upload Credentials

**Endpoint**: `POST /api/courses/:courseId/lessons/upload`

**Authorization**: Creator only (course owner)

**Requirements**:
- Course must exist
- User must be course creator
- Course must be in DRAFT status

**Response**:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://api.cloudinary.com/v1_1/dumurymxf/video/upload",
    "signature": "abc123def456...",
    "timestamp": 1696345678,
    "apiKey": "124497175293455",
    "publicId": "course_xxx_lesson_1696345678",
    "cloudName": "dumurymxf",
    "folder": "courses/xxx/lessons",
    "resourceType": "video",
    "eager": "sp_hd/mp4",
    "eagerAsync": true
  }
}
```

**Usage** (Frontend):
```javascript
const getUploadCredentials = async (courseId) => {
  const response = await fetch(`/api/courses/${courseId}/lessons/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### 2. Upload Video to Cloudinary

**Endpoint**: Cloudinary's upload URL (from step 1)

**Method**: Direct from frontend using FormData

**Frontend Implementation**:
```javascript
const uploadVideoToCloudinary = async (videoFile, credentials) => {
  const formData = new FormData();
  formData.append('file', videoFile);
  formData.append('signature', credentials.signature);
  formData.append('timestamp', credentials.timestamp);
  formData.append('api_key', credentials.apiKey);
  formData.append('public_id', credentials.publicId);
  formData.append('folder', credentials.folder);
  formData.append('resource_type', 'video');
  formData.append('eager', credentials.eager);
  formData.append('eager_async', credentials.eagerAsync);

  const response = await fetch(credentials.uploadUrl, {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result.secure_url; // Use this URL in next step
};
```

**Cloudinary Response**:
```json
{
  "public_id": "course_xxx_lesson_1696345678",
  "version": 1696345678,
  "signature": "...",
  "width": 1920,
  "height": 1080,
  "format": "mp4",
  "resource_type": "video",
  "created_at": "2025-10-04T12:00:00Z",
  "bytes": 15728640,
  "type": "upload",
  "url": "http://res.cloudinary.com/dumurymxf/video/upload/v1696345678/...",
  "secure_url": "https://res.cloudinary.com/dumurymxf/video/upload/v1696345678/...",
  "duration": 120.5
}
```

### 3. Create Lesson

**Endpoint**: `POST /api/courses/:courseId/lessons`

**Authorization**: Creator only (course owner)

**Requirements**:
- Course must exist
- User must be course creator
- Course must be in DRAFT status
- Order must be unique within course
- Video URL must be from Cloudinary

**Request Body**:
```json
{
  "title": "Introduction to React Hooks",
  "videoUrl": "https://res.cloudinary.com/dumurymxf/video/upload/v1696345678/courses/xxx/lessons/lesson_1.mp4",
  "order": 1,
  "duration": 600
}
```

**Response**:
```json
{
  "success": true,
  "message": "Lesson created successfully",
  "data": {
    "id": "uuid",
    "courseId": "uuid",
    "title": "Introduction to React Hooks",
    "videoUrl": "https://res.cloudinary.com/.../lesson_1.mp4",
    "transcript": null,
    "order": 1,
    "duration": 600,
    "createdAt": "2025-10-04T12:00:00Z",
    "updatedAt": "2025-10-04T12:00:00Z"
  }
}
```

**Background Process**:
- Transcript generation job queued in BullMQ
- Job will be processed by worker (implemented in future sub-prompt)
- Transcript will be updated in database once completed

### 4. Get Course Lessons

**Endpoint**: `GET /api/courses/:courseId/lessons`

**Authorization**: Required

**Access Control**:
- **PUBLISHED courses**: Anyone authenticated
- **DRAFT/PENDING courses**: Creator or Admin only

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "courseId": "uuid",
      "title": "Introduction to React Hooks",
      "videoUrl": "https://res.cloudinary.com/.../lesson_1.mp4",
      "transcript": "Welcome to this lesson on React Hooks...",
      "order": 1,
      "duration": 600,
      "createdAt": "2025-10-04T12:00:00Z",
      "updatedAt": "2025-10-04T12:05:00Z"
    },
    {
      "id": "uuid",
      "courseId": "uuid",
      "title": "useState and useEffect",
      "videoUrl": "https://res.cloudinary.com/.../lesson_2.mp4",
      "transcript": null,
      "order": 2,
      "duration": 720,
      "createdAt": "2025-10-04T12:10:00Z",
      "updatedAt": "2025-10-04T12:10:00Z"
    }
  ]
}
```

### 5. Update Lesson

**Endpoint**: `PATCH /api/lessons/:id`

**Authorization**: Creator only (course owner)

**Requirements**:
- User must be course creator
- Course must be in DRAFT status
- If updating order, new order must be unique

**Request Body** (partial update):
```json
{
  "title": "Introduction to React Hooks (Updated)",
  "order": 1
}
```

**Allowed Fields**:
- `title` (string, 3-200 characters)
- `order` (integer, >= 1, unique per course)

**Response**:
```json
{
  "success": true,
  "message": "Lesson updated successfully",
  "data": {
    "id": "uuid",
    "courseId": "uuid",
    "title": "Introduction to React Hooks (Updated)",
    "videoUrl": "https://res.cloudinary.com/.../lesson_1.mp4",
    "transcript": "...",
    "order": 1,
    "duration": 600,
    "createdAt": "2025-10-04T12:00:00Z",
    "updatedAt": "2025-10-04T12:20:00Z"
  }
}
```

### 6. Delete Lesson

**Endpoint**: `DELETE /api/lessons/:id`

**Authorization**: Creator only (course owner)

**Requirements**:
- User must be course creator
- Course must be in DRAFT status

**Query Parameters**:
- `deleteFromCloudinary` (boolean, optional) - Also delete video from Cloudinary

**Example**:
```
DELETE /api/lessons/:id?deleteFromCloudinary=true
```

**Response**:
```json
{
  "success": true,
  "message": "Lesson deleted successfully"
}
```

## Validation Rules

### Lesson Creation

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | Yes | 3-200 characters |
| videoUrl | string | Yes | Must contain "cloudinary.com" |
| order | integer | Yes | >= 1, unique per course |
| duration | integer | No | >= 0 (seconds) |

### Lesson Update

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | No | 3-200 characters |
| order | integer | No | >= 1, unique per course |

### Business Rules

1. **Order Uniqueness**: Each lesson must have a unique order within its course
2. **Course Status**: Lessons can only be added/modified when course is DRAFT
3. **Creator Ownership**: Only course creator can add/modify lessons
4. **Cloudinary URLs**: Only video URLs from Cloudinary domain are accepted
5. **Access Control**: Lesson visibility follows course status (DRAFT → creator only, PUBLISHED → all)

## Service Layer

### `lessonService.js`

**Functions**:
- `createLesson(courseId, lessonData)` - Create lesson and queue transcription
- `getLessonsByCourse(courseId)` - Get all lessons ordered by order
- `getLessonById(lessonId)` - Get single lesson with course details
- `updateLesson(lessonId, updateData)` - Update lesson with validation
- `deleteLesson(lessonId)` - Delete lesson from database
- `getLessonCount(courseId)` - Count lessons in course
- `isOrderUnique(courseId, order, excludeLessonId)` - Check order uniqueness

### `lessonValidationService.js`

**Functions**:
- `validateLessonData(data, isUpdate)` - Validate lesson data
- `isCreatorOfCourse(course, userId)` - Check course ownership
- `canModifyLessons(course)` - Check if course allows modifications
- `canAccessLessons(course, user)` - Check lesson access permissions
- `sanitizeLessonData(data)` - Sanitize and trim input data
- `validateUpdatePermissions(lesson, userId)` - Check update permissions
- `validateDeletePermissions(lesson, userId)` - Check delete permissions

## Cloudinary Configuration

### Environment Variables

```env
CLOUDINARY_CLOUD_NAME=dumurymxf
CLOUDINARY_API_KEY=124497175293455
CLOUDINARY_API_SECRET=8o1poyk1rM_nCsJ7LUFPOjK_tvE
```

### Functions (`config/cloudinary.js`)

- `generateUploadSignature(publicId, folder)` - Generate signed upload params
- `deleteVideo(publicId)` - Delete video from Cloudinary
- `extractPublicId(url)` - Extract public ID from Cloudinary URL
- `isCloudinaryUrl(url)` - Validate if URL is from Cloudinary

### Upload Parameters

```javascript
{
  public_id: 'course_{courseId}_lesson_{timestamp}',
  folder: 'courses/{courseId}/lessons',
  resource_type: 'video',
  eager: 'sp_hd/mp4',  // Auto-generate HD MP4
  eager_async: true     // Process asynchronously
}
```

## BullMQ Job Queue

### Configuration

```env
REDIS_HOST=redis-18258.c301.ap-south-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=18258
REDIS_USERNAME=default
REDIS_PASSWORD=YAnA48RnsTmaa598ZLX4gluOmyI2oXuA
```

### Queue: `transcript-generation`

**Job Data**:
```json
{
  "lessonId": "uuid",
  "videoUrl": "https://res.cloudinary.com/.../lesson_1.mp4",
  "timestamp": "2025-10-04T12:00:00Z"
}
```

**Job Options**:
- Attempts: 3
- Backoff: Exponential (5s delay)
- Remove on complete: After 24 hours
- Remove on fail: After 7 days

**Worker** (to be implemented in future sub-prompt):
```javascript
import { Worker } from 'bullmq';

const worker = new Worker('transcript-generation', async (job) => {
  const { lessonId, videoUrl } = job.data;
  
  // 1. Download video from Cloudinary
  // 2. Extract audio
  // 3. Generate transcript using Whisper API
  // 4. Update lesson.transcript in database
  
  return { lessonId, status: 'completed' };
});
```

## Database Schema

```prisma
model Lesson {
  id          String   @id @default(uuid()) @db.Uuid
  courseId    String   @db.Uuid
  title       String   @db.VarChar(255)
  videoUrl    String   @db.VarChar(500)
  transcript  String?  @db.Text
  order       Int
  duration    Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  progress    LessonProgress[]

  @@unique([courseId, order], name: "unique_lesson_order")
  @@index([courseId])
  @@index([order])
  @@map("lessons")
}
```

## Error Handling

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Validation failed | Invalid input data |
| 400 | Lesson with order X already exists | Duplicate order |
| 400 | Cannot add lessons to non-draft courses | Course not DRAFT |
| 400 | Video URL must be from Cloudinary | Invalid URL |
| 403 | Only the course creator can... | Not course owner |
| 403 | Cannot modify lessons in non-draft courses | Course status not DRAFT |
| 404 | Course not found | Invalid courseId |
| 404 | Lesson not found | Invalid lessonId |
| 500 | Internal server error | Server/database error |

## Complete Workflow Example

### Frontend Component (React)

```javascript
import { useState } from 'react';

const LessonUploadForm = ({ courseId, token }) => {
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);

  const handleUpload = async () => {
    setUploading(true);

    try {
      // Step 1: Get upload credentials
      const credsResponse = await fetch(
        `/api/courses/${courseId}/lessons/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const { data: credentials } = await credsResponse.json();

      // Step 2: Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('signature', credentials.signature);
      formData.append('timestamp', credentials.timestamp);
      formData.append('api_key', credentials.apiKey);
      formData.append('public_id', credentials.publicId);
      formData.append('folder', credentials.folder);
      formData.append('resource_type', 'video');

      const uploadResponse = await fetch(credentials.uploadUrl, {
        method: 'POST',
        body: formData
      });
      const uploadResult = await uploadResponse.json();

      // Step 3: Create lesson
      const lessonResponse = await fetch(
        `/api/courses/${courseId}/lessons`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: document.getElementById('lessonTitle').value,
            videoUrl: uploadResult.secure_url,
            order: parseInt(document.getElementById('lessonOrder').value),
            duration: Math.round(uploadResult.duration)
          })
        }
      );

      const { data: lesson } = await lessonResponse.json();
      
      alert('Lesson created successfully!');
      console.log('Lesson:', lesson);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} />
      <input id="lessonTitle" placeholder="Lesson Title" />
      <input id="lessonOrder" type="number" placeholder="Order" min="1" />
      <button onClick={handleUpload} disabled={uploading || !videoFile}>
        {uploading ? 'Uploading...' : 'Upload Lesson'}
      </button>
    </div>
  );
};
```

## Testing

See `docs/LESSON_CRUD_MANUAL_TESTING.md` for comprehensive manual testing guide.

### Automated Tests

Run: `node test-lesson-crud.js`

**Test Coverage**:
- ✅ Upload credentials generation
- ✅ Permission checks (creator only)
- ✅ Lesson creation with Cloudinary URL
- ✅ Duplicate order prevention
- ✅ Lesson listing and ordering
- ✅ Access control (DRAFT vs PUBLISHED)
- ✅ Lesson updates
- ✅ Status-based modification restrictions
- ✅ URL validation
- ✅ BullMQ job queuing

## Future Enhancements

1. **Transcript Generation** (Sub-Prompt 6)
   - Whisper API integration
   - Audio extraction from video
   - Automatic transcript updates

2. **Lesson Analytics**
   - Watch time tracking
   - Completion rates
   - Drop-off points

3. **Batch Operations**
   - Bulk lesson upload
   - Reorder multiple lessons
   - Mass delete/archive

4. **Advanced Features**
   - Lesson prerequisites
   - Quizzes and assessments
   - Downloadable resources
   - Subtitle support

## Troubleshooting

### Issue: Upload credentials return 403

**Solution**: Ensure:
1. User is logged in (valid token)
2. User has CREATOR role
3. User is the course creator
4. Course is in DRAFT status

### Issue: Lesson creation returns "Video URL must be from Cloudinary"

**Solution**: Ensure video URL contains "cloudinary.com" and follows format:
```
https://res.cloudinary.com/{cloud_name}/video/upload/...
```

### Issue: Duplicate order error

**Solution**: Check existing lesson orders for the course. Each lesson must have a unique order value. Use GET `/courses/:courseId/lessons` to see current orders.

### Issue: Cannot modify lessons in PENDING course

**Solution**: This is expected behavior. Only DRAFT courses allow lesson modifications. Submit course back to DRAFT status (reject and re-edit) or wait for publication.

### Issue: Transcription job not processing

**Solution**:
1. Check Redis connection
2. Verify BullMQ worker is running
3. Check worker logs for errors
4. Ensure Redis eviction policy is "noeviction"

## Support

For issues or questions:
1. Check server logs: `tail -f server.log`
2. Check Redis queue: `redis-cli LRANGE bull:transcript-generation:waiting 0 -1`
3. Review documentation: `docs/LESSON_CRUD_MANUAL_TESTING.md`
4. Test with manual curl commands first
