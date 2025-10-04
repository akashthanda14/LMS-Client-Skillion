# Profile Completion

After verifying email or phone number, users must complete their profile with a name and password. The verification endpoints now provide a secure `profileToken` instead of exposing the user ID directly.

### Complete Profile

**Endpoint:** `POST /api/auth/complete-profile`

**Description:** Complete user profile after OTP verification. This step is required after verifying email or phone number when creating a new account.

**Request Body:**
```json
{
  "profileToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", 
  "name": "John Doe",
  "password": "SecurePass123!",
  "username": "johndoe123", // optional
  "fullName": "John Robert Doe", // optional
  "country": "United States", // optional
  "state": "California", // optional
  "zip": "90210" // optional
}
```

**Field Validations:**
- `profileToken`: Required, JWT token received from verification endpoint.
- `name`: Required, 2-100 characters.
- `password`: Required, minimum 8 characters.
- `username`: Optional, must be unique.
- Other fields: Optional profile information.

**Security Features:**
- The endpoint now requires a secure profile completion token instead of a user ID.
- The token is short-lived (1 hour) and can only be used for this specific purpose.
- This prevents unauthorized profile updates.

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile completed successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "username": "johndoe123",
    "email": "john@example.com",
    "phoneNumber": null,
    "emailVerified": true,
    "phoneVerified": false,
    "isProfileComplete": true,
    "country": "United States",
    "state": "California",
    "zip": "90210",
    "role": "LEARNER",
    "createdAt": "2025-10-04T14:30:00.000Z",
    "updatedAt": "2025-10-04T14:35:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing required fields:
```json
{
  "success": false,
  "message": "Profile token, name, and password are required."
}
```

**401 Unauthorized** - Invalid token:
```json
{
  "success": false,
  "message": "Invalid or expired profile token. Please verify your email or phone again."
}
```

**404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "User not found."
}
```

**409 Conflict** - Username taken:
```json
{
  "success": false,
  "message": "Username is already taken."
}
```
