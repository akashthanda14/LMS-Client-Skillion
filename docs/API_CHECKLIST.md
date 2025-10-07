# API Integration Checklist

Complete verification of all backend API endpoints and their frontend integration status.

**Last Updated**: December 2024  
**Status**: ✅ All endpoints configured

---

## Legend

- ✅ **Configured**: Endpoint is implemented in `src/lib/api.ts`
- 🔧 **Partial**: Endpoint exists but may need enhancement
- ❌ **Missing**: Endpoint not yet implemented
- 📝 **Note**: Additional information or considerations

---

## 1. Course API (Creator-facing)

**Base Path**: `/api/courses`  
**API Object**: `courseAPI` and `creatorAPI`

| Method | Endpoint | Access | Status | Frontend Function | Notes |
|--------|----------|--------|--------|-------------------|-------|
| POST | `/api/courses` | CREATOR | ✅ | `creatorAPI.createCourse()` | Create new DRAFT course |
| GET | `/api/courses` | Authenticated | ✅ | `courseAPI.getCourses()` | List courses with filters |
| GET | `/api/courses/:id` | Authenticated | ✅ | `courseAPI.getCourseById()` | Get full course details + lessons |
| PATCH | `/api/courses/:id` | CREATOR | ✅ | `courseAPI.updateCourse()` | Update DRAFT course fields |
| DELETE | `/api/courses/:id` | CREATOR | ✅ | `courseAPI.deleteCourse()` | Delete DRAFT course only |
| POST | `/api/courses/:id/submit` | CREATOR | ✅ | `courseAPI.submitCourse()` | Submit for admin review |
| POST | `/api/courses/:courseId/thumbnail/upload` | CREATOR | ✅ | `creatorAPI.getThumbnailUploadCredentials()` | Get Cloudinary signed upload |
| PATCH | `/api/courses/:courseId/thumbnail` | CREATOR | ✅ | `creatorAPI.updateThumbnail()` | Persist thumbnail URL |
| GET | `/api/courses/:courseId/lessons` | Authenticated | ✅ | `courseAPI.getCourseLessons()` | List course lessons |
| GET | `/api/courses/:courseId/progress` | LEARNER | ✅ | `courseAPI.getCourseProgress()` | Get enrollment progress |
| POST | `/api/courses/:courseId/enroll` | LEARNER | ✅ | `courseAPI.enrollInCourse()` | Enroll in course |

### Course API Summary
- **Total Endpoints**: 11
- **Configured**: 11 ✅
- **Missing**: 0

---

## 2. Lesson API

**Base Path**: `/api/courses/:courseId/lessons` and `/api/lessons/:id`  
**API Object**: `courseAPI` and `lessonAPI`

| Method | Endpoint | Access | Status | Frontend Function | Notes |
|--------|----------|--------|--------|-------------------|-------|
| POST | `/api/courses/:courseId/lessons/upload` | CREATOR | ✅ | `courseAPI.getUploadCredentials()` | Get signed upload for video/media |
| POST | `/api/courses/:courseId/lessons` | CREATOR | ✅ | `courseAPI.createLesson()` | Create lesson with media URL |
| GET | `/api/courses/:courseId/lessons` | Authenticated | ✅ | `courseAPI.getCourseLessons()` | List lessons (see Course API) |
| GET | `/api/lessons/:id` | Authenticated | ✅ | `lessonAPI.getLessonById()` | Get lesson details |
| PATCH | `/api/lessons/:id` | CREATOR | ✅ | `lessonAPI.updateLesson()` | Update lesson metadata |
| DELETE | `/api/lessons/:id` | CREATOR | ✅ | `lessonAPI.deleteLesson()` | Delete lesson |
| POST | `/api/lessons/:id/complete` | LEARNER | ✅ | `lessonAPI.completeLesson()` | Mark lesson complete |
| GET | `/api/lessons/:id/transcript-status` | Authenticated | ✅ | `lessonAPI.getTranscriptStatus()` | Get transcription status |

### Lesson API Summary
- **Total Endpoints**: 8
- **Configured**: 8 ✅
- **Missing**: 0

---

## 3. Creator API

**Base Path**: `/api/creator`  
**API Object**: `creatorAPI`

| Method | Endpoint | Access | Status | Frontend Function | Notes |
|--------|----------|--------|--------|-------------------|-------|
| POST | `/api/creator/apply` | Authenticated | ✅ | `creatorAPI.submitApplication()` | Submit creator application |
| GET | `/api/creator/status` | Authenticated | ✅ | `creatorAPI.getStatus()` | Check application status |
| GET | `/api/creator/dashboard` | CREATOR | ✅ | `creatorAPI.getDashboard()` | Get creator analytics |

### Creator API Summary
- **Total Endpoints**: 3
- **Configured**: 3 ✅
- **Missing**: 0

---

## 4. Admin API

**Base Path**: `/api/admin`  
**API Object**: `adminAPI`

| Method | Endpoint | Access | Status | Frontend Function | Notes |
|--------|----------|--------|--------|-------------------|-------|
| GET | `/api/admin/metrics` | ADMIN | ✅ | `adminAPI.getMetrics()` | Dashboard metrics |
| GET | `/api/admin/applications?status=PENDING` | ADMIN | ✅ | `adminAPI.getApplications()` | List creator applications |
| POST | `/api/admin/applications/:id/approve` | ADMIN | ✅ | `adminAPI.approveApplication()` | Approve creator application |
| POST | `/api/admin/applications/:id/reject` | ADMIN | ✅ | `adminAPI.rejectApplication()` | Reject with comments |
| GET | `/api/admin/courses?status=PENDING` | ADMIN | ✅ | `adminAPI.getPendingCourses()` | List pending courses |
| POST | `/api/admin/courses/:id/publish` | ADMIN | ✅ | `adminAPI.publishCourse()` | Publish course |
| POST | `/api/admin/courses/:id/reject` | ADMIN | ✅ | `adminAPI.rejectCourse()` | Reject with feedback |

### Admin API Summary
- **Total Endpoints**: 7
- **Configured**: 7 ✅
- **Missing**: 0

---

## 5. Progress & Enrollment API

**Base Path**: `/api/progress` and `/api/enrollments`  
**API Object**: `progressAPI`

| Method | Endpoint | Access | Status | Frontend Function | Notes |
|--------|----------|--------|--------|-------------------|-------|
| GET | `/api/progress` | LEARNER | ✅ | `progressAPI.getProgress()` | Get all enrollments + progress |
| GET | `/api/enrollments/:id/certificate` | LEARNER | ✅ | `progressAPI.getCertificate()` | Get certificate metadata |
| GET | `/api/enrollments/:id/certificate/download` | LEARNER | ✅ | `progressAPI.downloadCertificate()` | Download certificate PDF |
| GET | `/api/certificates/verify/:serialHash` | Public | ✅ | `progressAPI.verifyCertificate()` | Verify certificate authenticity |

### Progress API Summary
- **Total Endpoints**: 4
- **Configured**: 4 ✅
- **Missing**: 0

---

## 6. Authentication API

**Base Path**: `/api/auth`  
**API Object**: `authAPI`

| Method | Endpoint | Access | Status | Frontend Function | Notes |
|--------|----------|--------|--------|-------------------|-------|
| POST | `/api/auth/register` | Public | ✅ | `authAPI.register()` | Register with email/phone |
| POST | `/api/auth/verify-email` | Public | ✅ | `authAPI.verifyEmail()` | Verify email OTP |
| POST | `/api/auth/verify-phone` | Public | ✅ | `authAPI.verifyPhone()` | Verify phone OTP |
| POST | `/api/auth/complete-profile` | Public | ✅ | `authAPI.completeProfile()` | Set name + password |
| POST | `/api/auth/login` | Public | ✅ | `authAPI.login()` | Login with credentials |
| POST | `/api/auth/logout` | Authenticated | ✅ | `authAPI.logout()` | Clear session |
| GET | `/api/auth/me` | Authenticated | ✅ | `authAPI.getCurrentUser()` | Get current user |
| PATCH | `/api/auth/profile` | Authenticated | ✅ | `authAPI.updateProfile()` | Update user profile |

### Auth API Summary
- **Total Endpoints**: 8
- **Configured**: 8 ✅
- **Missing**: 0

---

## Overall Summary

| Category | Total Endpoints | Configured | Missing | Completion |
|----------|----------------|------------|---------|------------|
| Course API | 11 | 11 | 0 | ✅ 100% |
| Lesson API | 8 | 8 | 0 | ✅ 100% |
| Creator API | 3 | 3 | 0 | ✅ 100% |
| Admin API | 7 | 7 | 0 | ✅ 100% |
| Progress API | 4 | 4 | 0 | ✅ 100% |
| Auth API | 8 | 8 | 0 | ✅ 100% |
| **TOTAL** | **41** | **41** | **0** | **✅ 100%** |

---

## API Configuration Details

### 1. Base Configuration

**File**: `src/lib/api.ts`

```typescript
export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. Request Interceptor (JWT)

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Response Interceptor (401 Handling)

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## API Usage Patterns

### Pattern 1: Simple GET Request

```typescript
const courses = await courseAPI.getCourses();
```

### Pattern 2: POST with Data

```typescript
const response = await courseAPI.enrollInCourse('course-id');
```

### Pattern 3: File Upload with Progress

```typescript
const credentials = await creatorAPI.getThumbnailUploadCredentials(courseId);
const url = await creatorAPI.uploadThumbnail(
  credentials, 
  file, 
  (progress) => console.log(progress)
);
await creatorAPI.updateThumbnail(courseId, url);
```

### Pattern 4: Error Handling

```typescript
try {
  await courseAPI.enrollInCourse(courseId);
} catch (error: any) {
  const message = error.response?.data?.message || 'Action failed';
  console.error(message);
}
```

---

## Backend Endpoint Contracts

### Course Creation Flow

1. **Create Course** (DRAFT)
   ```typescript
   POST /api/courses
   Body: { title, description, category, level, price?, metadata }
   Response: { success: true, data: { id, title, status: 'DRAFT' } }
   ```

2. **Upload Thumbnail** (Optional)
   ```typescript
   POST /api/courses/:id/thumbnail/upload
   Response: { success: true, data: { uploadUrl, signature, ... } }
   
   // Upload to Cloudinary, then:
   PATCH /api/courses/:id/thumbnail
   Body: { thumbnailUrl }
   ```

3. **Add Lessons**
   ```typescript
   POST /api/courses/:id/lessons/upload
   Response: { success: true, data: { uploadUrl, signature, ... } }
   
   // Upload to Cloudinary, then:
   POST /api/courses/:id/lessons
   Body: { title, description, mediaUrl, duration, order }
   ```

4. **Submit for Review**
   ```typescript
   POST /api/courses/:id/submit
   Response: { success: true, message: 'Course submitted' }
   ```

### Enrollment & Progress Flow

1. **Browse & Enroll**
   ```typescript
   GET /api/courses → List published courses
   POST /api/courses/:id/enroll → Enroll in course
   ```

2. **Track Progress**
   ```typescript
   GET /api/progress → Get all enrollments
   POST /api/lessons/:id/complete → Mark lesson complete
   GET /api/courses/:id/progress → Get course-specific progress
   ```

3. **Get Certificate**
   ```typescript
   GET /api/enrollments/:id/certificate → Metadata
   GET /api/enrollments/:id/certificate/download → PDF blob
   ```

---

## Common Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, validation failure, missing required fields |
| 401 | Unauthorized | No JWT token, expired token |
| 403 | Forbidden | Wrong role (e.g., LEARNER accessing creator endpoint), ownership violation |
| 404 | Not Found | Invalid UUID, resource doesn't exist |
| 500 | Server Error | Database error, Cloudinary error, unexpected backend issue |

---

## Validation Notes

### UUID Validation
All `:id`, `:courseId`, `:lessonId` path parameters **must be valid UUIDs**. Invalid UUIDs will result in 400 errors.

Backend uses middleware:
```javascript
validateUUID('id')  // Validates req.params.id
```

### Role Validation
Endpoints enforce role requirements:
- **Public**: No auth required
- **Authenticated**: Any logged-in user
- **CREATOR**: Must have CREATOR role
- **ADMIN**: Must have ADMIN role
- **LEARNER**: Implicit for enrollment/progress endpoints

### Ownership Validation
Creator endpoints check ownership:
- Can only update/delete own courses
- Can only modify DRAFT courses (not PENDING/PUBLISHED)

---

## File Upload Specifications

### Thumbnail Upload (Cloudinary)
- **Max Size**: 5MB
- **Formats**: JPEG, PNG, WebP
- **Dimensions**: Recommended 1200x675 (16:9)
- **Transformations**: Auto-applied (c_fill, w_1200, h_675, q_auto)

### Video Upload (Cloudinary)
- **Max Size**: 500MB
- **Formats**: MP4, WebM, MOV
- **Resource Type**: `video`
- **Progress Tracking**: Supported via XHR

---

## Testing Checklist

### Auth Flow
- [ ] Register with email
- [ ] Register with phone
- [ ] Verify OTP
- [ ] Complete profile
- [ ] Login
- [ ] Get current user
- [ ] Update profile
- [ ] Logout

### Learner Flow
- [ ] Browse courses
- [ ] View course details
- [ ] Enroll in course
- [ ] Complete lessons
- [ ] Track progress
- [ ] Download certificate

### Creator Flow
- [ ] Submit application
- [ ] Check status
- [ ] Create course
- [ ] Upload thumbnail
- [ ] Upload lessons
- [ ] Submit for review
- [ ] View dashboard

### Admin Flow
- [ ] View metrics
- [ ] Review applications (approve/reject)
- [ ] Review courses (publish/reject)

---

## Environment Variables Required

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Cloudinary (backend handles signing)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Custom Hooks Using These APIs

| Hook | APIs Used | Purpose |
|------|-----------|---------|
| `useCourse` | `courseAPI.getCourseById` | Fetch & cache course details |
| `useEnrollment` | `courseAPI.enrollInCourse` | Handle enrollment |
| `useProgress` | `progressAPI.getProgress` | Track learning progress |
| `useLessonCompletion` | `lessonAPI.completeLesson` | Mark lessons complete |
| `useAdminMetrics` | `adminAPI.getMetrics` | Admin dashboard metrics |
| `usePendingCourses` | `adminAPI.getPendingCourses`, `publishCourse`, `rejectCourse` | Course review |
| `usePendingApplications` | `adminAPI.getApplications`, `approveApplication`, `rejectApplication` | Application review |

---

## Next Steps

1. ✅ All backend endpoints are configured in frontend
2. ✅ Custom hooks created for common flows
3. ✅ Optimistic updates implemented for admin actions
4. 🔄 Integration testing with live backend
5. 🔄 Error handling improvements
6. 🔄 Loading states refinement

---

## Additional Resources

- [API Implementation File](./src/lib/api.ts)
- [Learner Implementation Guide](./LEARNER_IMPLEMENTATION_GUIDE.md)
- [Creator Implementation Guide](./CREATOR_IMPLEMENTATION_GUIDE.md)
- [Admin Implementation Guide](./ADMIN_IMPLEMENTATION_GUIDE.md)

---

**Status**: ✅ **All 41 endpoints configured and ready for integration**
