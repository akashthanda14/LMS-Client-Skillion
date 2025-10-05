# Authentication Flow - Testing Guide

This guide provides instructions for testing the complete authentication flow.

## Prerequisites

- Backend server running at `http://localhost:4000`
- Frontend server running at `http://localhost:3000`
- Valid test email/phone number with access to OTPs

## Manual Testing Checklist

### 1. Email Registration Flow

#### Test Case 1.1: New User Email Registration

**Steps:**
1. Navigate to `http://localhost:3000/register`
2. Ensure "Email" tab is selected
3. Enter a valid email address
4. Click "Continue"

**Expected Results:**
- ✅ Form submits successfully
- ✅ Redirected to `/verify-otp` page
- ✅ Email is masked correctly (e.g., `te**@example.com`)
- ✅ OTP sent to email (check inbox/spam)
- ✅ 60-second countdown starts for resend button

#### Test Case 1.2: Email OTP Verification

**Steps:**
1. From verification page, enter the 6-digit OTP received
2. Click "Verify OTP"

**Expected Results:**
- ✅ OTP validates successfully
- ✅ If profile complete: Redirected to `/dashboard` with logged-in state
- ✅ If profile incomplete: Redirected to `/complete-profile`

#### Test Case 1.3: Complete Profile

**Steps:**
1. On complete profile page, fill required fields:
   - Name: "John Doe"
   - Password: "SecurePass123"
2. Optionally fill:
   - Username: "johndoe"
   - Full Name: "John Michael Doe"
   - Country: "India"
   - State: "Punjab"
   - Zip: "144001"
3. Click "Complete Profile & Continue"

**Expected Results:**
- ✅ Form validates successfully
- ✅ Profile created
- ✅ Automatically logged in
- ✅ Redirected to `/dashboard`
- ✅ Token stored (check DevTools → Application → Local/Session Storage or check network requests)

### 2. Phone Registration Flow

#### Test Case 2.1: New User Phone Registration

**Steps:**
1. Navigate to `http://localhost:3000/register`
2. Click "Phone" tab
3. Enter phone number in format: `+911234567890`
4. Click "Continue"

**Expected Results:**
- ✅ Form submits successfully
- ✅ Redirected to `/verify-otp` page
- ✅ Phone is masked correctly (e.g., `+91*******890`)
- ✅ OTP sent via SMS
- ✅ 60-second countdown starts

#### Test Case 2.2: Phone OTP Verification

**Steps:**
1. Enter 6-digit OTP from SMS
2. Click "Verify OTP"

**Expected Results:**
- ✅ OTP validates successfully
- ✅ Appropriate redirect based on profile completion status

### 3. Resend OTP Functionality

#### Test Case 3.1: Resend Email OTP

**Steps:**
1. On verification page with email OTP
2. Wait for 60-second countdown to complete
3. Click "Resend OTP"

**Expected Results:**
- ✅ New OTP sent to email
- ✅ Countdown resets to 60 seconds
- ✅ Button disabled during countdown
- ✅ Success message or indication shown

#### Test Case 3.2: Resend Before Countdown

**Steps:**
1. On verification page
2. Try to click "Resend OTP" before 60 seconds

**Expected Results:**
- ✅ Button is disabled
- ✅ Shows "Resend OTP in Xs" message
- ✅ No API call made

### 4. Validation Testing

#### Test Case 4.1: Email Validation

**Test Invalid Emails:**
- `invalid-email` → ❌ "Invalid email format"
- `test@` → ❌ "Invalid email format"
- `@example.com` → ❌ "Invalid email format"
- `` (empty) → ❌ "Email is required"

**Test Valid Emails:**
- `test@example.com` → ✅ Accepted
- `user.name+tag@example.co.uk` → ✅ Accepted

#### Test Case 4.2: Phone Validation

**Test Invalid Phones:**
- `1234567890` → ❌ "Phone must be in format..."
- `+91` → ❌ "Phone must be in format..."
- `+911234` → ❌ "Phone must be in format..."

**Test Valid Phones:**
- `+911234567890` → ✅ Accepted
- `+14155552671` → ✅ Accepted

#### Test Case 4.3: OTP Validation

**Test Invalid OTPs:**
- `12345` (5 digits) → ❌ "OTP must be 6 digits"
- `12a456` (with letters) → ❌ "OTP must contain only numbers"
- `` (empty) → ❌ "OTP is required"

**Test Valid OTPs:**
- `123456` → ✅ Accepted

#### Test Case 4.4: Password Validation

**Test Weak Passwords:**
- `short` → ❌ "Password must be at least 8 characters"
- `` (empty) → ❌ "Password is required"

**Test Valid Passwords:**
- `password123` → ✅ Accepted (shows "Weak" or "Medium")
- `SecurePass123!` → ✅ Accepted (shows "Strong")

#### Test Case 4.5: Username Validation

**Test Invalid Usernames:**
- `ab` → ❌ "Username must be at least 3 characters"

**Test Valid Usernames:**
- `johndoe` → ✅ Accepted
- `` (empty) → ✅ Accepted (optional field)

### 5. Error Handling

#### Test Case 5.1: Already Registered

**Steps:**
1. Register with an email that's already in the system
2. Complete the first registration
3. Try to register again with the same email

**Expected Results:**
- ✅ Shows error: "This account is already registered. Please log in instead."
- ✅ Shows link to login page

#### Test Case 5.2: Invalid OTP

**Steps:**
1. During OTP verification, enter wrong OTP: `000000`
2. Click "Verify OTP"

**Expected Results:**
- ✅ Shows error: "Invalid or expired OTP. Please try again."
- ✅ OTP input remains active
- ✅ Can retry with correct OTP

#### Test Case 5.3: Expired OTP

**Steps:**
1. Wait for OTP to expire (usually 10 minutes)
2. Enter the expired OTP

**Expected Results:**
- ✅ Shows error: "Invalid or expired OTP. Please try again."
- ✅ Resend button is available

#### Test Case 5.4: Username Taken

**Steps:**
1. During profile completion, enter a username that's already taken
2. Submit form

**Expected Results:**
- ✅ Shows inline error: "Username is already taken"
- ✅ Username field is highlighted
- ✅ Can correct and resubmit

#### Test Case 5.5: Network Error

**Steps:**
1. Disconnect internet
2. Try to submit any form

**Expected Results:**
- ✅ Shows error: "Network error. Please check your connection."
- ✅ Form remains in submittable state after reconnection

### 6. UI/UX Testing

#### Test Case 6.1: Loading States

**Steps:**
1. Submit each form
2. Observe loading states

**Expected Results:**
- ✅ Submit button shows loading spinner
- ✅ Submit button text changes (e.g., "Registering...")
- ✅ Submit button is disabled during loading
- ✅ Input fields are disabled during loading
- ✅ No double-submission possible

#### Test Case 6.2: Contact Type Toggle

**Steps:**
1. On registration page, click between "Email" and "Phone" tabs
2. Enter data in one field
3. Switch tabs

**Expected Results:**
- ✅ Active tab is highlighted
- ✅ Previous input is cleared when switching
- ✅ Errors are cleared when switching
- ✅ Correct input field is shown

#### Test Case 6.3: Password Visibility Toggle

**Steps:**
1. On profile completion page, enter password
2. Click eye icon to toggle visibility

**Expected Results:**
- ✅ Password becomes visible/hidden
- ✅ Icon changes (Eye → EyeOff)
- ✅ Password value is not lost

#### Test Case 6.4: Password Strength Indicator

**Steps:**
1. On profile completion page, type different passwords:
   - "weak" (4 chars)
   - "password" (8 chars)
   - "Password123" (mixed)
   - "P@ssw0rd123!" (strong)

**Expected Results:**
- ✅ "weak" → No indicator or red
- ✅ "password" → Red/Yellow - "Weak" or "Medium"
- ✅ "Password123" → Yellow - "Medium"
- ✅ "P@ssw0rd123!" → Green - "Strong"

#### Test Case 6.5: Form Validation States

**Steps:**
1. Try submitting forms with invalid data
2. Observe field states

**Expected Results:**
- ✅ Invalid fields have red border
- ✅ Error message appears below field
- ✅ Submit button disabled until valid
- ✅ Errors clear when corrected

### 7. Navigation Testing

#### Test Case 7.1: Direct URL Access

**Steps:**
1. Try accessing `/verify-otp` without going through registration
2. Try accessing `/complete-profile` without verification

**Expected Results:**
- ✅ Redirects to `/register` if missing required params
- ✅ Shows error message if userId is invalid

#### Test Case 7.2: Back Button Behavior

**Steps:**
1. Complete registration → OTP verification → Profile completion
2. Use browser back button

**Expected Results:**
- ✅ Navigation works as expected
- ✅ State is preserved or redirects appropriately
- ✅ No broken states

### 8. Token Storage Testing

#### Test Case 8.1: Memory Storage (Default)

**Steps:**
1. Complete registration and login
2. Check DevTools → Application → Storage
3. Refresh page

**Expected Results:**
- ✅ Token not visible in localStorage/sessionStorage
- ✅ After refresh, user is logged out (memory cleared)

#### Test Case 8.2: LocalStorage

**Steps:**
1. Set `NEXT_PUBLIC_TOKEN_STORAGE=localStorage` in `.env.local`
2. Restart dev server
3. Complete registration and login
4. Check DevTools → Application → Local Storage

**Expected Results:**
- ✅ Token visible in localStorage as `authToken`
- ✅ User data visible as `authUser`
- ✅ After refresh, user remains logged in

#### Test Case 8.3: SessionStorage

**Steps:**
1. Set `NEXT_PUBLIC_TOKEN_STORAGE=sessionStorage`
2. Restart dev server
3. Complete registration and login
4. Check DevTools → Application → Session Storage

**Expected Results:**
- ✅ Token visible in sessionStorage
- ✅ After refresh, user remains logged in
- ✅ After closing and reopening browser, user is logged out

### 9. Security Testing

#### Test Case 9.1: XSS Prevention

**Steps:**
1. Try entering `<script>alert('XSS')</script>` in form fields
2. Submit forms

**Expected Results:**
- ✅ Script tags are escaped/sanitized
- ✅ No alert popup appears
- ✅ Backend rejects malicious input

#### Test Case 9.2: SQL Injection Prevention

**Steps:**
1. Try entering `'; DROP TABLE users; --` in fields
2. Submit forms

**Expected Results:**
- ✅ Input is properly escaped
- ✅ Backend rejects malicious input
- ✅ No database errors

#### Test Case 9.3: 401 Auto-Logout

**Steps:**
1. Login successfully
2. Manually expire or delete token
3. Make an authenticated request

**Expected Results:**
- ✅ Request returns 401
- ✅ Interceptor catches error
- ✅ Token is cleared
- ✅ Redirected to `/login`

## API Testing (Postman/cURL)

### Test Registration API

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Check your email for verification.",
  "userId": "uuid-here",
  "verificationType": "email",
  "requiresProfileCompletion": true
}
```

### Test Email OTP Verification

```bash
curl -X POST http://localhost:4000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

### Test Complete Profile

```bash
curl -X POST http://localhost:4000/api/auth/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-here",
    "name": "John Doe",
    "password": "SecurePass123"
  }'
```

## Automated Testing (Future)

### Unit Tests

Install test dependencies:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Run tests:
```bash
npm test
```

### Integration Tests

Test complete user flows using Playwright or Cypress.

### E2E Tests

Test entire application flow from registration to course enrollment.

## Performance Testing

### Load Testing

- Test with multiple concurrent registrations
- Check OTP delivery rate
- Monitor API response times

### Stress Testing

- Test with high volume of requests
- Check rate limiting works
- Monitor server resources

## Accessibility Testing

- [ ] Test with screen reader
- [ ] Test keyboard navigation
- [ ] Check color contrast
- [ ] Verify ARIA labels
- [ ] Test with browser zoom

## Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Mobile Testing

Test on:
- [ ] iPhone (iOS)
- [ ] Android phones
- [ ] Tablets
- [ ] Different screen sizes

## Common Issues & Solutions

### Issue: OTP not received

**Solutions:**
- Check backend logs for email/SMS service errors
- Verify API keys are configured
- Check spam folder for emails
- Verify phone number format

### Issue: Token not persisting

**Solutions:**
- Check `NEXT_PUBLIC_TOKEN_STORAGE` env variable
- Verify localStorage/sessionStorage is enabled in browser
- Check browser privacy settings

### Issue: Redirect not working

**Solutions:**
- Check browser console for errors
- Verify Next.js routing is configured correctly
- Check if pages exist at specified routes

### Issue: 401 errors on authenticated requests

**Solutions:**
- Verify token is being set correctly
- Check if token has expired
- Verify backend JWT configuration

## Test Report Template

```
Test Date: [Date]
Tester: [Name]
Environment: [Dev/Staging/Prod]

| Test Case | Status | Notes |
|-----------|--------|-------|
| Email Registration | ✅/❌ | |
| Phone Registration | ✅/❌ | |
| OTP Verification | ✅/❌ | |
| Profile Completion | ✅/❌ | |
| Resend OTP | ✅/❌ | |
| Error Handling | ✅/❌ | |
| Token Storage | ✅/❌ | |
| Security | ✅/❌ | |

Overall Status: ✅ Pass / ❌ Fail
Comments: [Any additional notes]
```

## Conclusion

This testing guide covers all aspects of the authentication flow. Make sure to test each scenario thoroughly before deploying to production.

For automated testing, consider setting up CI/CD pipelines to run tests on every commit.
