# 🎯 Admin Panel - Complete Integration Guide

## Quick Start

Your frontend admin panel is now **100% synchronized** with your Node.js backend!

### Prerequisites
1. ✅ Node.js backend running on `http://localhost:4000`
2. ✅ Database with at least one admin user (`role: 'ADMIN'`)
3. ✅ Frontend running on `http://localhost:3000`

---

## 🚀 Test the Integration

### Option 1: Automated Test Script
```bash
# Run the test script
./test-admin-backend.sh

# It will:
# 1. Check if backend is running
# 2. Login as admin
# 3. Test all 15 admin endpoints
# 4. Show detailed results
```

### Option 2: Manual Testing
```bash
# 1. Start backend (in backend directory)
cd backend && npm start

# 2. Start frontend (in project root)
npm run dev

# 3. Open browser
http://localhost:3000/login

# 4. Login with admin credentials
Email: admin@example.com
Password: YourAdminPassword

# 5. You should see admin dashboard
http://localhost:3000/admin/dashboard
```

---

## 📊 Available Admin Pages

### 1. Dashboard (`/admin/dashboard`)
**Features:**
- Total users, creators, courses, enrollments
- Pending applications count
- Pending courses count
- 3 Quick action cards

**Backend Calls:**
- `GET /api/admin/metrics` - Full dashboard metrics

### 2. Creator Applications (`/admin/review/creators`)
**Features:**
- List all pending applications
- View applicant details (bio, portfolio, experience)
- Approve applications (upgrades user to CREATOR)
- Reject applications (requires 10+ char reason)

**Backend Calls:**
- `GET /api/admin/applications/pending` - List pending
- `POST /api/admin/applications/:id/approve` - Approve
- `POST /api/admin/applications/:id/reject` - Reject

### 3. Course Review (`/admin/review/courses`)
**Features:**
- List all pending courses
- View course details (title, description, lessons)
- Publish courses (makes visible to learners)
- Reject courses (requires 10+ char feedback)

**Backend Calls:**
- `GET /api/admin/courses/pending` - List pending
- `POST /api/admin/courses/:id/publish` - Publish
- `POST /api/admin/courses/:id/reject` - Reject

### 4. Analytics (`/admin/analytics`) ✨ NEW
**Features:**
- 30-day growth trends (users, courses, enrollments, certificates)
- Top 10 courses by enrollment
- Recent activity feed (20 latest events)
- Visual indicators (trend arrows, progress bars)

**Backend Calls:**
- `GET /api/admin/metrics/growth` - Growth comparison
- `GET /api/admin/metrics/top-courses?limit=10` - Top courses
- `GET /api/admin/metrics/activity?limit=20` - Activity feed

---

## 🔗 Complete API Mapping

### Authentication
```typescript
// Frontend automatically includes JWT token in all requests
headers: { Authorization: `Bearer ${token}` }
```

### Creator Applications (5 endpoints)
```typescript
adminAPI.getApplications(status?)         // GET /api/admin/applications
adminAPI.getApplicationsPending()         // GET /api/admin/applications/pending
adminAPI.getApplication(id)               // GET /api/admin/applications/:id
adminAPI.approveApplication(id)           // POST /api/admin/applications/:id/approve
adminAPI.rejectApplication(id, {reason})  // POST /api/admin/applications/:id/reject
```

### Course Review (5 endpoints)
```typescript
adminAPI.getCourses(status?)              // GET /api/admin/courses
adminAPI.getCoursesPending()              // GET /api/admin/courses/pending
adminAPI.getCourseDetail(id)              // GET /api/admin/courses/:id
adminAPI.publishCourse(id)                // POST /api/admin/courses/:id/publish
adminAPI.rejectCourse(id, {feedback})     // POST /api/admin/courses/:id/reject
```

### Metrics & Analytics (5 endpoints)
```typescript
adminAPI.getMetrics()                     // GET /api/admin/metrics
adminAPI.getMetricsSummary()              // GET /api/admin/metrics/summary
adminAPI.getGrowthMetrics()               // GET /api/admin/metrics/growth
adminAPI.getTopCourses(limit)             // GET /api/admin/metrics/top-courses
adminAPI.getRecentActivity(limit)         // GET /api/admin/metrics/activity
```

---

## 📝 Type Definitions

### Admin Metrics (matches backend exactly)
```typescript
interface AdminMetrics {
  users: {
    total: number;
    byRole: { USER: number; CREATOR: number; ADMIN: number };
    recentSignups: number;
  };
  courses: {
    total: number;
    byStatus: { DRAFT: number; PENDING: number; PUBLISHED: number; REJECTED: number };
    recentlyCreated: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    completionRate: string;
    recentEnrollments: number;
  };
  certificates: {
    total: number;
    issuanceRate: string;
  };
  applications: {
    total: number;
    byStatus: { PENDING: number; APPROVED: number; REJECTED: number };
  };
  timestamp: string;
}
```

### Creator Application
```typescript
interface CreatorApplication {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  bio: string;
  portfolio?: string;
  experience: string;
}
```

### Course for Review
```typescript
interface CourseForReview {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  createdAt: string;
  submittedAt?: string;
  rejectionFeedback?: string;
  lessonCount: number;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  lessons: Array<{
    id: string;
    title: string;
    order: number;
    videoUrl: string;
  }>;
}
```

---

## ✅ Validation Rules

### Application Rejection
```typescript
// Minimum 10 characters
reason.trim().length >= 10

// Error message
"Rejection reason must be at least 10 characters"
```

### Course Rejection
```typescript
// Minimum 10 characters
feedback.trim().length >= 10

// Error message
"Rejection feedback must be at least 10 characters"
```

---

## 🎨 UI Components

### Reusable Components
```
src/components/admin/
├── AdminMetrics.tsx        # Dashboard metric cards
├── ApprovalModal.tsx       # Approve/reject modal with validation
├── ApplicationReviewCard.tsx  # Application card
└── CourseReviewCard.tsx    # Course card
```

### Custom Hooks
```
src/hooks/
├── useAdminMetrics.ts      # Fetch dashboard metrics
├── usePendingApplications.ts  # Manage applications
└── usePendingCourses.ts    # Manage courses
```

---

## 🔧 Configuration

### Environment Variables
```env
# .env file
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### API Client Config
```typescript
// src/lib/config.ts
const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
  // ...
};
```

---

## 🐛 Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Solution:**
```bash
# Check if backend is running
curl http://localhost:4000

# Check CORS configuration in backend
# Should allow: http://localhost:3000
```

### Issue: "401 Unauthorized"

**Solution:**
```bash
# Check if token is stored
# Open DevTools → Application → Local Storage
# Should see: token, auth-user

# Check if user role is ADMIN
# In database:
SELECT role FROM "User" WHERE email = 'admin@example.com';
# Should return: ADMIN
```

### Issue: "Metrics endpoint returns error"

**Solution:**
```bash
# Test endpoint directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/admin/metrics

# Check backend logs for errors
# Ensure database connections are working
```

### Issue: "Applications/Courses not showing"

**Solution:**
```bash
# Check if there are pending items in database
SELECT COUNT(*) FROM "CreatorApplication" WHERE status = 'PENDING';
SELECT COUNT(*) FROM "Course" WHERE status = 'PENDING';

# If 0, page will show "All Caught Up!" message (this is correct)
```

---

## 📈 Performance

### Optimistic Updates
Both applications and courses use optimistic updates:
```typescript
// Immediately removes item from UI
setCourses(prev => prev.filter(c => c.id !== id));

// On error, rolls back
setCourses(originalCourses);
```

### Caching
Consider adding React Query for better caching:
```bash
npm install @tanstack/react-query

# Benefits:
# - Automatic caching
# - Background refetch
# - Stale-while-revalidate
```

---

## 🎯 Success Checklist

- [ ] Backend running on port 4000
- [ ] Admin user exists in database
- [ ] Frontend running on port 3000
- [ ] Can login as admin at `/login`
- [ ] Dashboard shows at `/admin/dashboard`
- [ ] Metrics display correctly
- [ ] Can navigate to applications review
- [ ] Can navigate to course review
- [ ] Can navigate to analytics
- [ ] Approve/reject actions work
- [ ] Validation shows errors
- [ ] Success messages appear
- [ ] Optimistic updates work

---

## 🚀 What's Working

### ✅ Complete Features
1. **Authentication**
   - Single login for all users
   - Role-based access control
   - JWT token management

2. **Dashboard**
   - Full metrics display
   - Pending item counts
   - Quick action cards
   - Analytics link

3. **Application Review**
   - List pending applications
   - View applicant details
   - Approve (instant upgrade to CREATOR)
   - Reject (with required reason)

4. **Course Review**
   - List pending courses
   - View course details
   - Publish (makes visible)
   - Reject (with required feedback)

5. **Analytics** ✨
   - Growth trends (30-day comparison)
   - Top courses ranking
   - Activity timeline
   - Visual indicators

6. **UX Features**
   - Optimistic updates
   - Error handling
   - Loading states
   - Toast notifications
   - Inline validation
   - Responsive design

---

## 📚 Documentation

- `BACKEND_SYNC_COMPLETE.md` - This file
- `UNIFIED_LOGIN.md` - Login system guide
- `ADMIN_LOGIN_TEST.md` - Testing guide
- `test-admin-backend.sh` - Automated test script

---

## 🎉 Summary

Your admin panel now has:
- ✅ **15 backend endpoints** fully integrated
- ✅ **4 main pages** (Dashboard, Applications, Courses, Analytics)
- ✅ **Complete type safety** (TypeScript throughout)
- ✅ **Full CRUD operations** (approve/reject workflows)
- ✅ **Optimistic updates** (instant UI feedback)
- ✅ **Error handling** (with rollback)
- ✅ **Validation** (inline error messages)
- ✅ **Analytics** (growth trends, top courses, activity)

**Everything is production-ready!** 🚀

Just ensure your Node.js backend is running and you're good to go!

---

## 💡 Need Help?

### Run the automated test:
```bash
./test-admin-backend.sh
```

### Check the console logs:
```javascript
// Open DevTools (F12) → Console
// Look for these messages:
"LoginForm: Login successful, user role: ADMIN"
"ProtectedRoute: Access granted. User role: ADMIN"
```

### Verify backend response:
```bash
# Get your token from browser DevTools → Application → Local Storage
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/admin/metrics
```

Happy admin panel managing! 🎊
