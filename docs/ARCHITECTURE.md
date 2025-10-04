# User Modules - Architecture Diagrams

## 📐 Folder Structure Visualization

```
dolchicoserver/
│
├── user_modules/                    ← NEW: Isolated auth module
│   │
│   ├── controllers/                 ← Request handlers
│   │   ├── authController.js       → Password reset/recovery
│   │   ├── userController.js       → Registration/login
│   │   ├── adminController.js      → Admin auth
│   │   └── profileController.js    → Email/phone change
│   │
│   ├── services/                    ← Business logic
│   │   ├── userService.js          → User DB operations
│   │   └── otpService.js           → OTP management
│   │
│   ├── routes/                      ← API endpoints
│   │   ├── userRoutes.js           → User routes
│   │   └── adminRoutes.js          → Admin routes
│   │
│   ├── index.js                     ← Central exports
│   ├── README.md                    ← Full documentation
│   ├── MIGRATION_GUIDE.md          ← Integration guide
│   ├── INTEGRATION_EXAMPLE.js      ← Code examples
│   ├── PROJECT_SUMMARY.md          ← Project overview
│   ├── QUICK_REFERENCE.md          ← Cheat sheet
│   └── ARCHITECTURE.md             ← This file
│
├── services/                        ← Shared services (existing)
│   ├── mailService.js              → Used by user_modules
│   ├── smsService.js               → Used by user_modules
│   └── tokenService.js             → Used by user_modules
│
├── middleware/                      ← Shared middleware (existing)
│   └── authMiddleware.js           → Used by user_modules
│
├── lib/
│   └── prisma.js                    → Used by user_modules
│
└── server.js                        ← Main server file
    └── Imports user_modules routes
```

## 🔄 Data Flow Diagrams

### User Registration Flow (Email)
```
┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌──────────┐
│         │     │            │     │             │     │          │
│ Client  │────>│ userRoutes │────>│userController│────>│userService│
│         │     │            │     │             │     │          │
└─────────┘     └────────────┘     └─────────────┘     └──────────┘
     │                                     │                  │
     │                                     v                  v
     │                              ┌──────────┐      ┌──────────┐
     │                              │otpService│      │ Database │
     │                              └──────────┘      └──────────┘
     │                                     │                  
     │                                     v                  
     │                              ┌───────────┐            
     │<─────────────────────────────│mailService│            
     │      (OTP Email)             └───────────┘            
     │                                                        
     v
┌─────────┐
│  User   │
│ Verifies│
│   OTP   │
└─────────┘
```

### Login Flow
```
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌───────────┐
│ Client  │────>│ userRoutes │────>│userController│────>│userService│
│         │     │            │     │              │     │           │
│         │     │   POST     │     │  loginUser() │     │findUserBy*│
└─────────┘     │   /login   │     │              │     │           │
     ▲          └────────────┘     └──────────────┘     └───────────┘
     │                                     │                    │
     │                                     v                    v
     │                              ┌─────────────┐      ┌──────────┐
     │                              │   bcrypt    │      │ Database │
     │                              │ verify pwd  │      │          │
     │                              └─────────────┘      └──────────┘
     │                                     │
     │                                     v
     │                              ┌─────────────┐
     │<─────────────────────────────│     JWT     │
     │      (JWT Token)             │   sign()    │
     │                              └─────────────┘
     │
     v
┌─────────┐
│ Client  │
│  with   │
│  Token  │
└─────────┘
```

### Password Reset Flow
```
Step 1: Request Reset
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌───────────┐
│ Client  │────>│ userRoutes │────>│authController│────>│userService│
│         │     │            │     │              │     │           │
│         │     │   POST     │     │ forgotPwd()  │     │ findUser  │
└─────────┘     │/forgot-pwd │     │              │     │           │
                └────────────┘     └──────────────┘     └───────────┘
                                          │                    │
                                          v                    v
                                   ┌──────────┐         ┌──────────┐
                                   │otpService│         │ Database │
                                   │storeOTP()│         │          │
                                   └──────────┘         └──────────┘
                                          │
                                          v
                                   ┌───────────┐
                                   │mail/sms   │
                                   │ Service   │
                                   └───────────┘

Step 2: Reset Password
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌───────────┐
│ Client  │────>│ userRoutes │────>│authController│────>│otpService │
│  +OTP   │     │            │     │              │     │           │
│         │     │   POST     │     │ resetPwd()   │     │verifyOTP()│
└─────────┘     │/reset-pwd  │     │              │     │           │
     ▲          └────────────┘     └──────────────┘     └───────────┘
     │                                     │                    │
     │                                     v                    v
     │                              ┌──────────┐         ┌──────────┐
     │<─────────────────────────────│  bcrypt  │         │ Database │
     │      (JWT Token)             │  hash()  │         │  update  │
     │                              └──────────┘         └──────────┘
```

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                          │
│                      (Express Server)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          v                   v                   v
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│                  │ │                  │ │                  │
│   userRoutes     │ │   adminRoutes    │ │  Other Routes    │
│ (user_modules)   │ │ (user_modules)   │ │   (existing)     │
│                  │ │                  │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
          │                   │
          │                   │
          v                   v
┌──────────────────────────────────────────┐
│           Controllers Layer              │
│  ┌────────┐ ┌────────┐ ┌──────────┐    │
│  │ auth   │ │ user   │ │ profile  │    │
│  │Ctrl    │ │Ctrl    │ │Ctrl      │    │
│  └────────┘ └────────┘ └──────────┘    │
└──────────────────────────────────────────┘
                    │
                    │
                    v
┌──────────────────────────────────────────┐
│           Services Layer                 │
│  ┌──────────┐ ┌──────────┐              │
│  │ user     │ │ otp      │              │
│  │Service   │ │Service   │              │
│  └──────────┘ └──────────┘              │
└──────────────────────────────────────────┘
          │              │
          │              │
          v              v
┌──────────────┐ ┌──────────────┐
│   Database   │ │Shared Services│
│   (Prisma)   │ │ mail/sms/etc │
└──────────────┘ └──────────────┘
```

## 🔐 Authentication Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Client Application                        │
│                  (React/Vue/Mobile App)                       │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS Request
                            │
                            v
┌──────────────────────────────────────────────────────────────┐
│                      Express Server                           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Middleware Stack                          │ │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │ │
│  │  │  CORS  │→ │  JSON  │→ │  Rate  │→ │  Auth  │     │ │
│  │  │        │  │ Parser │  │ Limit  │  │Middleware│    │ │
│  │  └────────┘  └────────┘  └────────┘  └────────┘     │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                  │
│                            v                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              user_modules Routes                       │ │
│  │  ┌──────────────┐           ┌──────────────┐         │ │
│  │  │ userRoutes   │           │ adminRoutes  │         │ │
│  │  │              │           │              │         │ │
│  │  │ Public &     │           │ Admin only   │         │ │
│  │  │ Protected    │           │              │         │ │
│  │  └──────────────┘           └──────────────┘         │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                  │
│                            v                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Controllers                               │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐            │ │
│  │  │ auth │  │ user │  │profile│  │admin │            │ │
│  │  └──────┘  └──────┘  └──────┘  └──────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                  │
│                            v                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Services                                  │ │
│  │  ┌─────────────┐  ┌─────────────┐                    │ │
│  │  │ userService │  │ otpService  │                    │ │
│  │  └─────────────┘  └─────────────┘                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                  │
│                            v                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          External Services (Shared)                    │ │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │ │
│  │  │  Mail  │  │  SMS   │  │ Token  │  │ Other  │     │ │
│  │  │Service │  │Service │  │Service │  │Services│     │ │
│  │  └────────┘  └────────┘  └────────┘  └────────┘     │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                       │
│                        (via Prisma)                          │
└──────────────────────────────────────────────────────────────┘
```

## 📊 Module Dependencies

```
user_modules/
│
├── controllers/
│   ├── authController.js
│   │   ├── → services/userService.js
│   │   ├── → services/smsService.js (shared)
│   │   └── → services/mailService.js (shared)
│   │
│   ├── userController.js
│   │   ├── → services/userService.js
│   │   ├── → services/otpService.js
│   │   ├── → services/smsService.js (shared)
│   │   ├── → services/mailService.js (shared)
│   │   └── → services/tokenService.js (shared)
│   │
│   ├── profileController.js
│   │   ├── → services/userService.js
│   │   ├── → services/otpService.js
│   │   ├── → services/mailService.js (shared)
│   │   └── → services/smsService.js (shared)
│   │
│   └── adminController.js
│       └── → services/userService.js
│
├── services/
│   ├── userService.js
│   │   └── → lib/prisma.js (shared)
│   │
│   └── otpService.js
│       └── → lib/prisma.js (shared)
│
└── routes/
    ├── userRoutes.js
    │   ├── → controllers/*
    │   └── → middleware/authMiddleware.js (shared)
    │
    └── adminRoutes.js
        └── → controllers/adminController.js
```

## 🎯 Request/Response Flow

### Successful Registration Flow
```
Client                  Server                  Database
  │                       │                        │
  │──POST /register────>│                        │
  │  { email }            │                        │
  │                       │──createUser()───────>│
  │                       │                        │
  │                       │<─────user created─────│
  │                       │                        │
  │                       │──storeEmailOTP()────>│
  │                       │                        │
  │                       │<─────OTP stored───────│
  │                       │                        │
  │                       │──sendEmail()          │
  │                       │  (external service)   │
  │                       │                        │
  │<─200 OK─────────────│                        │
  │  { success: true,     │                        │
  │    userId: 123 }      │                        │
  │                       │                        │
```

### Protected Route Flow
```
Client                  Server                  Database
  │                       │                        │
  │──POST /request──────>│                        │
  │  email-change         │                        │
  │  + JWT token          │                        │
  │                       │                        │
  │                   ┌──────────┐                │
  │                   │  Auth    │                │
  │                   │Middleware│                │
  │                   │          │                │
  │                   │ Verify   │                │
  │                   │  JWT     │                │
  │                   └──────────┘                │
  │                       │                        │
  │                       │──findUserById()─────>│
  │                       │                        │
  │                       │<─────user data────────│
  │                       │                        │
  │                       │──storeEmailOTP()────>│
  │                       │                        │
  │                       │<─────OTP stored───────│
  │                       │                        │
  │<─200 OK─────────────│                        │
  │  { success: true }    │                        │
  │                       │                        │
```

## 🗂️ Database Schema (Relevant Tables)

```sql
┌──────────────────────────┐
│         User             │
├──────────────────────────┤
│ id (PK)                  │
│ email                    │
│ phoneNumber              │
│ password (hashed)        │
│ name                     │
│ emailVerified            │
│ phoneVerified            │
│ isProfileComplete        │
│ role                     │
│ resetToken               │
│ pendingEmail             │
│ createdAt                │
│ updatedAt                │
└──────────────────────────┘
           │
           │ 1:N
           │
     ┌─────┴──────┐
     │            │
     v            v
┌──────────┐  ┌──────────┐
│ EmailOTP │  │ PhoneOTP │
├──────────┤  ├──────────┤
│ id (PK)  │  │ id (PK)  │
│ userId   │  │ userId   │
│ otp      │  │ otp      │
│ type     │  │ type     │
│ expiresAt│  │ expiresAt│
│ isUsed   │  │ isUsed   │
│ attempts │  │ attempts │
└──────────┘  └──────────┘
```

## 🔄 OTP Lifecycle

```
┌──────────────┐
│  OTP Created │
│  (10 min TTL)│
└──────┬───────┘
       │
       v
┌──────────────┐     Max 3 attempts
│ OTP Pending  │◄────────┐
└──────┬───────┘         │
       │                 │
       │ Verify          │
       │ attempt         │
       v                 │
┌──────────────┐         │
│   Invalid?   │─────Yes──┘
└──────┬───────┘
       │ No
       v
┌──────────────┐
│  OTP Valid   │
│ Mark as Used │
└──────┬───────┘
       │
       v
┌──────────────┐
│ OTP Deleted  │
└──────────────┘
```

## 📦 Export Structure

```
user_modules/index.js
│
├── Routes
│   ├── userRoutes
│   └── adminRoutes
│
├── Controllers
│   ├── registerUser
│   ├── loginUser
│   ├── forgotPassword
│   ├── resetPassword
│   ├── requestEmailChange
│   ├── verifyEmailChange
│   ├── requestPhoneChange
│   ├── verifyPhoneChange
│   └── adminLogin
│
└── Services
    ├── createUser
    ├── findUserByEmail
    ├── findUserByPhone
    ├── updateProfile
    ├── storeEmailOTP
    ├── verifyEmailOtpService
    ├── storePhoneOTP
    └── verifyPhoneOtpService
```

---

**This architecture ensures:**
- ✅ Clean separation of concerns
- ✅ Easy to test and maintain
- ✅ Scalable and extensible
- ✅ Clear data flow
- ✅ Proper error handling
- ✅ Security best practices
