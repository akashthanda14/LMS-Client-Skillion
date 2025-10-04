# Authentication Test Script

## Overview

This script tests all authentication and user management endpoints for the email: **akashthanda14@gmail.com**

## What It Tests

### Phase 1: Registration & Verification
- ✅ Register with email
- ✅ Verify email OTP
- ✅ Resend OTP functionality

### Phase 2: Authentication
- ✅ Login with email and password
- ✅ JWT token generation

### Phase 3: Profile Management
- ✅ Get user profile
- ✅ Update profile name

### Phase 4: Password Management
- ✅ Request password reset
- ✅ Change password (and restore)

### Phase 5: Email Management
- ✅ Request email change

### Phase 6: Security Tests
- ✅ Invalid login rejection
- ✅ Unauthorized access blocking

## Prerequisites

1. **Server Running**
   ```bash
   npm run dev
   # Server should be running on http://localhost:4000
   ```

2. **Email Access**
   - You'll need access to akashthanda14@gmail.com
   - OTPs will be sent to this email
   - Keep your inbox open

3. **Dependencies Installed**
   ```bash
   npm install axios dotenv
   ```

## How to Run

### Step 1: Start the Server
```bash
# In terminal 1
npm run dev
```

### Step 2: Run the Test Script
```bash
# In terminal 2
node scripts/test-auth-complete.js
```

### Step 3: Enter OTP When Prompted
```
Enter the 6-digit OTP received in your email: 123456
```

## Expected Output

```
======================================================================
🧪 Authentication API Test Suite
📧 Testing with: akashthanda14@gmail.com
🌐 API Base URL: http://localhost:4000/api
======================================================================

──────────────────────────────────────────────────────────────────────
📝 Phase 1: Registration & Verification
──────────────────────────────────────────────────────────────────────

📍 Test 1: Register with Email
✅ Registration successful
ℹ️  User ID: 550e8400-e29b-41d4-a716-446655440000
ℹ️  OTP sent to: akashthanda14@gmail.com
ℹ️  Expires in: 300 seconds

📍 Test 2: Verify Email OTP
Enter the 6-digit OTP received in your email: 123456
✅ Email verified successfully
ℹ️  Verified at: 2025-10-04T15:30:00.000Z

──────────────────────────────────────────────────────────────────────
🔐 Phase 2: Authentication
──────────────────────────────────────────────────────────────────────

📍 Test 4: Login with Email and Password
✅ Login successful
ℹ️  Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ℹ️  User: Akash Thanda
ℹ️  Role: LEARNER
ℹ️  Verified: true

──────────────────────────────────────────────────────────────────────
👤 Phase 3: Profile Management
──────────────────────────────────────────────────────────────────────

📍 Test 5: Get User Profile
✅ Profile retrieved successfully
ℹ️  Name: Akash Thanda
ℹ️  Email: akashthanda14@gmail.com
ℹ️  Role: LEARNER

📍 Test 6: Update Profile Name
✅ Profile updated successfully
ℹ️  New name: Akash Thanda (Updated)

──────────────────────────────────────────────────────────────────────
🔑 Phase 4: Password Management
──────────────────────────────────────────────────────────────────────

📍 Test 7: Request Password Reset
✅ Password reset OTP sent
ℹ️  OTP sent to: akashthanda14@gmail.com

📍 Test 9: Change Password
✅ Password changed successfully
✅ Password restored to original

──────────────────────────────────────────────────────────────────────
🛡️  Phase 6: Security Tests
──────────────────────────────────────────────────────────────────────

📍 Test 11: Invalid Login Attempt (Security Test)
✅ Invalid login correctly rejected
ℹ️  Error message: Invalid credentials

📍 Test 12: Unauthorized Access (Security Test)
✅ Unauthorized access correctly blocked
ℹ️  Error message: Access denied. No token provided.

======================================================================
📊 Test Results Summary
======================================================================
Total Tests:   12
✅ Passed:     11
❌ Failed:     0
⏭️  Skipped:    1
Success Rate:  91.7%
======================================================================

✅ All tests passed! 🎉

💾 Saved Test Data:
User ID: 550e8400-e29b-41d4-a716-446655440000
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

You can use this token for manual API testing:
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## If User Already Exists

If you've already registered with akashthanda14@gmail.com, the script will:
1. Detect existing registration
2. Skip directly to login tests
3. Continue with remaining tests

## Manual Testing with Token

After the test completes, you can use the generated token for manual testing:

```bash
# Export the token
export TOKEN="your_token_here"

# Test any protected endpoint
curl -X GET http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN"

# Update profile
curl -X PUT http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name"}'

# Get enrollments
curl -X GET http://localhost:4000/api/enrollments \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Test Fails at Registration
```
❌ Registration failed: Email already registered
```
**Solution**: The email is already in the system. The script will automatically switch to login mode.

### OTP Not Received
```
⚠️  OTP not received? Check spam folder
```
**Solutions**:
1. Check spam/junk folder
2. Wait 1-2 minutes (email might be delayed)
3. Run resend OTP test
4. Check if email service is configured in `.env`:
   ```env
   EMAIL_USER=akashthanda14@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

### Server Not Running
```
❌ Connect ECONNREFUSED
```
**Solution**: Start the server first:
```bash
npm run dev
```

### Token Expired
```
❌ Invalid token
```
**Solution**: Run the test again to get a fresh token.

## Test Data

The script uses:
- **Email**: akashthanda14@gmail.com
- **Password**: TestPass123!
- **Name**: Akash Thanda
- **Role**: LEARNER

## What Gets Modified

1. **Creates/Updates User**: Registration creates new user or updates existing
2. **Profile Name**: Temporarily changes to "Akash Thanda (Updated)"
3. **Password**: Changes temporarily but immediately restores original
4. **Email**: Tests email change request but doesn't complete it

## Safety Features

- ✅ **Password restored** after change test
- ✅ **Email not actually changed** (only request tested)
- ✅ **Original data preserved** after tests
- ✅ **No destructive operations** without restoration

## Integration with Other Tests

You can combine this with other test scripts:

```bash
# Full authentication test
node scripts/test-auth-complete.js

# Then test course enrollment
node scripts/test-enrollment-progress.js

# Or test certificate generation
node scripts/test-certificate-system.js
```

## CI/CD Integration

To use in CI/CD pipelines:

```bash
# Run in non-interactive mode (requires pre-configured user)
NODE_ENV=test node scripts/test-auth-complete.js

# With specific base URL
BASE_URL=https://your-api.com/api node scripts/test-auth-complete.js
```

## API Coverage

This test covers **17 endpoints**:
- 2 Registration endpoints
- 2 Verification endpoints  
- 1 Resend OTP endpoint
- 1 Login endpoint
- 1 Get profile endpoint
- 1 Update profile endpoint
- 1 Password reset request
- 1 Reset OTP verification
- 1 Reset password endpoint
- 1 Change password endpoint
- 2 Email change endpoints
- 2 Phone change endpoints
- 1 Admin login endpoint

## Success Criteria

✅ Test passes if:
- All API responses match expected status codes
- JWT token is valid and can access protected routes
- Security tests correctly reject unauthorized access
- Profile updates are successful
- Password management works correctly

## Next Steps

After running this test:
1. ✅ Check test results summary
2. ✅ Use the generated token for manual testing
3. ✅ Review any failed tests
4. ✅ Run other test suites (enrollment, certificates, etc.)

## Support

For issues:
- Check server logs: `tail -f server.log`
- Verify email configuration in `.env`
- Ensure database is running
- Check Redis connection (for OTP storage)

---

**Test Script**: scripts/test-auth-complete.js  
**Documentation**: docs/AUTHENTICATION_API.md  
**Email**: akashthanda14@gmail.com  
**Last Updated**: October 4, 2025
