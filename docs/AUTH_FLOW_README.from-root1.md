# User Authentication Flow - Implementation Guide

This document describes the complete user registration, verification, and profile completion flow implemented in this project.

## Overview

The authentication flow supports both email and phone-based registration with OTP verification, followed by optional profile completion.

## Flow Diagram

```
1. Registration (Email/Phone)
   ↓
2. OTP Verification
   ↓
3a. Auto-login (if profile complete)
   OR
3b. Profile Completion → Login
```

## Components

### 1. RegisterForm (`/src/components/auth/NewRegisterForm.tsx`)

**Route:** `/register`

**Features:**
- Toggle between email and phone input
- Client-side validation using `validator` package
- Calls `POST /api/user/register`
- Redirects to OTP verification on success
- Shows appropriate error messages for different scenarios

**Validations:**
- Email: Valid email format
- Phone: Format `+[country-code][digits]` (e.g., `+911234567890`)

### 2. VerifyOTP (`/src/components/auth/VerifyOTP.tsx`)

**Route:** `/verify-otp`

**Features:**
- Displays masked contact info
- 6-digit numeric OTP input
- Calls `/api/user/verify-email-otp` or `/api/user/verify-phone-otp`
- Auto-login if profile is complete
- Redirects to profile completion if needed
- Resend OTP with 60-second countdown

**Props (via URL params):**
- `verificationType`: "email" | "phone"
- `contactInfo`: Email or phone number
- `userId`: User's UUID
- `requiresProfileCompletion`: boolean

### 3. CompleteProfile (`/src/components/auth/CompleteProfile.tsx`)

**Route:** `/complete-profile`

**Features:**
- Required fields: name, password
- Optional fields: username, fullName, country, state, zip
- Password strength indicator
- Username auto-lowercase
- Calls `POST /api/user/complete-profile`
- Auto-login on success

**Props (via URL params):**
- `userId`: User's UUID

## Services

### Authentication Service (`/src/services/authService.ts`)

Handles all authentication API calls:

- `registerUser(data)` - Register with email or phone
- `verifyEmailOTP(email, otp)` - Verify email OTP
- `verifyPhoneOTP(phoneNumber, otp)` - Verify phone OTP
- `completeProfile(profileData)` - Complete user profile
- `resendOTP(data)` - Resend OTP (calls register again)

**Features:**
- Axios instance with 15s timeout
- Request interceptor: Adds auth token to requests
- Response interceptor: Handles 401 errors (auto-logout)

## Utilities

### Validation (`/src/utils/validation.ts`)

Functions for validating and masking user inputs:

- `validateEmail(email)` - Validates email format
- `validatePhone(phone)` - Validates phone format
- `validatePassword(password)` - Validates password strength
- `validateUsername(username)` - Validates username format
- `validateOTP(otp)` - Validates 6-digit OTP
- `maskEmail(email)` - Masks email for display
- `maskPhone(phone)` - Masks phone for display

### Token Storage (`/src/utils/tokenStorage.ts`)

Three storage strategies (configurable via `NEXT_PUBLIC_TOKEN_STORAGE`):

1. **memory** (Default, Most Secure)
   - Tokens stored in memory
   - Lost on page refresh
   - Best for high-security requirements

2. **localStorage** (Persistent)
   - Tokens persist across sessions
   - XSS vulnerability risk
   - Good for better UX

3. **sessionStorage** (Session Only)
   - Tokens cleared when browser closes
   - Balance between security and UX

**Functions:**
- `setToken(token)` - Store auth token
- `getToken()` - Retrieve auth token
- `clearToken()` - Clear auth token
- `setUser(user)` - Store user data
- `getUser()` - Retrieve user data
- `clearAuth()` - Clear all auth data

## Backend API Endpoints

### POST /api/auth/register

Register a new user or resend OTP.

**Request:**
```json
{
  "email": "user@example.com"
}
// OR
{
  "phoneNumber": "+911234567890"
}
```

**Response (201/200):**
```json
{
  "success": true,
  "message": "Registration successful. Check your email for verification.",
  "userId": "uuid-string",
  "verificationType": "email",
  "contactInfo": "user@example.com",
  "requiresProfileCompletion": true
}
```

**Response (409):**
```json
{
  "success": false,
  "message": "Email already registered. Log in instead."
}
```

### POST /api/auth/verify-email

Verify email OTP.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (With Token):**
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "token": "jwt-token-string",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true,
    "isProfileComplete": true
  }
}
```

**Response (Profile Incomplete):**
```json
{
  "success": true,
  "message": "Email verified successfully. Please complete your profile.",
  "userId": "uuid",
  "requiresProfileCompletion": true
}
```

### POST /api/auth/verify-phone

Verify phone OTP (same structure as email).

**Request:**
```json
{
  "phoneNumber": "+911234567890",
  "otp": "123456"
}
```

### POST /api/auth/complete-profile

Complete user profile after verification.

**Request:**
```json
{
  "userId": "uuid-string",
  "name": "John Doe",
  "password": "securePassword123",
  "username": "johndoe",
  "fullName": "John Michael Doe",
  "country": "India",
  "state": "Punjab",
  "zip": "144001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile completed successfully.",
  "token": "jwt-token-string",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "username": "johndoe",
    "email": "user@example.com",
    "isProfileComplete": true
  }
}
```

## Setup Instructions

### 1. Install Dependencies

The following packages are already installed:
- `validator` - Email validation
- `@types/validator` - TypeScript types
- `axios` - HTTP client

### 2. Environment Variables

Create a `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Token Storage Strategy (memory, localStorage, or sessionStorage)
NEXT_PUBLIC_TOKEN_STORAGE=memory
```

### 3. Backend Setup

Ensure your backend is running at `http://localhost:4000` with the following endpoints:
- POST `/api/auth/register`
- POST `/api/auth/verify-email`
- POST `/api/auth/verify-phone`
- POST `/api/auth/complete-profile`

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/register` to test the flow.

## Testing the Flow

### Test Email Registration

1. Go to `/register`
2. Select "Email" tab
3. Enter email: `test@example.com`
4. Click "Continue"
5. Check backend logs/email for OTP
6. Enter OTP in verification screen
7. If profile incomplete, complete profile
8. Should redirect to dashboard

### Test Phone Registration

1. Go to `/register`
2. Select "Phone" tab
3. Enter phone: `+911234567890`
4. Click "Continue"
5. Check backend logs/SMS for OTP
6. Enter OTP in verification screen
7. If profile incomplete, complete profile
8. Should redirect to dashboard

### Test Resend OTP

1. During OTP verification
2. Wait for countdown (or wait for it to expire)
3. Click "Resend OTP"
4. Should receive new OTP

### Test Error Scenarios

1. **Invalid OTP**: Enter wrong OTP → Should show error
2. **Expired OTP**: Wait for expiry → Should show error
3. **Already Registered**: Register same email twice → Should redirect to login
4. **Username Conflict**: Use taken username → Should show inline error
5. **Network Error**: Disconnect internet → Should show network error

## Error Handling

### User-Friendly Error Messages

- Network errors: "Network error. Please check your connection."
- Invalid OTP: "Invalid or expired OTP. Please try again."
- Not found: "No account found with this information."
- Username taken: "Username is already taken."
- Already registered: "This account is already registered. Please log in instead."

### HTTP Status Codes

- **200/201**: Success
- **400**: Bad request (validation error)
- **401**: Unauthorized (handled by interceptor)
- **404**: Not found
- **409**: Conflict (already exists)
- **500**: Server error

## Security Considerations

### Implemented

- ✅ HTTPS required in production
- ✅ JWT tokens for authentication
- ✅ Token auto-expiry handling
- ✅ XSS protection via memory storage option
- ✅ Input validation and sanitization
- ✅ OTP rate limiting (backend)
- ✅ Password minimum 8 characters
- ✅ No tokens in console logs

### Recommended (Production)

- [ ] Implement CSRF protection
- [ ] Add rate limiting on frontend
- [ ] Add captcha for registration
- [ ] Implement refresh token flow
- [ ] Add 2FA option
- [ ] Log security events

## File Structure

```
src/
├── app/
│   ├── register/
│   │   └── page.tsx
│   ├── verify-otp/
│   │   └── page.tsx
│   └── complete-profile/
│       └── page.tsx
├── components/
│   └── auth/
│       ├── NewRegisterForm.tsx
│       ├── VerifyOTP.tsx
│       └── CompleteProfile.tsx
├── services/
│   └── authService.ts
└── utils/
    ├── validation.ts
    └── tokenStorage.ts
```

## Troubleshooting

### OTP Not Received

- Check backend logs for errors
- Verify email/SMS service is configured
- Check spam folder for email OTPs

### 401 Errors

- Check if backend is running
- Verify API_BASE_URL is correct
- Check if token is being stored

### Redirect Not Working

- Check browser console for errors
- Verify Next.js routing is configured
- Check if pages exist at specified routes

### Token Storage Issues

- Check NEXT_PUBLIC_TOKEN_STORAGE env variable
- Verify storage strategy is supported
- Check browser storage in DevTools

## Future Enhancements

1. **Social Authentication**
   - Google OAuth
   - Facebook Login
   - GitHub OAuth

2. **Email Link Verification**
   - Alternative to OTP
   - Magic link authentication

3. **Remember Me**
   - Extended token expiry
   - Persistent login option

4. **Profile Photo**
   - Avatar upload during profile completion
   - Cloudinary integration

5. **Phone Verification**
   - SMS OTP via Twilio/Fast2SMS
   - WhatsApp OTP option

## Support

For issues or questions:
1. Check this documentation
2. Review backend API documentation
3. Check browser console for errors
4. Review backend logs

## License

[Your License Here]
