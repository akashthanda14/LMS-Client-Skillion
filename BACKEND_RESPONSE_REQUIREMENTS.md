# Backend API Response Examples - Frontend Requirements

## 🎯 Required Backend Responses for Admin Panel

The frontend is expecting these **exact response structures** from your Node.js backend.

---

## 1. Admin Metrics

### GET `/api/admin/metrics`

**Frontend expects:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 100,
      "byRole": {
        "USER": 80,
        "CREATOR": 15,
        "ADMIN": 5
      },
      "recentSignups": 12
    },
    "courses": {
      "total": 50,
      "byStatus": {
        "DRAFT": 10,
        "PENDING": 5,
        "PUBLISHED": 30,
        "REJECTED": 5
      },
      "recentlyCreated": 8
    },
    "enrollments": {
      "total": 500,
      "active": 350,
      "completed": 150,
      "completionRate": "30.00",
      "recentEnrollments": 45
    },
    "certificates": {
      "total": 140,
      "issuanceRate": "93.33"
    },
    "applications": {
      "total": 25,
      "byStatus": {
        "PENDING": 7,
        "APPROVED": 15,
        "REJECTED": 3
      }
    },
    "timestamp": "2025-10-05T12:34:56.789Z"
  }
}
```

**Important:**
- ✅ All metrics MUST be nested under `data` key
- ✅ `completionRate` and `issuanceRate` are strings (e.g., "30.00")
- ✅ All counts are numbers
- ✅ `byRole` and `byStatus` are required objects

---

## 2. Growth Metrics (NEW)

### GET `/api/admin/metrics/growth`

**Frontend expects:**
```json
{
  "success": true,
  "data": {
    "users": {
      "current": 100,
      "previous": 85,
      "growth": 15,
      "growthRate": "+17.65%"
    },
    "enrollments": {
      "current": 500,
      "previous": 420,
      "growth": 80,
      "growthRate": "+19.05%"
    },
    "courses": {
      "current": 50,
      "previous": 45,
      "growth": 5,
      "growthRate": "+11.11%"
    },
    "certificates": {
      "current": 140,
      "previous": 115,
      "growth": 25,
      "growthRate": "+21.74%"
    }
  }
}
```

**Important:**
- ✅ Compares last 30 days vs previous 30 days
- ✅ `growthRate` includes "+" or "-" sign and "%" symbol
- ✅ All values are numbers except `growthRate` (string)

---

## 3. Top Courses (NEW)

### GET `/api/admin/metrics/top-courses?limit=10`

**Frontend expects:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course-uuid-1",
        "title": "Complete React Course",
        "creator": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "enrollmentCount": 1234,
        "completionRate": "85.5%",
        "averageProgress": "67.3%"
      },
      {
        "id": "course-uuid-2",
        "title": "JavaScript Mastery",
        "creator": {
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "enrollmentCount": 987,
        "completionRate": "78.2%",
        "averageProgress": "71.8%"
      }
    ]
  }
}
```

**Important:**
- ✅ Returns array of courses under `data.courses`
- ✅ Sorted by `enrollmentCount` (highest first)
- ✅ `completionRate` and `averageProgress` are strings with "%" symbol
- ✅ Limit parameter respected (default: 10, max: 50)

---

## 4. Recent Activity (NEW)

### GET `/api/admin/metrics/activity?limit=20`

**Frontend expects:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity-uuid-1",
        "type": "enrollment",
        "description": "John Doe enrolled in Complete React Course",
        "timestamp": "2025-10-05T14:30:00.000Z",
        "metadata": {
          "userId": "user-uuid",
          "courseId": "course-uuid"
        }
      },
      {
        "id": "activity-uuid-2",
        "type": "completion",
        "description": "Jane Smith completed JavaScript Mastery",
        "timestamp": "2025-10-05T14:25:00.000Z",
        "metadata": {
          "userId": "user-uuid",
          "courseId": "course-uuid"
        }
      },
      {
        "id": "activity-uuid-3",
        "type": "course_published",
        "description": "New course 'Node.js Advanced' was published",
        "timestamp": "2025-10-05T14:20:00.000Z",
        "metadata": {
          "courseId": "course-uuid"
        }
      },
      {
        "id": "activity-uuid-4",
        "type": "application_approved",
        "description": "Creator application approved for Mike Johnson",
        "timestamp": "2025-10-05T14:15:00.000Z",
        "metadata": {
          "applicationId": "app-uuid",
          "userId": "user-uuid"
        }
      }
    ]
  }
}
```

**Important:**
- ✅ Returns array under `data.activities`
- ✅ Sorted by `timestamp` (most recent first)
- ✅ Valid `type` values: `"enrollment"`, `"completion"`, `"course_published"`, `"application_approved"`
- ✅ `description` is human-readable text
- ✅ `metadata` is optional object with contextual info

---

## 5. Creator Applications

### GET `/api/admin/applications/pending`

**Frontend expects:**
```json
{
  "success": true,
  "count": 7,
  "applications": [
    {
      "id": "app-uuid-1",
      "status": "PENDING",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "reviewedAt": null,
      "rejectionReason": null,
      "applicant": {
        "id": "user-uuid-1",
        "name": "John Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "role": "USER"
      },
      "bio": "Experienced web developer with 5+ years...",
      "portfolio": "https://johndoe.com",
      "experience": "I have been teaching online for 3 years...",
      "reviewer": null
    }
  ]
}
```

**Important:**
- ✅ `count` shows total number of applications
- ✅ `status` can be: `"PENDING"`, `"APPROVED"`, `"REJECTED"`
- ✅ `reviewedAt` is null for pending applications
- ✅ `applicant.role` should be `"USER"` for pending (becomes `"CREATOR"` when approved)

---

### POST `/api/admin/applications/:id/approve`

**Frontend expects:**
```json
{
  "success": true,
  "message": "Creator application approved successfully. User role upgraded to CREATOR.",
  "application": {
    "id": "app-uuid",
    "status": "APPROVED",
    "reviewedAt": "2025-10-05T15:00:00.000Z",
    "applicant": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CREATOR"
    }
  }
}
```

**Important:**
- ✅ User's role changes from `"USER"` to `"CREATOR"`
- ✅ `reviewedAt` timestamp is set

---

### POST `/api/admin/applications/:id/reject`

**Request body:**
```json
{
  "reason": "Portfolio does not demonstrate sufficient teaching experience"
}
```

**Frontend expects:**
```json
{
  "success": true,
  "message": "Creator application rejected.",
  "application": {
    "id": "app-uuid",
    "status": "REJECTED",
    "reviewedAt": "2025-10-05T15:00:00.000Z",
    "rejectionReason": "Portfolio does not demonstrate sufficient teaching experience",
    "applicant": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Important:**
- ✅ Frontend validates `reason` is at least 10 characters
- ✅ Backend should also validate minimum length

---

## 6. Course Review

### GET `/api/admin/courses/pending`

**Frontend expects:**
```json
{
  "success": true,
  "count": 5,
  "courses": [
    {
      "id": "course-uuid-1",
      "title": "Advanced React Patterns",
      "description": "Learn advanced React patterns including...",
      "thumbnailUrl": "https://cloudinary.com/image.jpg",
      "status": "PENDING",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-03T14:00:00.000Z",
      "submittedAt": "2025-10-03T14:00:00.000Z",
      "reviewedAt": null,
      "rejectionFeedback": null,
      "lessonCount": 12,
      "creator": {
        "id": "creator-uuid",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "lessons": [
        {
          "id": "lesson-uuid-1",
          "title": "Introduction to Hooks",
          "order": 1,
          "videoUrl": "https://cloudinary.com/video1.mp4"
        },
        {
          "id": "lesson-uuid-2",
          "title": "useState and useEffect",
          "order": 2,
          "videoUrl": "https://cloudinary.com/video2.mp4"
        }
      ]
    }
  ]
}
```

**Important:**
- ✅ `status` can be: `"DRAFT"`, `"PENDING"`, `"PUBLISHED"`, `"REJECTED"`
- ✅ `lessonCount` shows number of lessons
- ✅ `lessons` array includes basic lesson info

---

### POST `/api/admin/courses/:id/publish`

**Frontend expects:**
```json
{
  "success": true,
  "message": "Course published successfully",
  "course": {
    "id": "course-uuid",
    "title": "Advanced React Patterns",
    "status": "PUBLISHED",
    "publishedAt": "2025-10-05T15:00:00.000Z",
    "creator": {
      "id": "creator-uuid",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "lessonCount": 12
  }
}
```

**Important:**
- ✅ Status changes to `"PUBLISHED"`
- ✅ `publishedAt` timestamp is set

---

### POST `/api/admin/courses/:id/reject`

**Request body:**
```json
{
  "feedback": "Course content needs clearer learning objectives and better video quality"
}
```

**Frontend expects:**
```json
{
  "success": true,
  "message": "Course rejected",
  "course": {
    "id": "course-uuid",
    "title": "Advanced React Patterns",
    "status": "REJECTED",
    "rejectionFeedback": "Course content needs clearer learning objectives and better video quality",
    "creator": {
      "id": "creator-uuid",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

**Important:**
- ✅ Frontend validates `feedback` is at least 10 characters
- ✅ Backend should also validate minimum length

---

## 7. Authentication

### GET `/api/auth/me`

**Frontend expects:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "username": "admin",
    "role": "ADMIN",
    "isActive": true,
    "emailVerified": true,
    "phoneVerified": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Important:**
- ✅ Returns current authenticated user
- ✅ `role` values: `"USER"`, `"CREATOR"`, `"ADMIN"`
- ✅ Used to verify admin access

---

## 8. Summary Endpoint (Optional)

### GET `/api/admin/metrics/summary`

**Frontend expects:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 100,
      "recentSignups": 12
    },
    "courses": {
      "total": 50,
      "pending": 5,
      "published": 30
    },
    "enrollments": {
      "total": 500,
      "active": 350
    },
    "applications": {
      "pending": 7
    },
    "timestamp": "2025-10-05T12:34:56.789Z"
  }
}
```

**Important:**
- ✅ Lightweight version of full metrics
- ✅ Used for frequent polling (if implemented)

---

## 📋 Implementation Checklist

### Priority 1 (Required)
- [ ] `GET /api/admin/metrics` - Full dashboard metrics
- [ ] `GET /api/admin/applications/pending` - List pending applications
- [ ] `POST /api/admin/applications/:id/approve` - Approve application
- [ ] `POST /api/admin/applications/:id/reject` - Reject with reason
- [ ] `GET /api/admin/courses/pending` - List pending courses
- [ ] `POST /api/admin/courses/:id/publish` - Publish course
- [ ] `POST /api/admin/courses/:id/reject` - Reject with feedback
- [ ] `GET /api/auth/me` - Get current user

### Priority 2 (Analytics Features)
- [ ] `GET /api/admin/metrics/growth` - 30-day growth comparison
- [ ] `GET /api/admin/metrics/top-courses` - Top courses by enrollment
- [ ] `GET /api/admin/metrics/activity` - Recent activity feed

### Priority 3 (Optional)
- [ ] `GET /api/admin/metrics/summary` - Lightweight metrics
- [ ] `GET /api/admin/applications` - All applications (with status filter)
- [ ] `GET /api/admin/courses` - All courses (with status filter)

---

## 🧪 Testing Your Backend

### Quick Test Script
```bash
# Get admin token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"admin@example.com","password":"yourpassword"}' \
  | jq -r '.token')

# Test metrics endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/admin/metrics | jq

# Test pending applications
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/admin/applications/pending | jq

# Test pending courses
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/admin/courses/pending | jq
```

---

## 🚨 Common Response Issues

### ❌ Wrong Structure
```json
{
  "users": { "total": 100 },  // Missing "data" wrapper
  "courses": { "total": 50 }
}
```

### ✅ Correct Structure
```json
{
  "success": true,
  "data": {
    "users": { "total": 100 },
    "courses": { "total": 50 }
  }
}
```

### ❌ Wrong Data Types
```json
{
  "completionRate": 30.00,  // Should be string "30.00"
  "growthRate": 17.65       // Should be string "+17.65%"
}
```

### ✅ Correct Data Types
```json
{
  "completionRate": "30.00",
  "growthRate": "+17.65%"
}
```

---

## 📝 Summary

The frontend requires:

1. **All responses** wrapped in `{ success: true, data: {...} }` or `{ success: true, [key]: [...] }`
2. **Rate fields** as strings with "%" (e.g., "30.00%")
3. **Growth rates** with +/- sign (e.g., "+17.65%")
4. **Nested structures** for metrics (users.byRole, courses.byStatus, etc.)
5. **Arrays** for lists (applications, courses, activities)
6. **Validation** of minimum lengths (10 chars for rejection reason/feedback)

**Copy these examples and make sure your backend returns data in exactly these formats!** 🎯
