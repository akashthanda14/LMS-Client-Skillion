# Frontend Integration Guide for Authentication API

This document provides guidance for integrating the authentication API with your frontend application.

## Authentication Flow Summary

1. **Registration**: 
   - Send email or phoneNumber to `/api/auth/register`
   - Receive OTP via email or SMS

2. **Verification**: 
   - Verify email/phone with OTP at `/api/auth/verify-email` or `/api/auth/verify-phone`
   - Receive either:
     - A JWT token and user object (if profile already exists)
     - A profile completion token (for new accounts)

3. **Profile Completion**:
   - Complete profile with name and password at `/api/auth/complete-profile`
   - Include the profileToken received from verification
   - Receive JWT token and user object

4. **Authentication**:
   - Access protected resources with JWT token in Authorization header
   - Refresh token when needed at `/api/auth/refresh`

## Key Endpoints and Payloads

### Registration

```javascript
// Email registration
const registerWithEmail = async (email) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

// Phone registration
const registerWithPhone = async (phoneNumber) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  });
  return response.json();
};
```

### Verification

```javascript
// Email verification
const verifyEmail = async (email, otp) => {
  const response = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  return response.json();
};

// Phone verification
const verifyPhone = async (phoneNumber, otp) => {
  const response = await fetch('/api/auth/verify-phone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, otp })
  });
  return response.json();
};
```

### Profile Completion

```javascript
const completeProfile = async (profileToken, userData) => {
  const response = await fetch('/api/auth/complete-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileToken,
      name: userData.name,
      password: userData.password,
      // Optional fields
      username: userData.username,
      fullName: userData.fullName,
      country: userData.country,
      state: userData.state,
      zip: userData.zip
    })
  });
  return response.json();
};
```

### Login

```javascript
const login = async (emailOrPhone, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone, password })
  });
  return response.json();
};
```

### Authenticated Requests

```javascript
const getUserProfile = async (token) => {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### Token Refresh

```javascript
const refreshToken = async (token) => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## Example Authentication Flow Implementation

```javascript
// Registration and profile completion flow
async function registerAndCompleteProfile() {
  // Step 1: Register with email
  const registerResponse = await registerWithEmail('user@example.com');
  console.log('Check your email for OTP');
  
  // Step 2: Verify email with OTP
  const otpFromUser = '123456'; // In real app, get from user input
  const verifyResponse = await verifyEmail('user@example.com', otpFromUser);
  
  if (verifyResponse.requiresProfileCompletion) {
    // Step 3: Complete profile
    const profileData = {
      name: 'John Doe',
      password: 'SecurePass123',
      username: 'johndoe'
    };
    
    const completeResponse = await completeProfile(
      verifyResponse.profileToken,
      profileData
    );
    
    // Save token for authentication
    localStorage.setItem('authToken', completeResponse.token);
    
    return completeResponse.user;
  } else {
    // User already has a profile
    localStorage.setItem('authToken', verifyResponse.token);
    return verifyResponse.user;
  }
}
```

## Security Considerations

1. **Token Storage**: Store JWT tokens securely (e.g., httpOnly cookies for web apps)
2. **Password Security**: Implement strong password requirements on the client side
3. **Error Handling**: Provide user-friendly error messages
4. **Rate Limiting**: Implement UI delays between OTP attempts
5. **Token Expiration**: Handle expired tokens gracefully

## Common Issues and Solutions

- **Verification Errors**: Ensure correct email/phone format and OTP are sent
- **Token Expiration**: Automatically redirect to login when token expires
- **Network Errors**: Implement retry logic for critical API calls

For detailed API documentation, refer to [AUTHENTICATION_API.md](./AUTHENTICATION_API.md).
