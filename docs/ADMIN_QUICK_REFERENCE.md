# 🎯 Admin Panel - Quick Reference Card

## 🔑 Access

**URL:** `http://localhost:3000/login`  
**Role:** User must have `role: 'ADMIN'` in database  
**After Login:** Auto-redirect to `/admin/dashboard`

---

## 📍 Admin Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | `/admin/dashboard` | Overview & quick actions |
| **Applications** | `/admin/review/creators` | Review creator applications |
| **Courses** | `/admin/review/courses` | Moderate pending courses |
| **Analytics** | `/admin/analytics` | Growth trends & insights |

---

## 🔌 Backend Endpoints (15 total)

### Creator Applications (5)
```
GET    /api/admin/applications
GET    /api/admin/applications/pending
GET    /api/admin/applications/:id
POST   /api/admin/applications/:id/approve
POST   /api/admin/applications/:id/reject
```

### Course Review (5)
```
GET    /api/admin/courses
GET    /api/admin/courses/pending
GET    /api/admin/courses/:id
POST   /api/admin/courses/:id/publish
POST   /api/admin/courses/:id/reject
```

### Metrics & Analytics (5)
```
GET    /api/admin/metrics
GET    /api/admin/metrics/summary
GET    /api/admin/metrics/growth
GET    /api/admin/metrics/top-courses
GET    /api/admin/metrics/activity
```

---

## 💻 Frontend API Methods

### Applications
```typescript
adminAPI.getApplications(status?)         // List all
adminAPI.getApplicationsPending()         // Pending only
adminAPI.getApplication(id)               // Single item
adminAPI.approveApplication(id)           // Approve
adminAPI.rejectApplication(id, {reason})  // Reject (≥10 chars)
```

### Courses
```typescript
adminAPI.getCourses(status?)              // List all
adminAPI.getCoursesPending()              // Pending only
adminAPI.getCourseDetail(id)              // Single item
adminAPI.publishCourse(id)                // Publish
adminAPI.rejectCourse(id, {feedback})     // Reject (≥10 chars)
```

### Analytics
```typescript
adminAPI.getMetrics()                     // Full dashboard metrics
adminAPI.getMetricsSummary()              // Lightweight summary
adminAPI.getGrowthMetrics()               // 30-day trends
adminAPI.getTopCourses(limit)             // Top performers
adminAPI.getRecentActivity(limit)         // Activity feed
```

---

## ✅ Validation Rules

| Action | Field | Validation |
|--------|-------|------------|
| Reject Application | `reason` | Min 10 characters |
| Reject Course | `feedback` | Min 10 characters |
| Approve Application | - | No validation |
| Publish Course | - | No validation |

---

## 🧪 Quick Test

```bash
# 1. Test backend connection
./test-admin-backend.sh

# 2. Or manual test
curl http://localhost:4000/api/admin/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Start frontend
npm run dev

# 4. Login and navigate
http://localhost:3000/login
→ http://localhost:3000/admin/dashboard
```

---

## 🎨 UI Features

- ✅ Optimistic updates (instant feedback)
- ✅ Automatic rollback on error
- ✅ Loading states with spinners
- ✅ Success/error toast notifications
- ✅ Inline validation errors
- ✅ Responsive design
- ✅ Smooth animations

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| "Network Error" | Check backend is running on port 4000 |
| "401 Unauthorized" | Verify user has role: 'ADMIN' |
| "No pending items" | Check database for PENDING status items |
| Dashboard empty | Check backend /api/admin/metrics endpoint |

---

## 📊 Metrics Structure

```typescript
{
  users: {
    total: number,
    byRole: { USER, CREATOR, ADMIN },
    recentSignups: number
  },
  courses: {
    total: number,
    byStatus: { DRAFT, PENDING, PUBLISHED, REJECTED },
    recentlyCreated: number
  },
  enrollments: {
    total: number,
    completionRate: string
  },
  certificates: {
    total: number,
    issuanceRate: string
  },
  applications: {
    total: number,
    byStatus: { PENDING, APPROVED, REJECTED }
  }
}
```

---

## 🚀 Quick Commands

```bash
# Test all endpoints
./test-admin-backend.sh

# Start development
npm run dev

# Check for errors
npx tsc --noEmit

# Build for production
npm run build
```

---

## 📚 Documentation

- `ADMIN_INTEGRATION_GUIDE.md` - Full integration guide
- `BACKEND_SYNC_COMPLETE.md` - Detailed sync info
- `SYNC_SUMMARY.md` - Executive summary
- `UNIFIED_LOGIN.md` - Login system docs

---

## ✨ Key Points

1. **Single Login** - All users (admin/creator/learner) use `/login`
2. **Role-Based** - Backend returns role, frontend routes accordingly
3. **Type-Safe** - Full TypeScript coverage
4. **Optimistic** - UI updates immediately, rolls back on error
5. **Validated** - 10+ char minimum for rejection reasons

---

**Everything is ready!** 🎉

Just ensure backend is running on port 4000 and start using the admin panel!
