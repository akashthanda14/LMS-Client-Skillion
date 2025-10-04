# LMS Backend Architecture & Database Schema

## Complete System Architecture

```mermaid
graph TB
    %% Client Layer
    subgraph "Frontend Applications"
        WEB[Web App - Next.js]
        MOB[Mobile App]
        API_CLIENT[API Clients]
    end

    %% API Gateway Layer
    subgraph "API Layer"
        NGINX[NGINX Reverse Proxy]
        EXPRESS[Express.js Server]
        CORS[CORS Middleware]
        LOGGER[Request Logger]
    end

    %% Authentication & Authorization
    subgraph "Auth & RBAC System"
        AUTH_MW[Auth Middleware]
        RBAC_MW[RBAC Middleware]
        JWT[JWT Service]
        TOKEN_SVC[Token Service]
        OTP_SVC[OTP Service]
    end

    %% Route Layer
    subgraph "Route Handlers"
        AUTH_ROUTES[Auth Routes]
        USER_ROUTES[User Routes]
        COURSE_ROUTES[Course Routes]
        LESSON_ROUTES[Lesson Routes]
        ENROLLMENT_ROUTES[Enrollment Routes]
        CREATOR_ROUTES[Creator Routes]
        ADMIN_ROUTES[Admin Routes]
        CERT_ROUTES[Certificate Routes]
    end

    %% Controller Layer
    subgraph "Controllers"
        AUTH_CTRL[Auth Controller]
        USER_CTRL[User Controller]
        COURSE_CTRL[Course Controller]
        LESSON_CTRL[Lesson Controller]
        ENROLLMENT_CTRL[Enrollment Controller]
        CREATOR_CTRL[Creator Controller]
        ADMIN_CTRL[Admin Controller]
        CERT_CTRL[Certificate Controller]
    end

    %% Service Layer
    subgraph "Business Logic Services"
        USER_SVC[User Service]
        COURSE_SVC[Course Service]
        LESSON_SVC[Lesson Service]
        ENROLLMENT_SVC[Enrollment Service]
        CERT_SVC[Certificate Service]
        VALIDATION_SVC[Validation Service]
    end

    %% External Services
    subgraph "External Services"
        CLOUDINARY[Cloudinary - Video Storage]
        EMAIL_SVC[Email Service - Nodemailer]
        SMS_SVC[SMS Service]
        REDIS[Redis - Queue & Cache]
        TRANSCRIPTION[Transcription Worker]
    end

    %% Database Layer
    subgraph "Database Layer"
        PRISMA[Prisma ORM]
        POSTGRES[(PostgreSQL Database)]
    end

    %% Connections
    WEB --> NGINX
    MOB --> NGINX
    API_CLIENT --> NGINX
    
    NGINX --> EXPRESS
    EXPRESS --> CORS
    CORS --> LOGGER
    LOGGER --> AUTH_MW
    
    AUTH_MW --> JWT
    AUTH_MW --> TOKEN_SVC
    AUTH_MW --> RBAC_MW
    
    RBAC_MW --> AUTH_ROUTES
    RBAC_MW --> USER_ROUTES
    RBAC_MW --> COURSE_ROUTES
    RBAC_MW --> LESSON_ROUTES
    RBAC_MW --> ENROLLMENT_ROUTES
    RBAC_MW --> CREATOR_ROUTES
    RBAC_MW --> ADMIN_ROUTES
    RBAC_MW --> CERT_ROUTES
    
    AUTH_ROUTES --> AUTH_CTRL
    USER_ROUTES --> USER_CTRL
    COURSE_ROUTES --> COURSE_CTRL
    LESSON_ROUTES --> LESSON_CTRL
    ENROLLMENT_ROUTES --> ENROLLMENT_CTRL
    CREATOR_ROUTES --> CREATOR_CTRL
    ADMIN_ROUTES --> ADMIN_CTRL
    CERT_ROUTES --> CERT_CTRL
    
    AUTH_CTRL --> USER_SVC
    AUTH_CTRL --> OTP_SVC
    USER_CTRL --> USER_SVC
    COURSE_CTRL --> COURSE_SVC
    LESSON_CTRL --> LESSON_SVC
    LESSON_CTRL --> CLOUDINARY
    ENROLLMENT_CTRL --> ENROLLMENT_SVC
    CREATOR_CTRL --> USER_SVC
    ADMIN_CTRL --> COURSE_SVC
    CERT_CTRL --> CERT_SVC
    
    USER_SVC --> PRISMA
    COURSE_SVC --> PRISMA
    LESSON_SVC --> PRISMA
    ENROLLMENT_SVC --> PRISMA
    CERT_SVC --> PRISMA
    VALIDATION_SVC --> PRISMA
    
    PRISMA --> POSTGRES
    
    OTP_SVC --> EMAIL_SVC
    OTP_SVC --> SMS_SVC
    LESSON_SVC --> TRANSCRIPTION
    TRANSCRIPTION --> REDIS
    
    %% Styling
    classDef frontend fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef auth fill:#fff3e0
    classDef routes fill:#e8f5e8
    classDef controllers fill:#fce4ec
    classDef services fill:#f1f8e9
    classDef external fill:#fff8e1
    classDef database fill:#e3f2fd
    
    class WEB,MOB,API_CLIENT frontend
    class NGINX,EXPRESS,CORS,LOGGER api
    class AUTH_MW,RBAC_MW,JWT,TOKEN_SVC,OTP_SVC auth
    class AUTH_ROUTES,USER_ROUTES,COURSE_ROUTES,LESSON_ROUTES,ENROLLMENT_ROUTES,CREATOR_ROUTES,ADMIN_ROUTES,CERT_ROUTES routes
    class AUTH_CTRL,USER_CTRL,COURSE_CTRL,LESSON_CTRL,ENROLLMENT_CTRL,CREATOR_CTRL,ADMIN_CTRL,CERT_CTRL controllers
    class USER_SVC,COURSE_SVC,LESSON_SVC,ENROLLMENT_SVC,CERT_SVC,VALIDATION_SVC services
    class CLOUDINARY,EMAIL_SVC,SMS_SVC,REDIS,TRANSCRIPTION external
    class PRISMA,POSTGRES database
```

## Database Schema & Relationships

```mermaid
erDiagram
    User ||--o{ Course : creates
    User ||--o{ Enrollment : enrolls
    User ||--o{ CreatorApplication : submits
    User ||--o{ Certificate : earns
    User ||--o{ LessonProgress : tracks
    
    Course ||--o{ Lesson : contains
    Course ||--o{ Enrollment : has
    Course ||--o{ Certificate : generates
    
    Enrollment ||--o{ LessonProgress : tracks
    Enrollment ||--o{ Certificate : earns
    
    Lesson ||--o{ LessonProgress : completed_by
    
    User {
        string id PK
        string email UK
        string phoneNumber UK
        string name
        string username UK
        string password
        string fullName
        string country
        string state
        string zip
        boolean emailVerified
        boolean phoneVerified
        boolean isProfileComplete
        boolean isActive
        enum role
        datetime createdAt
        datetime updatedAt
        datetime lastLoginAt
    }
    
    Course {
        string id PK
        string title
        text description
        string thumbnailUrl
        decimal price
        enum status
        string creatorId FK
        datetime createdAt
        datetime updatedAt
        datetime submittedAt
        datetime publishedAt
    }
    
    Lesson {
        string id PK
        string title
        text description
        string videoUrl
        text transcript
        int order
        string courseId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Enrollment {
        string id PK
        string userId FK
        string courseId FK
        decimal progress
        boolean completed
        datetime enrolledAt
        datetime completedAt
    }
    
    LessonProgress {
        string id PK
        string userId FK
        string lessonId FK
        string enrollmentId FK
        boolean completed
        datetime completedAt
    }
    
    Certificate {
        string id PK
        string userId FK
        string courseId FK
        string enrollmentId FK
        string serialHash UK
        datetime issuedAt
    }
    
    CreatorApplication {
        string id PK
        string userId FK
        text bio
        string portfolioUrl
        int experienceYears
        enum status
        text reviewerNotes
        string reviewerId FK
        datetime createdAt
        datetime reviewedAt
    }
```

## Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthMiddleware
    participant RBACMiddleware
    participant TokenService
    participant UserService
    participant Database
    
    %% Registration Flow
    Client->>AuthController: POST /auth/register
    AuthController->>UserService: registerUser(email)
    UserService->>Database: Create user (role: LEARNER)
    UserService->>AuthController: Send OTP
    AuthController->>Client: Registration success
    
    %% OTP Verification
    Client->>AuthController: POST /auth/verify-email
    AuthController->>UserService: verifyOTP(email, otp)
    UserService->>Database: Verify user
    UserService->>AuthController: Verification success
    AuthController->>Client: Profile completion required
    
    %% Profile Completion
    Client->>AuthController: POST /auth/complete-profile
    AuthController->>UserService: completeProfile(data)
    UserService->>Database: Update user profile
    AuthController->>TokenService: createAuthToken(userId, role)
    TokenService->>AuthController: JWT token
    AuthController->>Client: Profile complete + JWT
    
    %% Protected Route Access
    Client->>AuthMiddleware: Request with JWT
    AuthMiddleware->>TokenService: verifyToken(jwt)
    TokenService->>AuthMiddleware: Token valid + user data
    AuthMiddleware->>RBACMiddleware: Check role permissions
    RBACMiddleware->>AuthMiddleware: Access granted
    AuthMiddleware->>Client: Allow access
```

## Course Management Flow

```mermaid
flowchart TD
    START([User Login]) --> CHECK_ROLE{Check User Role}
    
    %% Learner Flow
    CHECK_ROLE -->|LEARNER| BROWSE[Browse Published Courses]
    BROWSE --> ENROLL[Enroll in Course]
    ENROLL --> WATCH[Watch Lessons]
    WATCH --> PROGRESS[Track Progress]
    PROGRESS --> COMPLETE{Course Complete?}
    COMPLETE -->|Yes| CERTIFICATE[Generate Certificate]
    COMPLETE -->|No| WATCH
    
    %% Creator Flow
    CHECK_ROLE -->|CREATOR| CREATE_COURSE[Create Course Draft]
    CREATE_COURSE --> UPLOAD_LESSONS[Upload Video Lessons]
    UPLOAD_LESSONS --> CLOUDINARY[(Cloudinary Storage)]
    CLOUDINARY --> TRANSCRIPTION[Generate Transcription]
    TRANSCRIPTION --> REORDER[Reorder Lessons]
    REORDER --> SUBMIT[Submit for Review]
    SUBMIT --> PENDING[Course Status: PENDING]
    
    %% Admin Flow
    CHECK_ROLE -->|ADMIN| REVIEW_QUEUE[Review Pending Courses]
    REVIEW_QUEUE --> ADMIN_DECISION{Approve/Reject}
    ADMIN_DECISION -->|Approve| PUBLISH[Publish Course]
    ADMIN_DECISION -->|Reject| REJECT[Reject with Feedback]
    PUBLISH --> AVAILABLE[Available to Learners]
    REJECT --> CREATE_COURSE
    
    %% Creator Application Flow
    CHECK_ROLE -->|LEARNER| APPLY_CREATOR{Want to be Creator?}
    APPLY_CREATOR -->|Yes| SUBMIT_APPLICATION[Submit Creator Application]
    SUBMIT_APPLICATION --> ADMIN_REVIEW[Admin Reviews Application]
    ADMIN_REVIEW --> APP_DECISION{Approve/Reject}
    APP_DECISION -->|Approve| UPGRADE_ROLE[Upgrade to CREATOR]
    APP_DECISION -->|Reject| BROWSE
    UPGRADE_ROLE --> CREATE_COURSE
    
    %% Styling
    classDef learner fill:#e3f2fd
    classDef creator fill:#f3e5f5
    classDef admin fill:#fff3e0
    classDef process fill:#e8f5e8
    classDef decision fill:#fce4ec
    classDef storage fill:#fff8e1
    
    class BROWSE,ENROLL,WATCH,PROGRESS,CERTIFICATE learner
    class CREATE_COURSE,UPLOAD_LESSONS,REORDER,SUBMIT creator
    class REVIEW_QUEUE,PUBLISH,REJECT,ADMIN_REVIEW,UPGRADE_ROLE admin
    class TRANSCRIPTION,PENDING,AVAILABLE,SUBMIT_APPLICATION process
    class CHECK_ROLE,COMPLETE,ADMIN_DECISION,APPLY_CREATOR,APP_DECISION decision
    class CLOUDINARY storage
```

## API Endpoints Overview

```mermaid
mindmap
  root)LMS API Endpoints(
    Authentication
      POST /auth/register
      POST /auth/verify-email
      POST /auth/verify-phone  
      POST /auth/complete-profile
      POST /auth/login
      GET /auth/me
      POST /auth/refresh
    
    User Management
      POST /user-auth/register
      POST /user-auth/verify-email-otp
      POST /user-auth/complete-profile
      POST /user-auth/login
      POST /user-auth/forgot-password
      POST /user-auth/reset-password
    
    Course Management
      GET /courses
      GET /courses/:id
      POST /courses
      PATCH /courses/:id
      POST /courses/:id/submit
      DELETE /courses/:id
    
    Lesson Management  
      GET /courses/:courseId/lessons
      POST /courses/:courseId/lessons/upload
      POST /courses/:courseId/lessons
      PATCH /lessons/:id
      DELETE /lessons/:id
    
    Enrollment & Progress
      POST /courses/:id/enroll
      GET /progress
      GET /courses/:id/progress  
      POST /lessons/:id/complete
    
    Creator System
      POST /creator/apply
      GET /creator/status
      GET /creator/dashboard
    
    Admin System
      GET /admin/applications
      POST /admin/applications/:id/approve
      POST /admin/applications/:id/reject
      GET /admin/courses
      POST /admin/courses/:id/publish
    
    Certificates
      GET /enrollments/:id/certificate
      GET /certificates/verify/:hash
      GET /certificates
```

## Role-Based Access Control Matrix

```mermaid
graph LR
    subgraph "RBAC Permission Matrix"
        direction TB
        
        subgraph "LEARNER Permissions"
            L1[Browse Published Courses]
            L2[Enroll in Courses]
            L3[Track Progress]
            L4[Download Certificates]
            L5[Apply to be Creator]
        end
        
        subgraph "CREATOR Permissions"
            C1[All Learner Permissions]
            C2[Create Courses]
            C3[Upload Lessons]
            C4[Manage Own Courses]
            C5[Submit for Review]
            C6[View Analytics]
        end
        
        subgraph "ADMIN Permissions"
            A1[All Creator Permissions]
            A2[Review Creator Applications]
            A3[Approve/Reject Applications]
            A4[Publish/Reject Courses]
            A5[Manage All Users]
            A6[System Settings]
        end
    end
    
    LEARNER_ROLE[LEARNER] --> L1
    LEARNER_ROLE --> L2
    LEARNER_ROLE --> L3
    LEARNER_ROLE --> L4
    LEARNER_ROLE --> L5
    
    CREATOR_ROLE[CREATOR] --> C1
    CREATOR_ROLE --> C2
    CREATOR_ROLE --> C3
    CREATOR_ROLE --> C4
    CREATOR_ROLE --> C5
    CREATOR_ROLE --> C6
    
    ADMIN_ROLE[ADMIN] --> A1
    ADMIN_ROLE --> A2
    ADMIN_ROLE --> A3
    ADMIN_ROLE --> A4
    ADMIN_ROLE --> A5
    ADMIN_ROLE --> A6
    
    classDef learner fill:#e3f2fd
    classDef creator fill:#f3e5f5  
    classDef admin fill:#fff3e0
    
    class LEARNER_ROLE,L1,L2,L3,L4,L5 learner
    class CREATOR_ROLE,C1,C2,C3,C4,C5,C6 creator
    class ADMIN_ROLE,A1,A2,A3,A4,A5,A6 admin
```

## Data Flow & State Management

```mermaid
stateDiagram-v2
    [*] --> Unregistered
    
    state "User Lifecycle" as UserLife {
        Unregistered --> EmailSent : Register
        EmailSent --> EmailVerified : Verify OTP
        EmailVerified --> ProfileComplete : Complete Profile
        ProfileComplete --> ActiveLearner : Auto Role Assignment
        
        ActiveLearner --> CreatorApplicant : Apply for Creator
        CreatorApplicant --> CreatorPending : Submit Application
        CreatorPending --> ActiveCreator : Admin Approves
        CreatorPending --> ActiveLearner : Admin Rejects
        
        ActiveLearner --> AdminRole : Admin Promotion
        ActiveCreator --> AdminRole : Admin Promotion
    }
    
    state "Course Lifecycle" as CourseLife {
        [*] --> Draft : Creator Creates
        Draft --> Draft : Add/Edit Lessons
        Draft --> PendingReview : Submit for Review
        PendingReview --> Published : Admin Approves
        PendingReview --> Draft : Admin Rejects
        Published --> [*] : Course Available
    }
    
    state "Learning Lifecycle" as LearningLife {
        [*] --> Browsing : View Courses
        Browsing --> Enrolled : Enroll in Course
        Enrolled --> InProgress : Start Learning
        InProgress --> InProgress : Complete Lessons
        InProgress --> Completed : Finish All Lessons
        Completed --> Certified : Generate Certificate
    }
```

This comprehensive diagram shows:

1. **System Architecture**: Complete backend flow from frontend to database
2. **Database Schema**: All entities and their relationships
3. **Authentication Flow**: Step-by-step auth process
4. **Course Management**: Different user role workflows
5. **API Endpoints**: Organized by feature area
6. **RBAC Matrix**: Permission system breakdown
7. **State Management**: User, course, and learning lifecycles

The diagrams provide a complete visual representation of your LMS backend architecture and can be used for documentation, onboarding new developers, or system design discussions.
