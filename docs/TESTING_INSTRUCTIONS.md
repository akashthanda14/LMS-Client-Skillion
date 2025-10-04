# Testing the Secure Authentication Flow

This document provides instructions for testing the improved authentication flow with secure profile completion.

## Prerequisites

- Node.js v14+ installed
- npm or yarn installed
- LMS backend server running locally

## Setup

1. Install the required dependencies:

```bash
npm install
```

2. Ensure the backend server is running:

```bash
npm run dev
```

## Running the Test Script

We've created an automated test script that verifies the entire authentication flow:

```bash
npm run test:auth
```

This script will:

1. Register a test user with email
2. Prompt you to enter the OTP received in your email
3. Complete the profile using the secure token
4. Test authenticated access
5. Test token refresh functionality

## Manual Testing Steps

If you prefer to test the flow manually, follow these steps:

### 1. Register a new user

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Response:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "verificationType": "email",
  "contactInfo": "test@example.com"
}
```

### 2. Verify email with OTP

```bash
curl -X POST http://localhost:4000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

Response (for new user):
```json
{
  "success": true,
  "message": "Email verified successfully. Please complete your profile.",
  "requiresProfileCompletion": true,
  "profileToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Complete profile

```bash
curl -X POST http://localhost:4000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "profileToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "name": "Test User",
    "password": "SecurePass123",
    "username": "testuser"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "test@example.com",
    "name": "Test User",
    "username": "testuser"
  }
}
```

### 4. Test authenticated access

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "test@example.com",
    "name": "Test User",
    "username": "testuser"
  }
}
```

### 5. Test token refresh

```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Verifying Security Improvements

To verify that the security improvements are working:

1. **Try to complete a profile without a valid profile token**:
   - Should receive a 400 error with "Invalid profile completion token" message

2. **Try to use an expired profile token**:
   - Should receive a 400 error with "Profile completion token has expired" message

3. **Try to access a protected route without a valid JWT**:
   - Should receive a 401 error

4. **Try to reuse a profile token after completion**:
   - Should receive a 400 error as tokens are single-use

## Common Issues

- **OTP Verification Fails**: Check that you're using the correct OTP and it hasn't expired
- **Token Issues**: Make sure you're using the entire token string without truncation
- **Authorization Header**: Ensure the format is exactly `Bearer <token>` with a space after "Bearer"
