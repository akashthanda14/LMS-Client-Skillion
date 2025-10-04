# Lesson CRUD & Cloudinary Upload - Manual Testing Guide

## Setup

1. **Server Running**: Ensure server is running on `http://localhost:4000`
2. **Test Users**: Use existing test accounts (sarah@example.com - CREATOR)

## Test Flow

### Step 1: Login as Creator

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@example.com",
    "password": "password123"
  }'
```

**Expected**: 200 OK with token
**Save the token** for next requests

### Step 2: Create a DRAFT Course

```bash
curl -X POST http://localhost:4000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Complete React Course",
    "description": "Learn React from beginner to advanced level with practical projects and real-world examples."
  }'
```

**Expected**: 201 Created with course object
**Save the courseId** for next requests

### Step 3: Get Upload Credentials

```bash
curl -X POST http://localhost:4000/api/courses/YOUR_COURSE_ID/lessons/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected**: 200 OK with Cloudinary credentials:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://api.cloudinary.com/v1_1/dumurymxf/video/upload",
    "signature": "abc123...",
    "timestamp": 1696345678,
    "apiKey": "124497175293455",
    "publicId": "course_xxx_lesson_xxx",
    "cloudName": "dumurymxf",
    "folder": "courses/xxx/lessons",
    "resourceType": "video"
  }
}
```

### Step 4: Upload Video to Cloudinary (Frontend)

**Note**: This would normally be done by the frontend directly to Cloudinary.

```javascript
// Frontend code example
const formData = new FormData();
formData.append('file', videoFile);
formData.append('signature', credentials.signature);
formData.append('timestamp', credentials.timestamp);
formData.append('api_key', credentials.apiKey);
formData.append('public_id', credentials.publicId);
formData.append('folder', credentials.folder);

const response = await fetch(credentials.uploadUrl, {
  method: 'POST',
  body: formData
});

const result = await response.json();
// result.secure_url is the Cloudinary URL to use in next step
```

For testing, we'll use a mock Cloudinary URL:
`https://res.cloudinary.com/dumurymxf/video/upload/v1696345678/courses/test/lessons/lesson_1.mp4`

### Step 5: Create Lesson with Cloudinary URL

```bash
curl -X POST http://localhost:4000/api/courses/YOUR_COURSE_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Introduction to React Hooks",
    "videoUrl": "https://res.cloudinary.com/dumurymxf/video/upload/v1696345678/courses/test/lessons/lesson_1.mp4",
    "order": 1,
    "duration": 600
  }'
```

**Expected**: 201 Created with lesson object
**Note**: Transcript generation job is queued in BullMQ (check Redis)

### Step 6: Create Second Lesson

```bash
curl -X POST http://localhost:4000/api/courses/YOUR_COURSE_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "useState and useEffect Explained",
    "videoUrl": "https://res.cloudinary.com/dumurymxf/video/upload/v1696345679/courses/test/lessons/lesson_2.mp4",
    "order": 2,
    "duration": 720
  }'
```

**Expected**: 201 Created

### Step 7: Test Duplicate Order (Should Fail)

```bash
curl -X POST http://localhost:4000/api/courses/YOUR_COURSE_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Another Lesson",
    "videoUrl": "https://res.cloudinary.com/dumurymxf/video/upload/v1696345680/courses/test/lessons/lesson_3.mp4",
    "order": 1,
    "duration": 500
  }'
```

**Expected**: 400 Bad Request - "Lesson with order 1 already exists for this course"

### Step 8: Get All Lessons

```bash
curl -X GET http://localhost:4000/api/courses/YOUR_COURSE_ID/lessons \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected**: 200 OK with array of 2 lessons, ordered by `order` ASC

### Step 9: Update Lesson

```bash
curl -X PATCH http://localhost:4000/api/lessons/YOUR_LESSON_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Introduction to React Hooks (Updated)"
  }'
```

**Expected**: 200 OK with updated lesson

### Step 10: Submit Course for Review

```bash
curl -X POST http://localhost:4000/api/courses/YOUR_COURSE_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected**: 200 OK - Course status changed to PENDING

### Step 11: Try to Add Lesson to PENDING Course (Should Fail)

```bash
curl -X POST http://localhost:4000/api/courses/YOUR_COURSE_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Advanced Hooks",
    "videoUrl": "https://res.cloudinary.com/dumurymxf/video/upload/v1696345681/courses/test/lessons/lesson_4.mp4",
    "order": 3,
    "duration": 650
  }'
```

**Expected**: 400 Bad Request - "Cannot add lessons to non-draft courses"

### Step 12: Try to Update Lesson in PENDING Course (Should Fail)

```bash
curl -X PATCH http://localhost:4000/api/lessons/YOUR_LESSON_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "New Title"
  }'
```

**Expected**: 403 Forbidden - "Cannot modify lessons in non-draft courses"

### Step 13: Try to Delete Lesson from PENDING Course (Should Fail)

```bash
curl -X DELETE http://localhost:4000/api/lessons/YOUR_LESSON_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected**: 403 Forbidden - "Cannot modify lessons in non-draft courses"

## Validation Tests

### Invalid Cloudinary URL

```bash
curl -X POST http://localhost:4000/api/courses/YOUR_COURSE_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Lesson",
    "videoUrl": "https://youtube.com/watch?v=abc123",
    "order": 5,
    "duration": 300
  }'
```

**Expected**: 400 Bad Request - "Video URL must be from Cloudinary"

### Missing Required Fields

```bash
curl -X POST http://localhost:4000/api/courses/YOUR_COURSE_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Lesson"
  }'
```

**Expected**: 400 Bad Request - Validation errors for missing fields

### Invalid Order (Negative)

```bash
curl -X POST http://localhost:4000/api/courses/YOUR_COURSE_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Lesson",
    "videoUrl": "https://res.cloudinary.com/dumurymxf/video/upload/v1234567/test.mp4",
    "order": -1,
    "duration": 300
  }'
```

**Expected**: 400 Bad Request - "Order must be at least 1"

## Checkpoints Verification

- ✅ Video upload returns pre-signed credentials
- ✅ Frontend can upload directly to Cloudinary (simulated)
- ✅ Lesson created with correct order
- ✅ Unique order constraint prevents duplicates
- ✅ Lessons appear in ordered list
- ✅ Only DRAFT courses can be modified
- ✅ Transcript job queued in BullMQ/Redis

## BullMQ Job Queue Verification

Check Redis for queued transcription jobs:

```bash
# Connect to Redis
redis-cli -h redis-18258.c301.ap-south-1-1.ec2.redns.redis-cloud.com -p 18258 -a YAnA48RnsTmaa598ZLX4gluOmyI2oXuA

# List all keys
KEYS *

# Check queue
LRANGE bull:transcript-generation:waiting 0 -1

# Check job details
GET bull:transcript-generation:1
```

## Architecture Overview

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ 1. Get Upload Credentials
       ▼
┌─────────────────────────────┐
│  POST /courses/:id/lessons/ │
│         upload              │
└──────────┬──────────────────┘
           │ Returns: signature, timestamp, apiKey, publicId
           │
       ┌───▼──────────────────┐
       │  Frontend Uploads     │
       │  Directly to          │
       │  Cloudinary           │
       └───┬──────────────────┘
           │ Returns: secure_url
           │
       ┌───▼──────────────────┐
       │  POST /courses/:id/   │
       │  lessons              │
       │  { videoUrl }         │
       └───┬──────────────────┘
           │
       ┌───▼──────────────────┐
       │  Create Lesson in DB  │
       │  Queue Transcription  │
       └───┬──────────────────┘
           │
       ┌───▼──────────────────┐
       │  BullMQ Worker        │
       │  (Future: Sub-Prompt 6│
       │  Will process)        │
       └──────────────────────┘
```

## Notes

- Videos never pass through the backend server (efficient!)
- Cloudinary handles encoding, thumbnails, CDN delivery
- Signed uploads prevent unauthorized uploads
- BullMQ handles async transcription jobs
- All lesson operations respect course status workflow
- Only course creators can modify their lessons
- Role-based access control enforced at all levels
