# Frontend Implementation Prompt: User Authentication Flow

## Overview
Implement a complete user registration, verification, and profile completion flow in React that integrates with our existing Node.js/Express backend API. The flow must handle both email and phone-based registration with OTP verification.

---

## Backend API Endpoints (EXACT PATHS - DO NOT MODIFY)

### 1. Register User
```
POST /api/user/register
```

**Email Registration:**
```json
{
  "email": "user@example.com"
}
```

**Phone Registration:**
```json
{
  "phoneNumber": "+911234567890"
}
```

**Success Responses:**
- **201 Created** (New user):
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

- **200 OK** (Existing unverified - OTP resent):
```json
{
  "success": true,
  "message": "Verification email resent.",
  "userId": "uuid-string",
  "verificationType": "email",
  "requiresProfileCompletion": false
}
```

- **409 Conflict** (Already registered):
```json
{
  "success": false,
  "message": "Email already registered. Log in instead."
}
```

---

### 2. Verify Email OTP
```
POST /api/user/verify-email-otp
```

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Responses:**
- **Profile Complete** (Auto-login):
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

- **Needs Profile Completion**:
```json
{
  "success": true,
  "message": "Email verified successfully. Please complete your profile.",
  "userId": "uuid",
  "requiresProfileCompletion": true
}
```

**Error Responses:**
- **400**: `{ "success": false, "message": "Invalid or expired OTP." }`
- **404**: `{ "success": false, "message": "User not found with this email address." }`

---

### 3. Verify Phone OTP
```
POST /api/user/verify-phone-otp
```

**Request:**
```json
{
  "phoneNumber": "+911234567890",
  "otp": "123456"
}
```

**Responses:** Same structure as email verification above.

---

### 4. Complete Profile
```
POST /api/user/complete-profile
```

**Request (Required fields):**
```json
{
  "userId": "uuid-string",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Request (With optional fields):**
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

**Success Response:**
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
    "phoneNumber": "+911234567890",
    "isProfileComplete": true,
    "emailVerified": true,
    "phoneVerified": false
  }
}
```

**Error Responses:**
- **409**: `{ "success": false, "message": "Username is already taken." }`
- **400**: `{ "success": false, "message": "Password must be at least 8 characters long." }`

---

## Required Components

### 1. RegisterForm Component
**File:** `src/components/auth/RegisterForm.jsx`

**Features:**
- Toggle between Email and Phone input (radio buttons or tabs)
- Email validation: Use `validator.isEmail()` from npm package `validator`
- Phone validation: Must match pattern `+[country-code][digits]` (e.g., `+911234567890`)
- Trim and normalize inputs before submission
- Show loading spinner during API call
- Disable submit button while loading
- On success: Navigate to VerifyOTP screen with `verificationType`, `contactInfo`, and `userId`
- On 409 error: Show message "Already registered" with link to login page
- On 400/500: Show inline error message

**Resend OTP Logic:**
- Clicking "Resend" calls the same `POST /api/user/register` endpoint with the same contact
- Implement 60-second countdown timer - disable resend button during countdown
- Show countdown text: "Resend in 45s", "Resend in 30s", etc.
- After countdown ends, re-enable button

---

### 2. VerifyOTP Component
**File:** `src/components/auth/VerifyOTP.jsx`

**Props:**
- `verificationType`: "email" | "phone"
- `contactInfo`: string (email or phone number)
- `userId`: string (UUID from registration)

**Features:**
- Display masked contact info: `us**@example.com` or `+91*******890`
- 6-digit OTP input field (auto-focus, numeric only)
- Call `/api/user/verify-email-otp` or `/api/user/verify-phone-otp` based on `verificationType`
- On success with `token`:
  - Store token in chosen storage (memory/localStorage)
  - Store user object
  - Navigate to protected dashboard/home page
- On success with `requiresProfileCompletion: true`:
  - Navigate to CompleteProfile screen
  - Pass `userId` to CompleteProfile
- On 400: Show "Invalid or expired OTP"
- On 404: Show "No account found"
- Resend button: Calls `POST /api/user/register` again with original contact

---

### 3. CompleteProfile Component
**File:** `src/components/auth/CompleteProfile.jsx`

**Props:**
- `userId`: string (UUID from verification step)

**Fields:**
- **Required:**
  - `name` (text input)
  - `password` (password input, show/hide toggle)
- **Optional:**
  - `username` (text input, lowercase + trim)
  - `fullName` (text input)
  - `country` (dropdown or text)
  - `state` (dropdown or text)
  - `zip` (text input)

**Validation:**
- Password: minimum 8 characters
- Username: minimum 3 characters if provided
- Client-side validation before API call

**On Submit:**
- Call `POST /api/user/complete-profile` with all fields
- On success:
  - Store `token` and `user`
  - Navigate to main app/dashboard
- On 409 (username taken): Show inline error "Username is already taken"
- On 400: Show specific validation error from backend

---

## API Client Setup

### File: `src/services/api.js`

Create an axios instance with:
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// Request interceptor - attach token
apiClient.interceptors.request.use((config) => {
  const token = getToken(); // from tokenStorage.js
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

### File: `src/services/authService.js`

Create specific API calls:
```javascript
import apiClient from './api';

export const registerUser = async (data) => {
  const response = await apiClient.post('/api/user/register', data);
  return response.data;
};

export const verifyEmailOTP = async (email, otp) => {
  const response = await apiClient.post('/api/user/verify-email-otp', { email, otp });
  return response.data;
};

export const verifyPhoneOTP = async (phoneNumber, otp) => {
  const response = await apiClient.post('/api/user/verify-phone-otp', { phoneNumber, otp });
  return response.data;
};

export const completeProfile = async (profileData) => {
  const response = await apiClient.post('/api/user/complete-profile', profileData);
  return response.data;
};
```

---

## Token Storage

### File: `src/utils/tokenStorage.js`

Implement three strategies (configurable via env):

**Option 1: In-Memory (Most secure, recommended)**
```javascript
let token = null;

export const setToken = (newToken) => { token = newToken; };
export const getToken = () => token;
export const clearToken = () => { token = null; };
```

**Option 2: localStorage (Persists, XSS risk)**
```javascript
export const setToken = (token) => localStorage.setItem('authToken', token);
export const getToken = () => localStorage.getItem('authToken');
export const clearToken = () => localStorage.removeItem('authToken');
```

**Option 3: sessionStorage (Session only)**
```javascript
export const setToken = (token) => sessionStorage.setItem('authToken', token);
export const getToken = () => sessionStorage.getItem('authToken');
export const clearToken = () => sessionStorage.removeItem('authToken');
```

Choose based on `REACT_APP_TOKEN_STORAGE` env variable.

---

## Validation Utilities

### File: `src/utils/validation.js`

```javascript
import validator from 'validator';

export const validateEmail = (email) => {
  if (!email) return { valid: false, error: 'Email is required' };
  if (!validator.isEmail(email)) return { valid: false, error: 'Invalid email format' };
  return { valid: true };
};

export const validatePhone = (phone) => {
  if (!phone) return { valid: false, error: 'Phone number is required' };
  const phoneRegex = /^\+\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Phone must be in format +[country][number]' };
  }
  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  return { valid: true };
};

export const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`;
};

export const maskPhone = (phone) => {
  return `${phone.slice(0, 3)}${'*'.repeat(phone.length - 6)}${phone.slice(-3)}`;
};
```

---

## UX Requirements (Critical)

### Registration Screen
1. Show either email OR phone input based on user selection
2. Validate input before enabling submit button
3. On submit, show loading state
4. On success, immediately navigate to OTP verification
5. Keep `userId` in state/context for next steps
6. For 409 error, show link to login page

### OTP Verification Screen
1. Auto-focus on OTP input field
2. Show masked contact info prominently
3. 6-digit numeric input only
4. Show "Resend OTP" button with countdown
5. On successful verification:
   - If `token` exists → Store and redirect to dashboard
   - If `requiresProfileCompletion: true` → Navigate to profile completion
6. Clear, specific error messages

### Profile Completion Screen
1. Mark required fields with asterisk (*)
2. Show password strength indicator
3. Username input: auto-lowercase on blur
4. Validate before enabling submit
5. On success, store token and redirect to main app
6. On username conflict, highlight username field with error

### Error Handling
- Network errors: "Network error. Please check your connection."
- 400: Show backend message or generic validation error
- 401: Redirect to login (handled in axios interceptor)
- 409: Show specific conflict message
- 500: "Server error. Please try again later."

---

## Routing Setup

Use React Router v6:

```javascript
<Routes>
  <Route path="/register" element={<RegisterForm />} />
  <Route path="/verify-otp" element={<VerifyOTP />} />
  <Route path="/complete-profile" element={<CompleteProfile />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
</Routes>
```

Pass data between routes using:
- React Router `useNavigate` with state
- OR Context API (AuthContext)
- OR URL params for `userId` (less secure)

---

## Testing Requirements

### Unit Tests (Vitest/Jest)
1. Test API service functions with mock responses
2. Test validation functions
3. Test token storage utilities
4. Test error message mapping

### Integration Tests
1. Complete registration flow (happy path)
2. OTP verification flow
3. Profile completion flow
4. Error handling scenarios

### Storybook Stories
Create stories for:
1. RegisterForm (empty, filled, loading, error states)
2. VerifyOTP (default, loading, error, success)
3. CompleteProfile (empty, filled, validation errors)

---

## Environment Variables

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_TOKEN_STORAGE=memory
```

For production:
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_TOKEN_STORAGE=memory
```

---

## Dependencies

Install these packages:
```bash
npm install axios validator react-router-dom
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

---

## Acceptance Criteria Checklist

- [ ] Register form calls `POST /api/user/register` with email or phone
- [ ] After registration, verification screen displays correctly
- [ ] Resend OTP uses same `/api/user/register` endpoint
- [ ] Resend button disabled for 60 seconds after click
- [ ] OTP verification calls correct endpoint based on `verificationType`
- [ ] On token response, token is stored and user redirected to dashboard
- [ ] On `requiresProfileCompletion: true`, user navigates to profile screen
- [ ] Profile completion stores token and redirects on success
- [ ] Username conflict shows inline error message
- [ ] All validation errors display inline near relevant fields
- [ ] Protected routes redirect to login if no token (401)
- [ ] Network errors show user-friendly messages
- [ ] Contact info is masked in UI (email/phone)
- [ ] All forms show loading states during API calls

---

## Edge Cases to Handle

1. User submits registration multiple times → Backend handles idempotency
2. OTP expires → Show "Expired OTP" message with resend button
3. User navigates back after verification → Redirect appropriately
4. Token expires during session → 401 interceptor handles logout
5. User closes browser during flow → State lost if using in-memory storage
6. Slow network → Show loading state, don't allow double submission

---

## Security Notes

- Never log tokens to console
- Validate inputs on both client and server
- Use HTTPS in production
- Implement CSRF protection if using cookies
- Rate limit OTP resend on backend (already implemented)
- Consider implementing captcha for registration

---

## Deliverables

1. Three React components: RegisterForm, VerifyOTP, CompleteProfile
2. API client with interceptors (api.js, authService.js)
3. Token storage utility
4. Validation utilities
5. Error handling utilities
6. Unit tests for critical functions
7. Storybook stories for all components
8. README with setup instructions

---

## Questions to Consider

1. Should we use Context API or Redux for auth state?
2. What happens when token expires? (Implement refresh token endpoint?)
3. Should we add "Remember Me" option for localStorage persistence?
4. Do we need social auth (Google/Facebook) integration?
5. Should we add email link verification as alternative to OTP?

---

**Start with:** Create the API client and auth service first, then build components from RegisterForm → VerifyOTP → CompleteProfile. Test each step before moving to the next.

**Backend is already running at:** `http://localhost:4000`
**Test the endpoints using** Postman or curl first to understand responses.

Good luck! 🚀
