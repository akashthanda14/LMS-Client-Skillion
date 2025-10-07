# Backend API Synchronization Plan

## Current Status Analysis

### ✅ Already Correctly Implemented:

1. **API Client Structure** (`src/lib/api.ts`)
   - ✅ Base URL configured: `http://localhost:4000`
   - ✅ JWT Bearer token authentication
   - ✅ Request/response interceptors
   - ✅ All admin endpoints defined

2. **Admin Endpoints Mapping**
   - ✅ `GET /api/admin/applications` → `adminAPI.getApplications(status?)`
   - ✅ `GET /api/admin/applications/pending` → `adminAPI.getApplicationsPending()`
   - ✅ `GET /api/admin/applications/:id` → `adminAPI.getApplication(id)`
   - ✅ `POST /api/admin/applications/:id/approve` → `adminAPI.approveApplication(id)`
   - ✅ `POST /api/admin/applications/:id/reject` → `adminAPI.rejectApplication(id, {reason})`
   - ✅ `GET /api/admin/courses` → `adminAPI.getCourses(status?)`
   - ✅ `GET /api/admin/courses/pending` → `adminAPI.getCoursesPending()`
   - ✅ `GET /api/admin/courses/:id` → `adminAPI.getCourseDetail(id)`
   - ✅ `POST /api/admin/courses/:id/publish` → `adminAPI.publishCourse(id)`
   - ✅ `POST /api/admin/courses/:id/reject` → `adminAPI.rejectCourse(id, {feedback})`
   - ✅ `GET /api/admin/metrics` → `adminAPI.getMetrics()`

3. **UI Components**
   - ✅ Admin Dashboard (`/admin/dashboard`)
   - ✅ Creator Applications Review (`/admin/review/creators`)
   - ✅ Course Review (`/admin/review/courses`)
   - ✅ ApprovalModal for approve/reject actions
   - ✅ Validation (10+ chars for rejection reason/feedback)

## 🔄 Updates Needed:

### 1. Add Missing Metrics Endpoints
Backend has additional metric endpoints that aren't in frontend yet:
- `GET /api/admin/metrics/summary` - Lightweight metrics
- `GET /api/admin/metrics/growth` - Growth analytics
- `GET /api/admin/metrics/top-courses` - Top courses by enrollment
- `GET /api/admin/metrics/activity` - Recent activity feed

### 2. Enhance Type Definitions
Match backend response structures exactly.

### 3. Add Analytics Page
Create comprehensive analytics dashboard with:
- Growth trends
- Top courses table
- Activity timeline
- User distribution charts

### 4. Add Course Preview
Allow admins to preview course videos before publishing.

## Implementation Steps:

1. ✅ Update API types to match backend exactly
2. ✅ Add missing metrics endpoints
3. ✅ Create analytics dashboard page
4. ✅ Add course detail preview page
5. ✅ Test all endpoints with backend
