# Admin Implementation Guide

Complete guide for implementing admin functionality with custom hooks, optimistic updates, and role-based access control.

## Table of Contents
1. [Overview](#overview)
2. [Admin Hooks](#admin-hooks)
3. [Dashboard Implementation](#dashboard-implementation)
4. [Review Pages](#review-pages)
5. [Security Best Practices](#security-best-practices)
6. [API Integration](#api-integration)

---

## Overview

The admin system provides platform administrators with tools to:
- Monitor platform metrics and analytics
- Review and approve/reject creator applications
- Review and publish/reject course submissions
- Manage platform content and users

### Key Features
- **Optimistic UI Updates**: Instant feedback with automatic rollback on errors
- **Role-Based Access**: Enforced at layout and API levels
- **Real-time Metrics**: Dashboard with platform statistics
- **Batch Operations**: Handle multiple reviews efficiently

---

## Admin Hooks

### useAdminMetrics

Fetches and caches admin dashboard metrics.

**Location**: `src/hooks/useAdminMetrics.ts`

```typescript
import { useAdminMetrics } from '@/hooks/useAdminMetrics';

function AdminDashboard() {
  const { metrics, isLoading, error, refetch } = useAdminMetrics();
  
  if (isLoading) return <Loader />;
  if (error) return <Error message={error} />;
  if (!metrics) return <NoData />;
  
  return (
    <div>
      <p>Total Users: {metrics.totalUsers}</p>
      <p>Total Creators: {metrics.totalCreators}</p>
      <p>Total Courses: {metrics.totalCourses}</p>
      <p>Published Courses: {metrics.publishedCourses}</p>
      <p>Total Enrollments: {metrics.totalEnrollments}</p>
      <p>Pending Applications: {metrics.pendingApplications}</p>
      <p>Pending Courses: {metrics.pendingCourses}</p>
    </div>
  );
}
```

**Features:**
- Automatic data fetching on mount
- Loading and error states
- Manual refetch capability
- Type-safe metric access

**Return Type:**
```typescript
{
  metrics: AdminMetrics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

---

### usePendingApplications

Manages creator applications with optimistic updates.

**Location**: `src/hooks/usePendingApplications.ts`

```typescript
import { usePendingApplications } from '@/hooks/usePendingApplications';

function ReviewApplications() {
  const {
    applications,
    isLoading,
    error,
    refetch,
    approveApplication,
    rejectApplication,
  } = usePendingApplications();
  
  const handleApprove = async (id: string) => {
    try {
      await approveApplication(id);
      toast.success('Application approved!');
    } catch (err) {
      toast.error('Failed to approve application');
    }
  };
  
  const handleReject = async (id: string, reason: string) => {
    try {
      await rejectApplication(id, reason);
      toast.success('Application rejected');
    } catch (err) {
      toast.error('Failed to reject application');
    }
  };
  
  return (
    <div>
      {applications.map(app => (
        <ApplicationCard
          key={app.id}
          application={app}
          onApprove={() => handleApprove(app.id)}
          onReject={(reason) => handleReject(app.id, reason)}
        />
      ))}
    </div>
  );
}
```

**Optimistic Updates:**
- ✅ **Approve**: Removes from list immediately
- ❌ **Reject**: Removes from list immediately
- 🔄 **Rollback**: Restores item on API error

**Return Type:**
```typescript
{
  applications: PendingApplication[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  approveApplication: (id: string) => Promise<void>;
  rejectApplication: (id: string, reason: string) => Promise<void>;
}
```

**Application Structure:**
```typescript
interface PendingApplication {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio: string;
  portfolioUrl: string;
  experienceYears: number;
  createdAt?: string;
}
```

---

### usePendingCourses

Manages pending course reviews with optimistic updates.

**Location**: `src/hooks/usePendingCourses.ts`

```typescript
import { usePendingCourses } from '@/hooks/usePendingCourses';

function ReviewCourses() {
  const {
    courses,
    isLoading,
    error,
    refetch,
    publishCourse,
    rejectCourse,
  } = usePendingCourses();
  
  const handlePublish = async (id: string) => {
    try {
      await publishCourse(id);
      toast.success('Course published successfully!');
    } catch (err) {
      toast.error('Failed to publish course');
    }
  };
  
  const handleReject = async (id: string, feedback: string) => {
    try {
      await rejectCourse(id, feedback);
      toast.success('Course rejected with feedback');
    } catch (err) {
      toast.error('Failed to reject course');
    }
  };
  
  return (
    <div>
      {courses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          onPublish={() => handlePublish(course.id)}
          onReject={(feedback) => handleReject(course.id, feedback)}
        />
      ))}
    </div>
  );
}
```

**Optimistic Updates:**
- ✅ **Publish**: Removes from pending list immediately
- ❌ **Reject**: Removes from pending list immediately
- 🔄 **Rollback**: Restores course on API error

**Return Type:**
```typescript
{
  courses: PendingCourse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  publishCourse: (id: string) => Promise<void>;
  rejectCourse: (id: string, feedback: string) => Promise<void>;
}
```

**Course Structure:**
```typescript
interface PendingCourse {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  lessonCount: number;
  thumbnailUrl?: string;
  createdAt?: string;
}
```

---

## Dashboard Implementation

The admin dashboard provides an overview of platform metrics and quick actions.

**Location**: `src/app/admin/dashboard/page.tsx`

### Key Components

1. **Metrics Display**: Uses `AdminMetrics` component
2. **Quick Actions**: Links to review pages with pending counts
3. **Loading States**: Smooth loading animations
4. **Error Handling**: User-friendly error messages

### Example Implementation

```typescript
'use client';

import { motion } from 'framer-motion';
import { useAdminMetrics } from '@/hooks/useAdminMetrics';
import { AdminMetrics } from '@/components/admin/AdminMetrics';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';

export default function AdminDashboardPage() {
  const { metrics, isLoading, error, refetch } = useAdminMetrics();
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error || !metrics) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  
  const quickActions = [
    {
      title: 'Review Creator Applications',
      count: metrics.pendingApplications,
      href: '/admin/review/creators',
      icon: UserCheck,
    },
    {
      title: 'Review Pending Courses',
      count: metrics.pendingCourses,
      href: '/admin/review/courses',
      icon: BookCheck,
    },
  ];
  
  return (
    <AuthenticatedLayout allowedRoles={['ADMIN']}>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Admin Dashboard</h1>
          <p>Manage platform content and review submissions</p>
        </motion.div>
        
        <AdminMetrics metrics={metrics} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map(action => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
```

---

## Review Pages

### Creator Application Review

**Location**: `src/app/admin/review/creators/page.tsx`

**Features:**
- List all pending creator applications
- View detailed application information
- Approve with optional comments
- Reject with required feedback
- Optimistic UI updates
- Confirmation modals

**Implementation Pattern:**

```typescript
export default function ReviewCreatorsPage() {
  const {
    applications,
    isLoading,
    error,
    approveApplication,
    rejectApplication,
  } = usePendingApplications();
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalType, setModalType] = useState('approve');
  const [showModal, setShowModal] = useState(false);
  
  const handleConfirm = async (comments: string) => {
    if (!selectedApp) return;
    
    try {
      if (modalType === 'approve') {
        await approveApplication(selectedApp.id);
      } else {
        await rejectApplication(selectedApp.id, comments);
      }
      setShowModal(false);
      setSelectedApp(null);
    } catch (err) {
      // Error handled by hook (rollback happens automatically)
      alert('Action failed. Please try again.');
      throw err; // Keep modal open
    }
  };
  
  return (
    <AuthenticatedLayout>
      {/* Application list */}
      {applications.map(app => (
        <CreatorApplicationCard
          key={app.id}
          application={app}
          onApprove={() => {
            setSelectedApp(app);
            setModalType('approve');
            setShowModal(true);
          }}
          onReject={() => {
            setSelectedApp(app);
            setModalType('reject');
            setShowModal(true);
          }}
        />
      ))}
      
      {/* Confirmation Modal */}
      <ApprovalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        type={modalType}
        title={selectedApp?.name}
      />
    </AuthenticatedLayout>
  );
}
```

### Course Review

**Location**: `src/app/admin/review/courses/page.tsx`

**Features:**
- List all pending course submissions
- View course details (title, description, lessons)
- Publish to make course public
- Reject with detailed feedback
- Optimistic UI updates
- Preview thumbnails

**Similar implementation pattern to creator review**

---

## Security Best Practices

### 1. Role-Based Access Control

**Always enforce admin role at multiple levels:**

```typescript
// Page level
<AuthenticatedLayout allowedRoles={['ADMIN']}>
  {/* Content */}
</AuthenticatedLayout>

// API level (backend)
router.use('/api/admin/*', requireAdmin);

// Hook level (optional)
if (user?.role !== 'ADMIN') {
  throw new Error('Unauthorized');
}
```

### 2. Validation

**Validate all user inputs:**

```typescript
const handleReject = async (id: string, reason: string) => {
  if (!reason || reason.trim().length < 10) {
    toast.error('Please provide detailed feedback (min 10 characters)');
    return;
  }
  
  try {
    await rejectApplication(id, reason);
  } catch (err) {
    // Handle error
  }
};
```

### 3. Error Handling

**Always handle errors gracefully:**

```typescript
try {
  await publishCourse(courseId);
  toast.success('Course published successfully!');
} catch (err: any) {
  const message = err.response?.data?.message || 'Action failed';
  toast.error(message);
  // Rollback happens automatically in hook
}
```

### 4. Audit Logging

**Log all admin actions (backend):**

```javascript
// Log admin actions for audit trail
await prisma.auditLog.create({
  data: {
    adminId: req.user.id,
    action: 'PUBLISH_COURSE',
    targetId: courseId,
    metadata: { comments },
  },
});
```

---

## API Integration

### Admin API Endpoints

All admin endpoints require authentication and ADMIN role.

#### Get Metrics
```typescript
GET /api/admin/metrics

Response:
{
  success: true,
  data: {
    totalUsers: number,
    totalCreators: number,
    totalCourses: number,
    publishedCourses: number,
    totalEnrollments: number,
    pendingApplications: number,
    pendingCourses: number
  }
}
```

#### Get Pending Applications
```typescript
GET /api/admin/applications?status=PENDING

Response:
{
  success: true,
  data: PendingApplication[]
}
```

#### Approve Application
```typescript
POST /api/admin/applications/:id/approve

Body (optional):
{
  comments: string
}

Response:
{
  success: true,
  message: "Application approved"
}
```

#### Reject Application
```typescript
POST /api/admin/applications/:id/reject

Body:
{
  comments: string  // Required
}

Response:
{
  success: true,
  message: "Application rejected"
}
```

#### Get Pending Courses
```typescript
GET /api/admin/courses?status=PENDING

Response:
{
  success: true,
  data: PendingCourse[]
}
```

#### Publish Course
```typescript
POST /api/admin/courses/:id/publish

Body (optional):
{
  comments: string
}

Response:
{
  success: true,
  message: "Course published successfully"
}
```

#### Reject Course
```typescript
POST /api/admin/courses/:id/reject

Body:
{
  comments: string  // Required - feedback for creator
}

Response:
{
  success: true,
  message: "Course rejected"
}
```

---

## Error Handling Patterns

### Hook-Level Error Handling

Custom hooks handle errors internally and provide rollback:

```typescript
try {
  await publishCourse(id);
  // Optimistic update already applied
} catch (err) {
  // Rollback happened automatically
  // Show user-friendly message
}
```

### Page-Level Error Display

```typescript
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

### User Feedback

Always provide clear feedback for admin actions:

```typescript
const [successMessage, setSuccessMessage] = useState('');

const handlePublish = async (id: string) => {
  try {
    await publishCourse(id);
    setSuccessMessage('✓ Course published successfully');
    setTimeout(() => setSuccessMessage(''), 5000);
  } catch (err) {
    alert('Failed to publish course');
  }
};
```

---

## Best Practices Summary

1. **Always use custom hooks** for data fetching and mutations
2. **Implement optimistic updates** for better UX
3. **Provide clear feedback** for all actions
4. **Handle errors gracefully** with rollback
5. **Enforce role-based access** at multiple levels
6. **Validate all inputs** before API calls
7. **Log admin actions** for audit trail
8. **Use confirmation modals** for destructive actions
9. **Show loading states** during async operations
10. **Test error scenarios** thoroughly

---

## Component Hierarchy

```
AdminDashboardPage
├── AuthenticatedLayout (role check)
├── AdminMetrics (metrics display)
└── QuickActionCards (navigation)

ReviewCreatorsPage
├── AuthenticatedLayout (role check)
├── CreatorApplicationCard (list items)
└── ApprovalModal (confirmation)

ReviewCoursesPage
├── AuthenticatedLayout (role check)
├── CourseReviewCard (list items)
└── ApprovalModal (confirmation)
```

---

## Testing Checklist

- [ ] Metrics load correctly
- [ ] Pending lists display properly
- [ ] Approve actions work with optimistic updates
- [ ] Reject actions require feedback
- [ ] Errors trigger rollback
- [ ] Loading states display correctly
- [ ] Empty states show appropriate messages
- [ ] Navigation works between pages
- [ ] Role-based access enforced
- [ ] Modals open/close properly
- [ ] Success messages appear and clear
- [ ] API errors display user-friendly messages

---

## Additional Resources

- [Learner Implementation Guide](./LEARNER_IMPLEMENTATION_GUIDE.md)
- [Creator Implementation Guide](./CREATOR_IMPLEMENTATION_GUIDE.md)
- [API Documentation](./API_DOCS.md)
- [Authentication Guide](./AUTH_GUIDE.md)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
