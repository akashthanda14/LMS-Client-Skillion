# Database Schema Documentation

## 📊 Overview

This document describes the database schema used by the `user_modules` authentication system. The schema is designed to work with PostgreSQL via Prisma ORM.

---

## 🗄️ Tables

### 1. User Table

The main user table storing user account information.

```prisma
model User {
  id                  String    @id @default(uuid()) @db.Uuid
  email               String?   @unique
  phoneNumber         String?   @unique
  password            String?
  name                String?
  username            String?   @unique
  fullName            String?
  role                String    @default("USER")
  emailVerified       Boolean   @default(false)
  phoneVerified       Boolean   @default(false)
  isProfileComplete   Boolean   @default(false)
  isActive            Boolean   @default(true)
  
  // Address fields
  country             String?
  state               String?
  zip                 String?
  
  // Personal information
  dob                 DateTime?
  
  // Password reset tokens
  resetToken          String?
  resetTokenExpiry    DateTime?
  
  // Email change workflow
  pendingEmail        String?
  pendingEmailOtp     String?
  pendingEmailExpiry  DateTime?
  
  // Timestamps
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  lastLoginAt         DateTime?
  
  // Relations
  emailOTPs           EmailOTP[]
  phoneOTPs           PhoneOTP[]
  emailVerificationTokens EmailVerificationToken[]
  
  @@index([email])
  @@index([phoneNumber])
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (UUID) | ✅ | Primary key, auto-generated UUID |
| `email` | String | ❌ | User's email (unique) |
| `phoneNumber` | String | ❌ | User's phone number (unique) |
| `password` | String | ❌ | Hashed password (bcrypt) |
| `name` | String | ❌ | User's display name |
| `username` | String | ❌ | Unique username |
| `fullName` | String | ❌ | User's full name |
| `role` | String | ✅ | User role (USER/ADMIN) |
| `emailVerified` | Boolean | ✅ | Email verification status |
| `phoneVerified` | Boolean | ✅ | Phone verification status |
| `isProfileComplete` | Boolean | ✅ | Profile completion status |
| `isActive` | Boolean | ✅ | Account active status |
| `country` | String | ❌ | User's country |
| `state` | String | ❌ | User's state |
| `zip` | String | ❌ | User's zip/postal code |
| `dob` | DateTime | ❌ | Date of birth |
| `resetToken` | String | ❌ | Password reset/change token |
| `resetTokenExpiry` | DateTime | ❌ | Token expiry time |
| `pendingEmail` | String | ❌ | New email pending verification |
| `pendingEmailOtp` | String | ❌ | OTP for email change |
| `pendingEmailExpiry` | DateTime | ❌ | Email OTP expiry |
| `createdAt` | DateTime | ✅ | Account creation timestamp |
| `updatedAt` | DateTime | ✅ | Last update timestamp |
| `lastLoginAt` | DateTime | ❌ | Last login timestamp |

#### Constraints & Indexes

```sql
-- Unique constraints
UNIQUE (email)
UNIQUE (phoneNumber)
UNIQUE (username)

-- Indexes for performance
INDEX idx_email ON User(email)
INDEX idx_phoneNumber ON User(phoneNumber)

-- Check constraints (application level)
- Email must be valid format
- Phone must be valid format
- Password must be hashed (never plain text)
```

---

### 2. EmailOTP Table

Stores email OTP codes for various operations.

```prisma
model EmailOTP {
  id          Int       @id @default(autoincrement())
  userId      Int
  otp         String
  type        String    // 'SIGNUP', 'SIGNIN', 'PASSWORD_RESET', 'EMAIL_CHANGE'
  expiresAt   DateTime
  isUsed      Boolean   @default(false)
  attempts    Int       @default(0)
  maxAttempts Int       @default(3)
  createdAt   DateTime  @default(now())
  
  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([otp])
  @@index([expiresAt])
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Int | ✅ | Primary key, auto-increment |
| `userId` | Int | ✅ | Foreign key to User |
| `otp` | String | ✅ | 6-digit OTP code |
| `type` | String | ✅ | OTP purpose/type |
| `expiresAt` | DateTime | ✅ | Expiration timestamp (10 min) |
| `isUsed` | Boolean | ✅ | Whether OTP has been used |
| `attempts` | Int | ✅ | Number of verification attempts |
| `maxAttempts` | Int | ✅ | Maximum allowed attempts (3) |
| `createdAt` | DateTime | ✅ | OTP creation timestamp |

#### OTP Types

```javascript
const OTP_TYPES = {
  SIGNUP: 'SIGNUP',           // Email registration
  SIGNIN: 'SIGNIN',           // Email login (if implemented)
  PASSWORD_RESET: 'PASSWORD_RESET',  // Password reset
  EMAIL_CHANGE: 'EMAIL_CHANGE'       // Email change verification
};
```

#### Lifecycle

```
Created → Pending (10 min) → Verified/Expired → Deleted
```

---

### 3. PhoneOTP Table

Stores phone OTP codes for various operations.

```prisma
model PhoneOTP {
  id          Int       @id @default(autoincrement())
  userId      Int
  otp         String
  type        String    // 'SIGNUP', 'SIGNIN', 'PASSWORD_RESET', 'PHONE_CHANGE'
  expiresAt   DateTime
  isUsed      Boolean   @default(false)
  attempts    Int       @default(0)
  maxAttempts Int       @default(3)
  createdAt   DateTime  @default(now())
  
  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([otp])
  @@index([expiresAt])
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Int | ✅ | Primary key, auto-increment |
| `userId` | Int | ✅ | Foreign key to User |
| `otp` | String | ✅ | 6-digit OTP code |
| `type` | String | ✅ | OTP purpose/type |
| `expiresAt` | DateTime | ✅ | Expiration timestamp (10 min) |
| `isUsed` | Boolean | ✅ | Whether OTP has been used |
| `attempts` | Int | ✅ | Number of verification attempts |
| `maxAttempts` | Int | ✅ | Maximum allowed attempts (3) |
| `createdAt` | DateTime | ✅ | OTP creation timestamp |

#### OTP Types

```javascript
const OTP_TYPES = {
  SIGNUP: 'SIGNUP',           // Phone registration
  SIGNIN: 'SIGNIN',           // Phone login (if implemented)
  PASSWORD_RESET: 'PASSWORD_RESET',  // Password reset
  PHONE_CHANGE: 'PHONE_CHANGE'       // Phone change verification
};
```

---

### 4. EmailVerificationToken Table

Stores email verification tokens for registration via link.

```prisma
model EmailVerificationToken {
  id        Int       @id @default(autoincrement())
  token     String    @unique
  userId    Int
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  
  // Relations
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Int | ✅ | Primary key, auto-increment |
| `token` | String | ✅ | SHA-256 hashed token (unique) |
| `userId` | Int | ✅ | Foreign key to User |
| `expiresAt` | DateTime | ✅ | Token expiration (24 hours) |
| `usedAt` | DateTime | ❌ | Timestamp when token was used |
| `createdAt` | DateTime | ✅ | Token creation timestamp |

#### Token Generation

```javascript
// Raw token (sent to user)
const rawToken = crypto.randomBytes(32).toString('base64url');

// Stored token (hashed)
const hashedToken = crypto.createHash('sha256')
  .update(rawToken, 'utf8')
  .digest('hex');
```

---

## 🔗 Entity Relationships

```
User (1) ──────< (Many) EmailOTP
User (1) ──────< (Many) PhoneOTP
User (1) ──────< (Many) EmailVerificationToken
```

### Relationship Diagram

```
┌──────────────────────────┐
│         User             │
│  (Primary Entity)        │
├──────────────────────────┤
│ id (PK)                  │
│ email                    │
│ phoneNumber              │
│ password                 │
│ ...                      │
└──────────┬───────────────┘
           │
           │ Has Many
           │
     ┌─────┴──────┬──────────────────┬────────────────────┐
     │            │                  │                    │
     v            v                  v                    v
┌─────────┐  ┌─────────┐  ┌──────────────────┐  ┌────────────┐
│EmailOTP │  │PhoneOTP │  │EmailVerification │  │  Other     │
│         │  │         │  │Token             │  │  Relations │
├─────────┤  ├─────────┤  ├──────────────────┤  └────────────┘
│userId FK│  │userId FK│  │userId FK         │
│otp      │  │otp      │  │token             │
│type     │  │type     │  │expiresAt         │
│expiresAt│  │expiresAt│  │usedAt            │
└─────────┘  └─────────┘  └──────────────────┘
```

---

## 📝 Prisma Schema File

Complete Prisma schema for the authentication system:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Model
model User {
  id                  Int       @id @default(autoincrement())
  email               String?   @unique
  phoneNumber         String?   @unique
  password            String?
  name                String?
  username            String?   @unique
  fullName            String?
  role                String    @default("USER")
  emailVerified       Boolean   @default(false)
  phoneVerified       Boolean   @default(false)
  isProfileComplete   Boolean   @default(false)
  isActive            Boolean   @default(true)
  country             String?
  state               String?
  zip                 String?
  dob                 DateTime?
  resetToken          String?
  resetTokenExpiry    DateTime?
  pendingEmail        String?
  pendingEmailOtp     String?
  pendingEmailExpiry  DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  lastLoginAt         DateTime?
  
  emailOTPs                 EmailOTP[]
  phoneOTPs                 PhoneOTP[]
  emailVerificationTokens   EmailVerificationToken[]
  
  @@index([email])
  @@index([phoneNumber])
}

// Email OTP Model
model EmailOTP {
  id          Int       @id @default(autoincrement())
  userId      Int
  otp         String
  type        String
  expiresAt   DateTime
  isUsed      Boolean   @default(false)
  attempts    Int       @default(0)
  maxAttempts Int       @default(3)
  createdAt   DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([otp])
  @@index([expiresAt])
}

// Phone OTP Model
model PhoneOTP {
  id          Int       @id @default(autoincrement())
  userId      Int
  otp         String
  type        String
  expiresAt   DateTime
  isUsed      Boolean   @default(false)
  attempts    Int       @default(0)
  maxAttempts Int       @default(3)
  createdAt   DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([otp])
  @@index([expiresAt])
}

// Email Verification Token Model
model EmailVerificationToken {
  id        Int       @id @default(autoincrement())
  token     String    @unique
  userId    Int
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
}
```

---

## 🔧 Database Operations

### Common Queries

#### 1. Create User

```javascript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    emailVerified: false,
    phoneVerified: false,
    isProfileComplete: false,
    role: 'USER'
  }
});
```

#### 2. Find User by Email

```javascript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});
```

#### 3. Store Email OTP

```javascript
const emailOTP = await prisma.emailOTP.create({
  data: {
    userId: user.id,
    otp: '123456',
    type: 'SIGNUP',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    isUsed: false,
    attempts: 0,
    maxAttempts: 3
  }
});
```

#### 4. Verify OTP

```javascript
const otpRecord = await prisma.emailOTP.findFirst({
  where: {
    userId: user.id,
    otp: '123456',
    isUsed: false,
    expiresAt: { gt: new Date() }
  }
});

if (otpRecord) {
  // Mark as used
  await prisma.emailOTP.update({
    where: { id: otpRecord.id },
    data: { isUsed: true }
  });
}
```

#### 5. Update User Profile

```javascript
const updatedUser = await prisma.user.update({
  where: { id: user.id },
  data: {
    name: 'John Doe',
    password: hashedPassword,
    isProfileComplete: true,
    emailVerified: true
  }
});
```

#### 6. Clean Up Expired OTPs

```javascript
// Delete expired email OTPs
await prisma.emailOTP.deleteMany({
  where: {
    expiresAt: { lt: new Date() }
  }
});

// Delete expired phone OTPs
await prisma.phoneOTP.deleteMany({
  where: {
    expiresAt: { lt: new Date() }
  }
});
```

---

## 🔒 Security Considerations

### 1. Password Storage

```javascript
// NEVER store plain text passwords
// Always hash with bcrypt
const hashedPassword = await bcrypt.hash(password, 12);

// Store hashed password
await prisma.user.update({
  where: { id: userId },
  data: { password: hashedPassword }
});
```

### 2. OTP Storage

```javascript
// OTPs are stored as plain text (they're short-lived)
// But with strict expiration and attempt limits
const otp = Math.floor(100000 + Math.random() * 900000).toString();

await prisma.emailOTP.create({
  data: {
    userId,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    maxAttempts: 3
  }
});
```

### 3. Token Storage

```javascript
// Tokens are hashed before storage
const rawToken = crypto.randomBytes(32).toString('base64url');
const hashedToken = crypto.createHash('sha256')
  .update(rawToken, 'utf8')
  .digest('hex');

await prisma.emailVerificationToken.create({
  data: {
    token: hashedToken, // Store hashed
    userId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
});

// Send raw token to user
sendEmail(userEmail, rawToken);
```

### 4. Cascade Deletes

```sql
-- When a user is deleted, all related records are automatically deleted
-- This is handled by: onDelete: Cascade

DELETE FROM User WHERE id = ?;
-- Automatically deletes:
-- - All EmailOTP records
-- - All PhoneOTP records
-- - All EmailVerificationToken records
```

---

## 📊 Indexes & Performance

### Indexes Created

```sql
-- User table indexes
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_phoneNumber ON User(phoneNumber);

-- EmailOTP indexes
CREATE INDEX idx_emailotp_userId ON EmailOTP(userId);
CREATE INDEX idx_emailotp_otp ON EmailOTP(otp);
CREATE INDEX idx_emailotp_expiresAt ON EmailOTP(expiresAt);

-- PhoneOTP indexes
CREATE INDEX idx_phoneotp_userId ON PhoneOTP(userId);
CREATE INDEX idx_phoneotp_otp ON PhoneOTP(otp);
CREATE INDEX idx_phoneotp_expiresAt ON PhoneOTP(expiresAt);

-- EmailVerificationToken indexes
CREATE INDEX idx_token_userId ON EmailVerificationToken(userId);
CREATE INDEX idx_token_token ON EmailVerificationToken(token);
```

### Performance Optimization

1. **Email/Phone Lookups**: Indexed for fast queries
2. **OTP Verification**: Indexed on userId and otp for quick verification
3. **Expiration Checks**: Indexed on expiresAt for efficient cleanup
4. **Token Verification**: Unique index on token for instant lookup

---

## 🔄 Data Lifecycle

### User Registration Lifecycle

```
1. User created (emailVerified: false, isProfileComplete: false)
   ↓
2. EmailOTP created (expiresAt: now + 10 min)
   ↓
3. User verifies OTP (emailVerified: true)
   ↓
4. EmailOTP deleted
   ↓
5. User completes profile (isProfileComplete: true)
   ↓
6. User is active and can login
```

### OTP Lifecycle

```
Created → Pending (10 min) → Verified → Deleted
                  ↓
              Expired → Deleted (cleanup job)
```

### Token Lifecycle

```
Created → Pending (24 hours) → Used → Marked (usedAt set)
                    ↓
                Expired → Invalid (but not deleted)
```

---

## 🛠️ Migrations

### Running Migrations

```bash
# Generate migration
npx prisma migrate dev --name add_auth_tables

# Apply migration
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Initial Migration

```sql
-- Create User table
CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE,
  "phoneNumber" VARCHAR(50) UNIQUE,
  "password" VARCHAR(255),
  "name" VARCHAR(255),
  "role" VARCHAR(50) DEFAULT 'USER',
  "emailVerified" BOOLEAN DEFAULT false,
  "phoneVerified" BOOLEAN DEFAULT false,
  "isProfileComplete" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create EmailOTP table
CREATE TABLE "EmailOTP" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "otp" VARCHAR(6) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "isUsed" BOOLEAN DEFAULT false,
  "attempts" INTEGER DEFAULT 0,
  "maxAttempts" INTEGER DEFAULT 3,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create PhoneOTP table
CREATE TABLE "PhoneOTP" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "otp" VARCHAR(6) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "isUsed" BOOLEAN DEFAULT false,
  "attempts" INTEGER DEFAULT 0,
  "maxAttempts" INTEGER DEFAULT 3,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create EmailVerificationToken table
CREATE TABLE "EmailVerificationToken" (
  "id" SERIAL PRIMARY KEY,
  "token" VARCHAR(255) UNIQUE NOT NULL,
  "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMP NOT NULL,
  "usedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

---

## 📈 Monitoring & Maintenance

### Recommended Cleanup Jobs

```javascript
// Run daily: Clean up expired OTPs
async function cleanupExpiredOTPs() {
  const deleted = await prisma.$transaction([
    prisma.emailOTP.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    }),
    prisma.phoneOTP.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    })
  ]);
  console.log(`Cleaned up ${deleted[0].count + deleted[1].count} expired OTPs`);
}

// Run weekly: Clean up old verification tokens
async function cleanupOldTokens() {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const deleted = await prisma.emailVerificationToken.deleteMany({
    where: { createdAt: { lt: oneMonthAgo } }
  });
  console.log(`Cleaned up ${deleted.count} old tokens`);
}
```

### Monitoring Queries

```javascript
// Count active users
const activeUsers = await prisma.user.count({
  where: { isActive: true }
});

// Count verified users
const verifiedUsers = await prisma.user.count({
  where: {
    OR: [
      { emailVerified: true },
      { phoneVerified: true }
    ]
  }
});

// Count pending OTPs
const pendingOTPs = await prisma.emailOTP.count({
  where: {
    isUsed: false,
    expiresAt: { gt: new Date() }
  }
});
```

---

## 🎯 Best Practices

1. **Always use transactions** for multi-step operations
2. **Clean up expired OTPs** regularly
3. **Index frequently queried fields**
4. **Use cascade deletes** for related records
5. **Hash sensitive data** (passwords, tokens)
6. **Set appropriate expiration times**
7. **Limit OTP attempts** (max 3)
8. **Monitor database performance**
9. **Backup regularly**
10. **Use connection pooling** for better performance

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Database**: PostgreSQL  
**ORM**: Prisma
