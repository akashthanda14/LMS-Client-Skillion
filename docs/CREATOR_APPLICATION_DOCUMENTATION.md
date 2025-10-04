# Creator Application System Documentation

## Overview

The Creator Application System allows **LEARNER** users to apply to become **CREATOR** users, and **ADMIN** users to review and approve/reject these applications. Upon approval, the user's role is automatically upgraded from LEARNER to CREATOR, granting them access to course creation features.

## System Architecture

### 1. Service Layer (`services/creatorApplicationService.js`)

Core business logic for creator application management:

- **createCreatorApplication**: Creates a new PENDING application for a learner
- **getApplicationByUserId**: Retrieves application status for a specific user
- **getApplicationsByStatus**: Gets filtered list of applications (PENDING, APPROVED, REJECTED)
- **approveApplication**: Transaction that updates application status and upgrades user role to CREATOR
- **rejectApplication**: Rejects application with admin-provided reason
- **getAllApplications**: Admin view of all applications regardless of status

### 2. Controllers

#### Creator Controller (`controllers/creatorController.js`)

Handles creator-facing operations:

- **submitApplication** (POST /api/creator/apply)
  - Validates bio length (100-500 characters)
  - Validates portfolio URL if provided
  - Validates experience (minimum 50 characters)
  - Checks user role is LEARNER
  - Prevents duplicate applications

- **getApplicationStatus** (GET /api/creator/status)
  - Returns application details including status and reviewer info
  - Indicates if user can apply (LEARNER only)

- **getCreatorDashboard** (GET /api/creator/dashboard)
  - Requires CREATOR role
  - Returns courses created, enrollments, certificates
  - Provides stats: total/published/draft courses, lessons, students

#### Admin Application Controller (`controllers/adminApplicationController.js`)

Handles admin review operations:

- **getAllCreatorApplications** (GET /api/admin/applications)
  - Query parameter: `?status=PENDING|APPROVED|REJECTED`
  - Returns full application details with applicant info

- **getPendingApplications** (GET /api/admin/applications/pending)
  - Convenience route for pending applications
  - Most common admin workflow

- **getApplicationById** (GET /api/admin/applications/:id)
  - Detailed view of single application
  - Includes full applicant profile and reviewer info

- **approveCreatorApplication** (POST /api/admin/applications/:id/approve)
  - Atomic transaction: updates application + upgrades user role
  - Prevents re-approval of already reviewed applications
  - Logs audit trail

- **rejectCreatorApplication** (POST /api/admin/applications/:id/reject)
  - Requires rejection reason (minimum 10 characters)
  - Updates application status to REJECTED
  - Stores reason for applicant to view

### 3. Routes

#### Creator Routes (`routes/creatorRoutes.js`)

```javascript
POST   /api/creator/apply      // Submit application (LEARNER only)
GET    /api/creator/status     // Check application status (Authenticated)
GET    /api/creator/dashboard  // Creator dashboard (CREATOR only)
```

#### Admin Application Routes (`routes/adminApplicationRoutes.js`)

```javascript
GET    /api/admin/applications           // All applications with optional status filter (ADMIN only)
GET    /api/admin/applications/pending   // Pending applications (ADMIN only)
GET    /api/admin/applications/:id       // Single application details (ADMIN only)
POST   /api/admin/applications/:id/approve  // Approve application (ADMIN only)
POST   /api/admin/applications/:id/reject   // Reject application (ADMIN only)
```

### 4. Middleware

- **ensureAuth**: Validates JWT token and attaches `req.user`
- **requireLearner**: Allows LEARNER, CREATOR, ADMIN
- **requireCreator**: Allows CREATOR, ADMIN only
- **requireAdmin**: Allows ADMIN only

## Application Workflow

### Learner → Creator Journey

```
1. LEARNER registers → role: LEARNER
2. LEARNER submits application → status: PENDING
3. ADMIN reviews application
4. ADMIN approves → status: APPROVED, user role: LEARNER → CREATOR
5. User can now access creator dashboard and create courses
```

### Application States

- **PENDING**: Initial state, awaiting admin review
- **APPROVED**: Admin approved, user role upgraded to CREATOR
- **REJECTED**: Admin rejected with reason, user remains LEARNER

## Validation Rules

### Application Submission

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| bio | String | Yes | 100-500 characters |
| portfolio | URL | No | Valid URL format |
| experience | String | Yes | Minimum 50 characters |

### Additional Checks

- User must have LEARNER role
- User can only have ONE application (no duplicates)
- Applications in PENDING status can be approved/rejected
- Already reviewed applications cannot be re-reviewed

### Rejection

- Rejection reason required
- Minimum 10 characters

## Database Schema

```prisma
model CreatorApplication {
  id               String   @id @default(uuid()) @db.Uuid
  userId           String   @unique @db.Uuid
  status           ApplicationStatus @default(PENDING) // PENDING, APPROVED, REJECTED
  bio              String
  portfolio        String?
  experience       String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  reviewedBy       String?  @db.Uuid
  reviewedAt       DateTime?
  rejectionReason  String?

  user             User     @relation(fields: [userId], references: [id])
  reviewer         User?    @relation("ApplicationReviewer", fields: [reviewedBy], references: [id])
}
```

## API Examples

### Submit Application

```bash
POST /api/creator/apply
Authorization: Bearer <LEARNER_TOKEN>
Content-Type: application/json

{
  "bio": "I am a passionate educator with 10+ years of experience...",
  "portfolio": "https://myportfolio.com",
  "experience": "I have taught web development for 10 years..."
}

Response:
{
  "success": true,
  "message": "Creator application submitted successfully...",
  "application": {
    "id": "uuid",
    "status": "PENDING",
    "createdAt": "2025-10-04T..."
  }
}
```

### Admin Approve Application

```bash
POST /api/admin/applications/:id/approve
Authorization: Bearer <ADMIN_TOKEN>

Response:
{
  "success": true,
  "message": "Creator application approved successfully. User role upgraded to CREATOR.",
  "application": {
    "id": "uuid",
    "status": "APPROVED",
    "reviewedAt": "2025-10-04T...",
    "applicant": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CREATOR"
    }
  }
}
```

### Creator Dashboard

```bash
GET /api/creator/dashboard
Authorization: Bearer <CREATOR_TOKEN>

Response:
{
  "success": true,
  "dashboard": {
    "creator": {
      "id": "uuid",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "application": {
      "approvedAt": "2025-10-04T...",
      "status": "APPROVED"
    },
    "stats": {
      "totalCourses": 5,
      "publishedCourses": 3,
      "draftCourses": 2,
      "totalEnrollments": 150,
      "totalLessons": 45,
      "totalCertificates": 50
    },
    "courses": [ ... ]
  }
}
```

## Error Handling

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Bio must be between 100 and 500 characters | Invalid bio length |
| 400 | Portfolio must be a valid URL | Invalid URL format |
| 400 | Experience must be at least 50 characters | Experience too short |
| 403 | Only learners can apply to become creators | Non-learner tried to apply |
| 403 | Access denied. Only ADMIN allowed | Non-admin tried admin action |
| 404 | Application not found | Invalid application ID |
| 409 | You already have a creator application | Duplicate application attempt |
| 400 | Application has already been reviewed | Cannot re-review application |

## Testing

Run comprehensive test suite:

```bash
# Reset test data
node reset-test-data.js

# Run tests
node test-creator-application.js
```

### Test Coverage (15 Tests)

1. ✅ Learner login
2. ✅ Admin login
3. ✅ Creator login
4. ✅ Invalid application (bio too short)
5. ✅ Submit valid application
6. ✅ Duplicate application prevention
7. ✅ Check application status
8. ✅ Admin views pending applications
9. ✅ Non-admin cannot approve
10. ✅ Admin approves application
11. ✅ Verify role upgrade
12. ✅ Creator accesses dashboard
13. ✅ Existing creator dashboard
14. ✅ Admin views all applications
15. ✅ Cannot re-approve application

**Success Rate: 100% (15/15 tests passing)**

## Security Considerations

1. **Role-Based Access Control**:
   - Only LEARNER can apply
   - Only ADMIN can review applications
   - Only CREATOR can access dashboard

2. **Validation**:
   - Input sanitization (trim, length checks)
   - URL validation for portfolio
   - Duplicate prevention

3. **Audit Trail**:
   - All actions logged with Winston
   - Reviewer ID tracked
   - Timestamps for all status changes

4. **Transaction Safety**:
   - Application approval uses atomic transaction
   - Role upgrade and status update happen together
   - No partial state changes

## Future Enhancements

1. Email notifications for application status changes
2. Application feedback/comments system
3. Application analytics dashboard
4. Batch approval/rejection
5. Application resubmission after rejection
6. Creator profile verification badges

## Dependencies

- **validator**: URL validation
- **Prisma**: Database ORM with transaction support
- **Winston**: Logging and audit trails
- **Express**: HTTP routing
- **JWT**: Authentication tokens

## Related Documentation

- [AUTH_RBAC_DOCUMENTATION.md](./AUTH_RBAC_DOCUMENTATION.md) - Authentication and RBAC system
- [SCHEMA.md](./SCHEMA.md) - Complete database schema
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
