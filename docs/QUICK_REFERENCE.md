# User Modules - Quick Reference Card

## 📋 File Location Reference

```
user_modules/
├── controllers/
│   ├── authController.js       → Password reset & recovery
│   ├── userController.js       → Registration & login
│   ├── adminController.js      → Admin authentication
│   └── profileController.js    → Email & phone change
├── services/
│   ├── userService.js          → User database operations
│   └── otpService.js           → OTP management
├── routes/
│   ├── userRoutes.js           → User API endpoints
│   └── adminRoutes.js          → Admin API endpoints
└── docs/
    ├── README.md               → Full documentation
    ├── MIGRATION_GUIDE.md      → Integration steps
    ├── INTEGRATION_EXAMPLE.js  → Code examples
    └── PROJECT_SUMMARY.md      → What we created
```

## 🚀 Quick Integration (Copy-Paste Ready)

### Add to server.js:
```javascript
import userAuthRoutes from './user_modules/routes/userRoutes.js';
import adminAuthRoutes from './user_modules/routes/adminRoutes.js';

app.use('/api/user-auth', userAuthRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
```

### Environment Variables:
```env
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password
```

## 🔗 API Endpoints Cheat Sheet

### User Registration & Login
```
POST /api/user-auth/register              # Register with email/phone
POST /api/user-auth/verify-email-otp      # Verify email OTP
POST /api/user-auth/verify-phone-otp      # Verify phone OTP
POST /api/user-auth/complete-profile      # Complete profile
POST /api/user-auth/login                 # Login
```

### Password Management
```
POST /api/user-auth/forgot-password       # Request password reset
POST /api/user-auth/reset-password        # Reset with OTP
```

### Profile Changes (Protected)
```
POST /api/user-auth/request-email-change  # Request email change
POST /api/user-auth/verify-email-change   # Verify email change
POST /api/user-auth/request-phone-change  # Request phone change
POST /api/user-auth/verify-phone-change   # Verify phone change
GET  /api/user-auth/auth/status           # Get auth status
```

### Admin
```
POST /api/admin-auth/login                # Admin login
```

## 📝 Common Request Examples

### Register with Email
```json
POST /api/user-auth/register
{
  "email": "user@example.com"
}
```

### Register with Phone
```json
POST /api/user-auth/register
{
  "phoneNumber": "+911234567890"
}
```

### Verify OTP
```json
POST /api/user-auth/verify-email-otp
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Complete Profile
```json
POST /api/user-auth/complete-profile
{
  "userId": 123,
  "name": "John Doe",
  "password": "SecurePassword123"
}
```

### Login
```json
POST /api/user-auth/login
{
  "emailOrPhone": "user@example.com",
  "password": "SecurePassword123"
}
```

### Forgot Password
```json
POST /api/user-auth/forgot-password
{
  "emailOrPhone": "user@example.com"
}
```

### Reset Password
```json
POST /api/user-auth/reset-password
{
  "emailOrPhone": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123"
}
```

## 🔑 Using Protected Routes

Add JWT token in Authorization header:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

## 🔍 Import Functions Directly

### From Controllers
```javascript
import { 
  registerUser, 
  loginUser 
} from './user_modules/controllers/userController.js';

import { 
  forgotPassword, 
  resetPassword 
} from './user_modules/controllers/authController.js';

import { 
  requestEmailChange 
} from './user_modules/controllers/profileController.js';

import { 
  adminLogin 
} from './user_modules/controllers/adminController.js';
```

### From Services
```javascript
import { 
  createUser,
  findUserByEmail,
  findUserByPhone
} from './user_modules/services/userService.js';

import { 
  storeEmailOTP,
  verifyEmailOtpService 
} from './user_modules/services/otpService.js';
```

## 📊 Function Reference

### authController.js
- `forgotPassword(req, res)` - Send password reset OTP
- `resetPassword(req, res)` - Reset password with OTP

### userController.js
- `registerUser(req, res)` - Register new user
- `verifyEmailOtp(req, res)` - Verify email OTP
- `verifyPhoneOtp(req, res)` - Verify phone OTP
- `completeProfile(req, res)` - Complete user profile
- `loginUser(req, res)` - User login

### profileController.js
- `requestEmailChange(req, res)` - Request email change
- `verifyEmailChange(req, res)` - Verify email change
- `requestPhoneChange(req, res)` - Request phone change
- `verifyPhoneChange(req, res)` - Verify phone change

### adminController.js
- `adminLogin(req, res)` - Admin login

### userService.js
- `createUser(userData)` - Create user in DB
- `findUserByEmail(email)` - Find user by email
- `findUserByPhone(phone)` - Find user by phone
- `findUserById(id)` - Find user by ID
- `updateProfile(userId, data)` - Update profile
- `updateProfileCompletion(userId, data)` - Complete profile
- `verifyUserEmail(userId)` - Mark email verified
- `verifyUserPhone(userId)` - Mark phone verified

### otpService.js
- `storeEmailOTP(userId, otp, type)` - Store email OTP
- `verifyEmailOtpService(email, otp)` - Verify email OTP
- `verifyEmailOTPByUserId(userId, otp)` - Verify by user ID
- `storePhoneOTP(userId, otp, type)` - Store phone OTP
- `verifyPhoneOtpService(userId, otp)` - Verify phone OTP

## ⚡ Testing Commands (curl)

### Test Registration
```bash
curl -X POST http://localhost:3000/api/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"test@example.com","password":"Test123456"}'
```

### Test Password Reset
```bash
curl -X POST http://localhost:3000/api/user-auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"test@example.com"}'
```

## 🔒 Security Checklist

- ✅ OTP expires after 10 minutes
- ✅ Max 3 OTP attempts
- ✅ Rate limiting: 3 requests/minute
- ✅ Password min 10 chars, uppercase, number
- ✅ Bcrypt hashing with 12 rounds
- ✅ JWT token expiry: 7 days
- ✅ Input validation on all endpoints
- ✅ Protected routes require auth

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| JWT not working | Check JWT_SECRET matches |
| OTP not sent | Verify email/SMS services configured |
| Import errors | Check file paths are correct |
| Database errors | Verify Prisma is initialized |
| 401 errors | Check Authorization header |

## 📚 Documentation Files

1. **README.md** - Complete feature documentation
2. **MIGRATION_GUIDE.md** - Step-by-step integration
3. **INTEGRATION_EXAMPLE.js** - Code examples
4. **PROJECT_SUMMARY.md** - Overview of what was created
5. **QUICK_REFERENCE.md** - This file!

## 💡 Tips

- Use Postman/Insomnia for testing
- Check logs for detailed error messages
- Test on staging before production
- Keep JWT_SECRET secure
- Monitor OTP delivery rates
- Implement rate limiting at API gateway

## 🎯 Common Workflows

### New User Registration (Email)
1. POST /register → Get userId
2. POST /verify-email-otp → Verify OTP
3. POST /complete-profile → Set name/password
4. POST /login → Get JWT token

### New User Registration (Phone)
1. POST /register → Get userId
2. POST /verify-phone-otp → Verify OTP
3. POST /complete-profile → Set name/password
4. POST /login → Get JWT token

### Password Reset
1. POST /forgot-password → Get OTP
2. POST /reset-password → Reset with OTP

### Email Change (Authenticated)
1. POST /request-email-change → Get OTP
2. POST /verify-email-change → Verify OTP

---

**Keep this file handy for quick reference!** 📌
