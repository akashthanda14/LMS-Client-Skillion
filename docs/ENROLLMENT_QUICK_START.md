# 🎓 Enrollment System - Quick Start Guide

## 🚀 Quick Test Commands

### 1. Login as Learner
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"john@example.com","password":"password123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

### 2. Browse Published Courses
```bash
curl -s http://localhost:4000/api/courses\?status\=PUBLISHED \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, title, level}'
```

### 3. Enroll in a Course
```bash
COURSE_ID="3d3639e9-c7ce-4fd4-8b48-67458467e139"

curl -s -X POST http://localhost:4000/api/courses/$COURSE_ID/enroll \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. Check Your Progress
```bash
curl -s http://localhost:4000/api/progress \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 5. Get Course Details with Lessons
```bash
curl -s http://localhost:4000/api/courses/$COURSE_ID/progress \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 6. Mark a Lesson Complete
```bash
LESSON_ID="0305ea36-6360-4329-a6c1-dda0a92368fd"

curl -s -X POST http://localhost:4000/api/lessons/$LESSON_ID/complete \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 📊 API Endpoints Reference

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/courses/:id/enroll` | LEARNER | Enroll in course |
| GET | `/api/progress` | Auth | Get all enrollments |
| GET | `/api/courses/:id/progress` | Auth | Get course progress |
| POST | `/api/lessons/:id/complete` | LEARNER | Mark lesson complete |
| GET | `/api/courses/:id/enrollment` | Auth | Check enrollment status |
| GET | `/api/courses/:id` | Public | Get course (with enrollment if auth) |

## 🔑 Test Users

### Learner Account
- **Email:** john@example.com
- **Password:** password123
- **Role:** LEARNER
- Can enroll and complete lessons

### Creator Account
- **Email:** sarah@example.com
- **Password:** password123
- **Role:** CREATOR
- Creates courses (cannot enroll)

### Admin Account
- **Email:** admin@lms.com
- **Password:** admin123
- **Role:** ADMIN
- Full system access

## 🎯 Progress Calculation

```
Progress = (Completed Lessons / Total Lessons) × 100
```

**Example:**
- Course has 10 lessons
- Completed 7 lessons
- Progress = (7 / 10) × 100 = 70%

## ✅ Success Indicators

When enrollment works:
```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "enrollment": {
      "id": "uuid",
      "progress": 0,
      "enrolledAt": "2025-10-04T19:49:15.000Z"
    }
  }
}
```

When lesson completed:
```json
{
  "success": true,
  "message": "Lesson marked as complete",
  "data": {
    "enrollment": {
      "progress": 100,
      "completedAt": "2025-10-04T19:54:03.000Z"
    }
  }
}
```

## 🧪 Run Full Integration Test

```bash
node test-enrollment-progress.js
```

**Expected:** 11/12 tests passing (91.7%)

## 📖 Full Documentation

See `docs/ENROLLMENT_SYSTEM.md` for:
- Complete API reference
- Frontend integration examples
- Error handling
- Security considerations
- Performance optimization

## 🎉 You're Ready!

Start building your frontend enrollment flow! 🚀
