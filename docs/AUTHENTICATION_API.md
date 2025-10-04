# Authentication & User Management API

Complete API documentation for authentication, user registration, and user management endpoints.

## 📑 Table of Contents

- [Base URL](#base-url)
- [Authentication Flow](#authentication-flow)
- [User Registration](#user-registration)
- [User Login](#user-login)
- [Password Management](#password-management)
- [Profile Management](#profile-management)
- [Admin Authentication](#admin-authentication)
- [Error Codes](#error-codes)
- [Testing](#testing)

---

## Base URL

```
http://localhost:4000/api
```

---

## Authentication Flow

```
┌─────────────┐
│   Register  │ → Email/Phone + Password → OTP Verification
└─────────────┘
       ↓
┌─────────────┐
│ Verify OTP  │ → 6-digit Code → Account Activated
└─────────────┘
       ↓
┌─────────────┐
│    Login    │ → Email/Phone + Password → JWT Token
└─────────────┘
       ↓
┌─────────────┐
│ Authenticated│ → Use Token for Protected Routes
└─────────────┘
```

---

## User Registration

Note: The server implements a two-step registration flow: first call POST /api/auth/register with either `email` or `phoneNumber` to create the account and trigger an OTP/email verification. After verification, you'll receive a secure `profileToken` to complete the profile (name/password) using `POST /api/auth/complete-profile` which returns a JWT. For details on profile completion, see [Profile Completion](./PROFILE_COMPLETION.md).

### 1. Register (email or phone)

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account using an email or a phone number. The server will send either an email verification link/OTP or an SMS OTP depending on which identifier you provide.

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body (email):**
```json
{
  "email": "john@example.com"
}
```

**Request Body (phone):**
```json
{
  "phoneNumber": "+919876543210"
}
```

**Notes / Validations:**
- The controller expects the phone field to be named `phoneNumber` (not `phone`).
- This endpoint only creates the account and sends verification. Name/password are set in `POST /api/auth/complete-profile` after verification.

**Success Responses:**
- If an existing unverified user is provided, the endpoint will resend OTP/email and return 200 with `userId` and `verificationType`.
- If new user created, returns 201 with `userId`, `verificationType`, and `contactInfo` (email or phoneNumber).

Example success (new user, 201):
```json
{
  "success": true,
  "message": "Registration successful. Check your email for verification.",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "verificationType": "email",
  "contactInfo": "john@example.com",
  "requiresProfileCompletion": true
}
```

Example success (resend, 200):
```json
{
  "success": true,
  "message": "OTP resent to your phone.",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "verificationType": "phone",
  "requiresProfileCompletion": false
}
```

**Errors:**
- 400: Missing identifier
- 409: If email/phone is already registered and verified


---


### Verify Email OTP

**Endpoint:** `POST /api/auth/verify-email`

**Description:** Verify email with the OTP/link sent during registration.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200 OK):**
- If the user already completed profile, response includes a JWT and the user object.
- If the user still needs to complete profile, response returns a secure `profileToken` and `requiresProfileCompletion: true`.

Example (profile complete):
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "token": "<jwt>",
  "user": { "id": "...", "email": "john@example.com", "isProfileComplete": true }
}
```

Example (profile incomplete):
```json
{
  "success": true,
  "message": "Email verified successfully. Please complete your profile.",
  "profileToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requiresProfileCompletion": true
}
```

### Verify Phone OTP

**Endpoint:** `POST /api/auth/verify-phone`

**Description:** Verify phone with the OTP sent during registration.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "654321"
}
```

**Notes:** the controller expects the phone field named `phoneNumber`.

**Success Response (200 OK):**
- Returns a token and user object if profile was already completed, otherwise a secure `profileToken` and `requiresProfileCompletion: true`.

Example (profile incomplete):
```json
{
  "success": true,
  "message": "Phone verified successfully. Please complete your profile.",
  "profileToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requiresProfileCompletion": true
}
```


---

### Resend OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Description:** Resend OTP for verification to email or phone number.

**Request Body (Email):**
```json
{
  "email": "john@example.com"
}
```

**Request Body (Phone):**
```json
{
  "phoneNumber": "+919876543210"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP resent to your email/phone.",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "verificationType": "email|phone",
  "requiresProfileCompletion": true|false
}
```

**Alternative Method:** Re-calling `POST /api/auth/register` with the same `email` or `phoneNumber` for an existing but unverified user will also trigger a resend of the verification OTP/email.

---

## User Login

### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Login with email/phone and password to receive a JWT token.

**Request Body:**
```json
{
  "emailOrPhone": "john@example.com",
  "password": "SecurePass123!"
}
```

**Notes:**
- `emailOrPhone` is a single string field — the controller detects whether it's an email or a phone number.
- Phone vs email verification is enforced: unverified accounts are blocked from login.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "<jwt>",
  "user": { "id": "...", "email": "...", "phoneNumber": "..." }
}
```

**Token Information:**
- Type: Bearer JWT
- Expiry: 7 days
- Usage: Include in `Authorization` header: `Bearer <token>`

**Errors:**
- 400: Missing fields
- 401: Invalid credentials or user not found
- 403: Account not verified (emailVerified/phoneVerified)

---

## Password Management

### Request Password Reset

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Request a password reset OTP. The controller expects a single string field `emailOrPhone` which can be either an email address or a phone number in `+91XXXXXXXXXX` format.

**Request Body:**
```json
{
  "emailOrPhone": "john@example.com"
}
```

**Behavior:**
- If the account exists and is verified, an OTP is sent to the registered email or phone. If the account doesn't exist, the response is still 200 to avoid user enumeration.
- Rate limiting is applied (max ~3 per minute in implementation).

**Success (200):**
```json
{
  "success": true,
  "message": "If an account with that email/phone exists, an OTP has been sent.",
  "contactType": "email|phone",
  "expiresIn": 600
}
```

### Reset Password (verify + set)

**Endpoint:** `POST /api/auth/reset-password`

**Description:** The controller combines OTP verification and password reset into a single request. Provide `emailOrPhone`, the `otp`, and the `newPassword`.

**Request Body:**
```json
{
  "emailOrPhone": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass456!"
}
```

**Validations:**
- OTP must be 6 digits.
- Password rules: at least 10 characters, contains uppercase and a number (controller enforces these checks).

**Success Response (200):**
- Updates password, marks OTP used, and returns a JWT and user object:
```json
{
  "success": true,
  "message": "Password has been reset successfully.",
  "token": "<jwt>",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

**Notes:**
- The server does not implement a separate `verify-reset-otp` endpoint; verification and reset happen together.

---

### Change Password

(Unchanged: use `PUT /api/profile/change-password` with Authorization header.)

See existing docs for the authenticated change-password flow — controllers for this endpoint live in the profile controller (not part of the two files inspected here).

---

## Token Management

### Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Refresh an existing JWT token to extend its validity.

**Request Headers:**
```json
{
  "Authorization": "Bearer <your_jwt_token>"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "token": "<new_jwt_token>"
}
```

**Error Responses:**

**401 Unauthorized** - Invalid or expired token:
```json
{
  "success": false,
  "message": "Invalid token."
}
```

## Profile Management


### Get User Profile

**Endpoint:** `GET /api/auth/me`

**Description:** Returns the currently authenticated user's profile. This route is implemented in `routes/authRoutes.js` and requires the `ensureAuth` middleware.

**Request Headers:**
```json
{
  "Authorization": "Bearer <your_jwt_token>"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "user": { "id": "...", "name": "...", "email": "...", "phoneNumber": "..." }
}
```

**Error Responses:**

**401 Unauthorized** - No token:
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**401 Unauthorized** - Invalid token:
```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

### 12. Update Profile

**Endpoint:** `PUT /profile`

**Description:** Update user profile information

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <your_jwt_token>"
}
```

**Request Body:**
```json
{
  "name": "John Updated Doe"
}
```

**Field Validations:**
- `name`: Optional, 2-100 characters if provided

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Updated Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "role": "LEARNER",
      "isVerified": true,
      "updatedAt": "2025-10-04T15:00:00.000Z"
    }
  }
}
```

---

### 13. Request Email Change

**Endpoint:** `POST /profile/change-email/request`

**Description:** Request to change email address (sends OTP to new email)

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <your_jwt_token>"
}
```

**Request Body:**
```json
{
  "newEmail": "newemail@example.com"
}
```

**Field Validations:**
- `newEmail`: Required, valid email format, must not be already registered

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification OTP sent to new email",
  "data": {
    "otpSent": true,
    "expiresIn": 300,
    "newEmail": "newemail@example.com"
  }
}
```

**Error Responses:**

**409 Conflict** - Email already in use:
```json
{
  "success": false,
  "message": "Email already in use"
}
```

---

### 14. Verify Email Change

**Endpoint:** `POST /profile/change-email/verify`

**Description:** Verify new email with OTP

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <your_jwt_token>"
}
```

**Request Body:**
```json
{
  "newEmail": "newemail@example.com",
  "otp": "123456"
}
```

**Field Validations:**
- `newEmail`: Required, must match the email OTP was sent to
- `otp`: Required, exactly 6 digits

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Email changed successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "newemail@example.com",
      "updatedAt": "2025-10-04T15:05:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid OTP:
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

### 15. Request Phone Change

**Endpoint:** `POST /profile/change-phone/request`

**Description:** Request to change phone number (sends OTP to new phone)

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <your_jwt_token>"
}
```

**Request Body:**
```json
{
  "newPhone": "+919999888877"
}
```

**Field Validations:**
- `newPhone`: Required, valid E.164 format, must not be already registered

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification OTP sent to new phone",
  "data": {
    "otpSent": true,
    "expiresIn": 300,
    "newPhone": "+919999888877"
  }
}
```

**Error Responses:**

**409 Conflict** - Phone already in use:
```json
{
  "success": false,
  "message": "Phone number already in use"
}
```

---

### 16. Verify Phone Change

**Endpoint:** `POST /profile/change-phone/verify`

**Description:** Verify new phone with OTP

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <your_jwt_token>"
}
```

**Request Body:**
```json
{
  "newPhone": "+919999888877",
  "otp": "654321"
}
```

**Field Validations:**
- `newPhone`: Required, must match the phone OTP was sent to
- `otp`: Required, exactly 6 digits

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Phone changed successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phone": "+919999888877",
      "updatedAt": "2025-10-04T15:10:00.000Z"
    }
  }
}
```

---

## Admin Authentication

### 17. Admin Login

**Endpoint:** `POST /admin-auth/login`

**Description:** Login for admin users

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "admin@lms.com",
  "password": "admin123"
}
```

**Field Validations:**
- `email`: Required
- `password`: Required
- User must have `ADMIN` role

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Admin User",
    "email": "admin@lms.com",
    "role": "ADMIN",
    "isVerified": true
  }
}
```

**Error Responses:**

**403 Forbidden** - Not an admin:
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

**401 Unauthorized** - Invalid credentials:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Authentication required or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

---

## Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:4000/api/user-auth/register-email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "role": "LEARNER"
  }'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:4000/api/user-auth/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Get Profile:**
```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Change Password:**
```bash
curl -X PUT http://localhost:4000/api/profile/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "TestPass123!",
    "newPassword": "NewTestPass456!"
  }'
```

### Using Postman

1. Import the base URL: `http://localhost:4000/api`
2. Create requests for each endpoint
3. For authenticated routes:
   - Go to **Authorization** tab
   - Select **Bearer Token**
   - Paste your JWT token

---

## Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special characters recommended

### Token Management
- Store JWT securely (use httpOnly cookies in production)
- Never expose tokens in URLs
- Implement token refresh mechanism
- Set appropriate token expiry (current: 7 days)

### OTP Security
- OTPs expire after 5 minutes (300 seconds)
- Maximum 3 attempts per OTP
- Rate limiting on OTP requests
- OTPs are 6 digits

### Rate Limiting
- Registration: 5 requests per hour per IP
- Login: 10 failed attempts = 1 hour lockout
- OTP requests: 1 per minute per user
- Password reset: 3 requests per hour per user

---

## Support

For issues or questions:
- Check server logs: `tail -f server.log`
- API Documentation: `http://localhost:4000/api-docs`
- Health Check: `http://localhost:4000/health`

---

## License

MIT License - See LICENSE file for details
