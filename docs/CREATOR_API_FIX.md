# Creator API Integration Fix

## Issue
Frontend creator components and API interfaces didn't match the backend API documentation, causing type mismatches and incorrect data handling.

## Backend API Reference
According to `/docs/CREATOR_APPLICATION_DOCUMENTATION.md` and `/docs/COURSE_MANAGEMENT.md`

### Creator Application API

**Submit Application** (`POST /api/creator/apply`)
```typescript
Request: {
  bio: string; // 100-500 characters (not 50-500)
  portfolio?: string; // Optional URL (not portfolioUrl)
  experience: string; // Min 50 chars (not experienceYears as number)
}

Response: {
  success: boolean;
  message: string;
  application: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  }
}
```

**Get Status** (`GET /api/creator/status`)
```typescript
Response: {
  success: boolean;
  data: {
    hasApplication: boolean;
    canApply: boolean;
    application?: {
      id: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      createdAt: string;
      reviewedAt?: string;
      reviewedBy?: string;
      rejectionReason?: string; // Not reviewerNotes
    }
  }
}
```

**Get Dashboard** (`GET /api/creator/dashboard`)
```typescript
Response: {
  success: boolean;
  dashboard: { // Not data
    creator: {
      id: string;
      name: string | null;
      username?: string;
      email: string;
    };
    application: {
      approvedAt: string;
      status: 'APPROVED';
    };
    stats: {
      totalCourses: number;
      publishedCourses: number;
      draftCourses: number;
      totalEnrollments: number; // Not totalStudents
      totalLessons: number;
      totalCertificates: number;
    };
    courses: Array<{
      id: string;
      title: string;
      description?: string;
      status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
      lessonCount: number; // Not lessonCount
      enrollmentCount: number; // Not studentCount
      thumbnailUrl?: string;
      createdAt: string;
      updatedAt: string;
    }>
  }
}
```

### Course Creation API

**Create Course** (`POST /api/courses`)
```typescript
Request: {
  title: string; // 5-100 characters
  description: string; // 20-1000 characters
  thumbnail?: string; // Not thumbnailUrl
  category?: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number; // Minutes
}

Response: {
  success: boolean;
  data: {
    id: string;
    status: 'DRAFT';
    creatorId: string;
    title: string;
    description: string;
    createdAt: string;
  }
}
```

## Changes Made

### 1. Updated API Types (`/src/lib/api.ts`)

#### CreatorApplicationRequest
**Before:**
```typescript
interface CreatorApplicationRequest {
  bio: string;
  portfolioUrl: string; // ❌ Wrong field name
  experienceYears: number; // ❌ Wrong type
}
```

**After:**
```typescript
interface CreatorApplicationRequest {
  bio: string; // 100-500 characters
  portfolio?: string; // ✅ Optional, correct field name
  experience: string; // ✅ String, minimum 50 characters
}
```

#### CreatorApplicationResponse
**Before:**
```typescript
interface CreatorApplicationResponse {
  success: boolean;
  data: { // ❌ Wrong structure
    applicationId: string;
    status: string;
  };
}
```

**After:**
```typescript
interface CreatorApplicationResponse {
  success: boolean;
  message: string; // ✅ Added message field
  application: { // ✅ Correct field name
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  };
}
```

#### CreatorStatusResponse
**Before:**
```typescript
interface CreatorStatusResponse {
  success: boolean;
  data: {
    status: string;
    reviewerNotes?: string; // ❌ Wrong field name
  };
}
```

**After:**
```typescript
interface CreatorStatusResponse {
  success: boolean;
  data: {
    hasApplication: boolean; // ✅ Added
    canApply: boolean; // ✅ Added
    application?: { // ✅ Nested properly
      id: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      createdAt: string;
      reviewedAt?: string;
      reviewedBy?: string;
      rejectionReason?: string; // ✅ Correct field name
    };
  };
}
```

#### CreatorStats
**Before:**
```typescript
interface CreatorStats {
  totalCourses: number;
  totalLessons: number;
  totalStudents: number; // ❌ Wrong field name
}
```

**After:**
```typescript
interface CreatorStats {
  totalCourses: number;
  publishedCourses: number; // ✅ Added
  draftCourses: number; // ✅ Added
  totalEnrollments: number; // ✅ Correct field name
  totalLessons: number;
  totalCertificates: number; // ✅ Added
}
```

#### CreatorCourse
**Before:**
```typescript
interface CreatorCourse {
  id: string;
  title: string;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  lessonCount: number;
  studentCount: number; // ❌ Wrong field name
  thumbnailUrl?: string;
  createdAt: string;
}
```

**After:**
```typescript
interface CreatorCourse {
  id: string;
  title: string;
  description?: string; // ✅ Added
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED'; // ✅ Added REJECTED
  lessonCount: number;
  enrollmentCount: number; // ✅ Correct field name
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string; // ✅ Added
}
```

#### CreatorDashboardResponse
**Before:**
```typescript
interface CreatorDashboardResponse {
  success: boolean;
  data: { // ❌ Wrong structure
    stats: CreatorStats;
    courses: CreatorCourse[];
  };
}
```

**After:**
```typescript
interface CreatorDashboardResponse {
  success: boolean;
  dashboard: { // ✅ Correct top-level field name
    creator: { // ✅ Added creator info
      id: string;
      name: string | null;
      username?: string;
      email: string;
    };
    application: { // ✅ Added application info
      approvedAt: string;
      status: 'APPROVED';
    };
    stats: CreatorStats;
    courses: CreatorCourse[];
  };
}
```

#### CreateCourseRequest
**Before:**
```typescript
interface CreateCourseRequest {
  title: string;
  description: string;
  thumbnailUrl?: string; // ❌ Wrong field name
}
```

**After:**
```typescript
interface CreateCourseRequest {
  title: string; // 5-100 characters
  description: string; // 20-1000 characters
  thumbnail?: string; // ✅ Correct field name
  category?: string; // ✅ Added
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'; // ✅ Added
  duration?: number; // ✅ Added (minutes)
}
```

#### CreateCourseResponse
**Before:**
```typescript
interface CreateCourseResponse {
  success: boolean;
  data: {
    id: string;
    status: 'DRAFT';
  };
}
```

**After:**
```typescript
interface CreateCourseResponse {
  success: boolean;
  data: {
    id: string;
    status: 'DRAFT';
    creatorId: string; // ✅ Added
    title: string; // ✅ Added
    description: string; // ✅ Added
    createdAt: string; // ✅ Added
  };
}
```

### 2. Updated CreatorApplicationForm Component

**File:** `/src/components/creator/CreatorApplicationForm.tsx`

#### Validation Schema
**Before:**
```typescript
const applicationSchema = z.object({
  bio: z.string().min(50, '...').max(500, '...'), // ❌ Min should be 100
  portfolioUrl: z.string().url('...'), // ❌ Wrong field name, should be optional
  experienceYears: z.number().min(0).max(50), // ❌ Wrong field and type
});
```

**After:**
```typescript
const applicationSchema = z.object({
  bio: z.string()
    .min(100, 'Bio must be at least 100 characters') // ✅ Correct minimum
    .max(500, 'Bio must be less than 500 characters'),
  portfolio: z.string()
    .url('Please enter a valid URL')
    .optional() // ✅ Optional
    .or(z.literal('')), // ✅ Allow empty string
  experience: z.string()
    .min(50, 'Experience description must be at least 50 characters'), // ✅ Correct type
});
```

#### Form Fields
- ✅ Changed `portfolioUrl` to `portfolio` (optional)
- ✅ Changed `experienceYears` (number input) to `experience` (textarea)
- ✅ Updated validation messages to match requirements
- ✅ Updated descriptions and placeholders

#### API Submission
**Before:**
```typescript
const response = await creatorAPI.submitApplication(data);
```

**After:**
```typescript
// Clean up portfolio field - send undefined if empty
const payload = {
  bio: data.bio,
  portfolio: data.portfolio?.trim() || undefined,
  experience: data.experience,
};

const response = await creatorAPI.submitApplication(payload);
```

### 3. Updated ApplicationStatus Component

**File:** `/src/components/creator/ApplicationStatus.tsx`

#### Data Access
**Before:**
```typescript
const [statusData, setStatusData] = useState<CreatorStatusResponse['data'] | null>(null);
// ...
const getStatusIcon = () => {
  switch (statusData.status) { // ❌ statusData.status doesn't exist
    // ...
  }
};
```

**After:**
```typescript
const [statusData, setStatusData] = useState<CreatorStatusResponse['data'] | null>(null);

// ✅ Check if user can apply (no application exists)
if (statusData.canApply && !statusData.hasApplication) {
  return <NoApplicationFound />;
}

const application = statusData.application;
if (!application) {
  return null;
}

const getStatusIcon = () => {
  switch (application.status) { // ✅ Use application.status
    // ...
  }
};
```

#### Display Updates
- ✅ Added check for `canApply` and `hasApplication` flags
- ✅ Changed `statusData.status` to `application.status` throughout
- ✅ Changed `statusData.reviewerNotes` to `application.rejectionReason`
- ✅ Added application details display (ID, submitted date, reviewed date)
- ✅ Updated styling for rejection reason (red border)

### 4. Updated CreatorDashboardPage

**File:** `/src/app/creator/dashboard/page.tsx`

#### Data Structure
**Before:**
```typescript
const [dashboardData, setDashboardData] = useState<CreatorDashboardResponse['data'] | null>(null);
// ...
const response = await creatorAPI.getDashboard();
setDashboardData(response.data); // ❌ Should be response.dashboard
```

**After:**
```typescript
const [dashboardData, setDashboardData] = useState<CreatorDashboardResponse['dashboard'] | null>(null);
// ...
const response = await creatorAPI.getDashboard();
setDashboardData(response.dashboard); // ✅ Correct field name
```

## Impact

### ✅ Fixed Issues
1. All TypeScript type errors resolved
2. API requests now match backend expectations
3. API responses properly parsed and typed
4. Form validation matches backend requirements
5. Status display shows correct information

### ✅ Improved UX
- **Application Form**: More descriptive field names and validation messages
- **Status Page**: Shows detailed application info (ID, dates, rejection reason)
- **Dashboard**: Access to creator info and comprehensive stats

### 🔄 Backward Compatibility
These changes are **breaking** but necessary to align with the backend API. Any existing applications will need to be migrated or resubmitted.

## Testing Checklist

- [ ] Submit creator application with valid data (100+ char bio, 50+ char experience)
- [ ] Submit with invalid data (short bio, short experience)
- [ ] Submit with optional portfolio URL
- [ ] Submit without portfolio URL
- [ ] Check application status after submission (PENDING)
- [ ] View creator dashboard after approval (CREATOR role)
- [ ] Verify stats display correctly (courses, enrollments, lessons, certificates)
- [ ] Create new course with all fields (title, description, category, level, duration)
- [ ] Verify course appears in dashboard

## Related Documentation

- `/docs/CREATOR_APPLICATION_DOCUMENTATION.md` - Backend API specs
- `/docs/CREATOR_APPLICATION_SUMMARY.md` - Implementation summary
- `/docs/COURSE_MANAGEMENT.md` - Course API specs
- `/docs/LESSON_MANAGEMENT.md` - Lesson API specs

## API Endpoints Summary

### Creator Routes
```
POST   /api/creator/apply      - Submit application (LEARNER only)
GET    /api/creator/status     - Check application status
GET    /api/creator/dashboard  - Get dashboard data (CREATOR only)
```

### Course Routes
```
POST   /api/courses            - Create course (CREATOR only)
GET    /api/courses            - Get courses (role-based filtering)
GET    /api/courses/:id        - Get course details
PATCH  /api/courses/:id        - Update course (CREATOR only, DRAFT status)
DELETE /api/courses/:id        - Delete course (CREATOR only, DRAFT status)
POST   /api/courses/:id/submit - Submit for review (CREATOR only)
```

### Admin Routes
```
GET    /api/admin/applications           - All applications with filters
GET    /api/admin/applications/pending   - Pending applications
GET    /api/admin/applications/:id       - Application details
POST   /api/admin/applications/:id/approve  - Approve application
POST   /api/admin/applications/:id/reject   - Reject application
```

## Files Modified

1. `/src/lib/api.ts` - Updated all creator-related interfaces
2. `/src/components/creator/CreatorApplicationForm.tsx` - Fixed form schema and fields
3. `/src/components/creator/ApplicationStatus.tsx` - Fixed status display
4. `/src/app/creator/dashboard/page.tsx` - Fixed dashboard data access

## Date
October 5, 2025
