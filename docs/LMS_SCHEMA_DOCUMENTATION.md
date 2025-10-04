# MicroCourses LMS Schema Documentation

## 🎓 Overview

The MicroCourses Learning Management System has been successfully transformed from a basic authentication system to a full-featured educational platform. This document outlines the complete database schema, relationships, and features.

---

## 📊 Database Schema

### User Management

#### **User Model** (`users` table)
The core user model supporting three roles: LEARNER, CREATOR, and ADMIN.

**Key Fields:**
- `id`: UUID primary key
- `role`: UserRole enum (LEARNER, CREATOR, ADMIN)
- `email`, `phoneNumber`: Unique identifiers with verification flags
- `isProfileComplete`: Tracks onboarding completion
- `isActive`: Account status flag
- Profile fields: `country`, `state`, `zip`, `bio`, `avatar`
- Change workflows: `pendingEmail`, `pendingPhone` with OTP fields
- Password reset: `resetToken`, `resetTokenExpiry`
- Tracking: `lastLoginAt`

**Relations:**
- One-to-one: `creatorApplication`
- One-to-many: `coursesCreated`, `enrollments`, `certificates`, `emailOtps`, `phoneOtps`
- Many-to-many: `reviewedApplications`

**Indexes:**
- Single: `email`, `phoneNumber`, `username`, `role`, `isActive`, `resetToken`
- Composite: `[phoneVerified, isProfileComplete]`, `[emailVerified, isProfileComplete]`

---

### Creator Application System

#### **CreatorApplication Model** (`creator_applications` table)
Manages the application process for users wanting to become course creators.

**Key Fields:**
- `id`: UUID primary key
- `userId`: Unique foreign key to User
- `bio`: Text field for creator biography
- `portfolio`: Optional portfolio URL
- `experience`: Text field describing teaching/professional experience
- `status`: Enum (PENDING, APPROVED, REJECTED)
- `reviewedBy`: Foreign key to admin User
- `reviewedAt`: Timestamp of review
- `rejectionReason`: Optional text explaining rejection

**Workflow:**
1. Learner submits application (status: PENDING)
2. Admin reviews and approves/rejects
3. If approved, user's role changes to CREATOR
4. Creator can now create courses

**Relations:**
- Many-to-one: `user` (applicant)
- Many-to-one: `reviewer` (admin)

**Indexes:**
- `userId`, `status`, `reviewedBy`, `createdAt`

---

### Course & Lesson Management

#### **Course Model** (`courses` table)
Represents educational courses created by approved creators.

**Key Fields:**
- `id`: UUID primary key
- `creatorId`: Foreign key to User
- `title`: Course name (max 255 chars)
- `description`: Detailed course description
- `thumbnail`: Optional image URL
- `category`: Optional categorization (e.g., "Programming", "Web Development")
- `level`: Enum (BEGINNER, INTERMEDIATE, ADVANCED)
- `duration`: Total course duration in minutes
- `status`: Enum (DRAFT, SUBMITTED, PUBLISHED, ARCHIVED)
- `submittedAt`: When creator submitted for review
- `publishedAt`: When admin published the course

**Course Lifecycle:**
1. **DRAFT**: Creator is building the course
2. **SUBMITTED**: Submitted for admin review
3. **PUBLISHED**: Live and available to learners
4. **ARCHIVED**: Hidden from new enrollments

**Relations:**
- Many-to-one: `creator`
- One-to-many: `lessons`, `enrollments`, `certificates`

**Indexes:**
- `creatorId`, `status`, `category`, `level`, `publishedAt`, `createdAt`

#### **Lesson Model** (`lessons` table)
Individual video lessons within a course.

**Key Fields:**
- `id`: UUID primary key
- `courseId`: Foreign key to Course
- `title`: Lesson name
- `videoUrl`: URL to hosted video
- `transcript`: Optional text transcript
- `order`: Integer for lesson sequencing (unique per course)
- `duration`: Lesson duration in minutes

**Unique Constraint:**
- `[courseId, order]`: Ensures no duplicate order numbers per course

**Relations:**
- Many-to-one: `course`
- One-to-many: `progress` (lesson progress records)

**Indexes:**
- `courseId`, `order`

---

### Enrollment & Progress Tracking

#### **Enrollment Model** (`enrollments` table)
Tracks learner enrollment in courses.

**Key Fields:**
- `id`: UUID primary key
- `userId`: Foreign key to User
- `courseId`: Foreign key to Course
- `progress`: Integer percentage (0-100)
- `enrolledAt`: Enrollment timestamp
- `completedAt`: Course completion timestamp (nullable)
- `lastAccessedAt`: Last activity timestamp

**Unique Constraint:**
- `[userId, courseId]`: One enrollment per user per course

**Progress Calculation:**
```
progress = (completed_lessons / total_lessons) * 100
```

**Relations:**
- Many-to-one: `user`, `course`
- One-to-many: `lessonProgress`
- One-to-one: `certificate`

**Indexes:**
- `userId`, `courseId`, `enrolledAt`, `completedAt`

#### **LessonProgress Model** (`lesson_progress` table)
Tracks individual lesson completion within an enrollment.

**Key Fields:**
- `id`: UUID primary key
- `enrollmentId`: Foreign key to Enrollment
- `lessonId`: Foreign key to Lesson
- `completed`: Boolean flag
- `watchedAt`: Timestamp when lesson was completed

**Unique Constraint:**
- `[enrollmentId, lessonId]`: One progress record per lesson per enrollment

**Relations:**
- Many-to-one: `enrollment`, `lesson`

**Indexes:**
- `enrollmentId`, `lessonId`, `completed`

---

### Certificate System

#### **Certificate Model** (`certificates` table)
Issues verifiable completion certificates.

**Key Fields:**
- `id`: UUID primary key
- `enrollmentId`: Unique foreign key to Enrollment (one-to-one)
- `userId`: Foreign key to User
- `courseId`: Foreign key to Course
- `serialHash`: Unique SHA-256 hash for verification
- `issuedAt`: Certificate issue timestamp

**Serial Hash Generation:**
```javascript
const serialHash = crypto
  .createHash('sha256')
  .update(`${userId}-${courseId}-${timestamp}`)
  .digest('hex');
```

**Relations:**
- One-to-one: `enrollment`
- Many-to-one: `user`, `course`

**Indexes:**
- `userId`, `courseId`, `serialHash`, `issuedAt`

---

### Authentication (OTP)

#### **EmailOTP Model** (`email_otps` table)
Manages email-based one-time passwords.

**Key Fields:**
- `id`: Auto-increment integer
- `userId`: Foreign key to User
- `otp`: 6-character code
- `expiresAt`: Expiration timestamp
- `attempts`: Failed verification counter
- `maxAttempts`: Maximum allowed attempts (default: 3)
- `isUsed`: Boolean flag
- `type`: OTPType enum
- `ipAddress`, `userAgent`: Security tracking

**OTP Types:**
- `EMAIL_VERIFICATION`: Email verification during signup
- `EMAIL_CHANGE`: Changing email address
- `PASSWORD_RESET`: Password reset workflow
- `ACCOUNT_DELETE`: Account deletion confirmation

**Relations:**
- Many-to-one: `user`

**Indexes:**
- Composite: `[userId, type]`, `[otp, isUsed, expiresAt]`
- Single: `createdAt`, `expiresAt`

#### **PhoneOTP Model** (`phone_otps` table)
Manages SMS-based one-time passwords.

**Key Fields:** (Similar to EmailOTP)
- `id`: Auto-increment integer
- `userId`: Foreign key to User
- `otp`: 6-character code
- `type`: OTPType enum
- Additional fields same as EmailOTP

**OTP Types:**
- `PHONE_VERIFICATION`: Phone verification during signup
- `PHONE_CHANGE`: Changing phone number
- `SIGNIN`: SMS-based login

**Relations:**
- Many-to-one: `user`

**Indexes:**
- Composite: `[userId, type, createdAt]`, `[otp, isUsed, expiresAt]`
- Single: `createdAt`, `expiresAt`

---

## 🔄 Enums

### UserRole
```prisma
enum UserRole {
  LEARNER   // Default role, can enroll in courses
  CREATOR   // Can create and publish courses
  ADMIN     // Full platform management
}
```

### CreatorApplicationStatus
```prisma
enum CreatorApplicationStatus {
  PENDING   // Awaiting admin review
  APPROVED  // Application accepted
  REJECTED  // Application denied
}
```

### CourseStatus
```prisma
enum CourseStatus {
  DRAFT      // Being created by creator
  SUBMITTED  // Submitted for review
  PUBLISHED  // Live and available
  ARCHIVED   // Hidden from catalog
}
```

### CourseLevel
```prisma
enum CourseLevel {
  BEGINNER      // Entry-level content
  INTERMEDIATE  // Moderate difficulty
  ADVANCED      // Expert-level content
}
```

### OTPType
```prisma
enum OTPType {
  SIGNIN               // SMS login
  SIGNUP               // Initial registration
  PASSWORD_RESET       // Password recovery
  EMAIL_VERIFICATION   // Email confirmation
  PHONE_VERIFICATION   // Phone confirmation
  EMAIL_CHANGE         // Email update
  PHONE_CHANGE         // Phone update
  ACCOUNT_DELETE       // Account deletion
}
```

---

## 🗂️ Database Relationships

### User Relationships
```
User (1) ←→ (1) CreatorApplication
User (1) ←→ (N) Course (as creator)
User (1) ←→ (N) Enrollment (as learner)
User (1) ←→ (N) Certificate
User (1) ←→ (N) EmailOTP
User (1) ←→ (N) PhoneOTP
User (1) ←→ (N) CreatorApplication (as reviewer)
```

### Course Relationships
```
Course (1) ←→ (N) Lesson
Course (1) ←→ (N) Enrollment
Course (1) ←→ (N) Certificate
Course (N) ←→ (1) User (creator)
```

### Enrollment Relationships
```
Enrollment (1) ←→ (N) LessonProgress
Enrollment (1) ←→ (1) Certificate
Enrollment (N) ←→ (1) User
Enrollment (N) ←→ (1) Course
```

---

## 🎯 Key Features

### 1. Multi-Role System
- **Learners**: Browse, enroll, learn, earn certificates
- **Creators**: Build courses, manage content
- **Admins**: Approve creators, publish courses, manage platform

### 2. Creator Application Workflow
- Learners apply to become creators
- Admins review applications
- Approved users gain creator privileges

### 3. Course Publication Pipeline
- Creators build courses in DRAFT status
- Submit for review (SUBMITTED)
- Admins publish approved courses (PUBLISHED)

### 4. Progress Tracking
- Per-lesson completion tracking
- Overall course progress percentage
- Last accessed timestamps

### 5. Certificate Issuance
- Automatic certificate generation on course completion
- Unique serial hash for verification
- Tamper-proof SHA-256 hashing

### 6. Robust Authentication
- Email and phone OTP verification
- Password reset workflows
- Account change security (email/phone updates)
- Rate limiting via attempt tracking

---

## 📦 Seed Data

The database has been seeded with comprehensive demo data:

### Users
| Role | Username | Email | Password | Status |
|------|----------|-------|----------|--------|
| ADMIN | admin | admin@microcourses.com | password123 | Active |
| LEARNER | john_learner | john@example.com | password123 | Active |
| LEARNER | emma_student | emma@example.com | password123 | Active |
| CREATOR | sarah_creator | sarah@example.com | password123 | Approved |

### Courses
1. **JavaScript Fundamentals for Beginners**
   - Creator: Sarah Williams
   - Level: BEGINNER
   - Lessons: 3 (Introduction, Variables, Functions)
   - Duration: 4 hours

2. **React for Beginners: Build Modern Web Apps**
   - Creator: Sarah Williams
   - Level: INTERMEDIATE
   - Lessons: 3 (Getting Started, Components, Hooks)
   - Duration: 5 hours

### Enrollments
- **John (learner1)**:
  - Course 1: ✅ Completed (100%) + Certificate
  - Course 2: 🔄 In Progress (33%)
- **Emma (learner2)**:
  - Course 2: 🔄 In Progress (66%)

---

## 🔧 Database Management

### Prisma Commands

#### Generate Client
```bash
npx prisma generate
```

#### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

#### Reset Database
```bash
npx prisma migrate reset
```

#### Seed Database
```bash
npx prisma db seed
```

#### Open Prisma Studio
```bash
npx prisma studio
```
Visit: http://localhost:5555

---

## 📈 Performance Considerations

### Indexes
The schema includes strategic indexes for:
- User lookups (email, phone, username)
- Course filtering (status, category, level)
- Progress queries (enrollment, completion)
- OTP validation (otp code, expiration)
- Certificate verification (serial hash)

### Composite Indexes
- `[userId, type]` on OTP tables for user-specific queries
- `[enrollmentId, lessonId]` on lesson progress
- `[phoneVerified, isProfileComplete]` on users
- `[courseId, order]` on lessons

### Cascading Deletes
All foreign key relationships use `onDelete: Cascade` to maintain referential integrity:
- Deleting a user removes their OTPs, enrollments, certificates
- Deleting a course removes lessons, enrollments, certificates
- Deleting an enrollment removes progress tracking

---

## 🔐 Security Features

1. **OTP Security**
   - 6-digit codes with expiration
   - Attempt limiting (max 3 attempts)
   - IP address and user agent tracking
   - One-time use enforcement

2. **Password Security**
   - Bcrypt hashing (12 salt rounds)
   - Password reset token system
   - Token expiration

3. **Certificate Verification**
   - SHA-256 hashing for tamper detection
   - Unique serial numbers
   - Immutable issuance timestamps

4. **Account Security**
   - Email/phone change workflows with OTP
   - Account deletion confirmation
   - Active/inactive account flags

---

## 🚀 Migration Summary

**From:** Basic authentication system (User, EmailOTP, PhoneOTP)  
**To:** Full-featured LMS with 10 models

**Added Models:**
- CreatorApplication
- Course
- Lesson
- Enrollment
- LessonProgress
- Certificate

**Modified Models:**
- User: Changed UserRole enum (USER, ADMIN, MODERATOR → LEARNER, CREATOR, ADMIN)

**Migration Applied:**
- `20251004104517_lms_schema_transformation`

---

## 📚 Next Steps

### Recommended Enhancements

1. **Course Features**
   - Reviews and ratings
   - Course prerequisites
   - Course pricing/monetization
   - Course tags/search

2. **Learning Features**
   - Quiz system
   - Discussion forums
   - Live sessions
   - Bookmarks/notes

3. **Analytics**
   - Creator dashboards
   - Learning analytics
   - Platform statistics

4. **Notifications**
   - Email notifications
   - In-app notifications
   - Push notifications

5. **Content Management**
   - File uploads (videos, PDFs)
   - Rich text editor
   - Media library

---

## 📞 Support

For database issues or schema questions:
- Check Prisma Studio: http://localhost:5555
- Review migration logs: `/prisma/migrations/`
- Consult Prisma docs: https://www.prisma.io/docs

---

**Generated:** 2025-10-04  
**Schema Version:** 1.0.0  
**Prisma Version:** 5.22.0  
**Database:** PostgreSQL (Neon)
