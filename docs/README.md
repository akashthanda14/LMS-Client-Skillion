# User Modules - Authentication & User Management

This folder contains all user authentication and profile management functionality for the Dolchico server.

## 📁 Folder Structure

```
user_modules/
├── controllers/           # Request handlers
│   ├── authController.js      # Password reset & recovery
│   ├── userController.js      # Registration & login
│   ├── adminController.js     # Admin authentication
│   └── profileController.js   # Email & phone change
├── services/             # Business logic
│   ├── userService.js         # User database operations
│   └── otpService.js          # OTP management
└── routes/               # API endpoints
    ├── userRoutes.js          # User auth routes
    └── adminRoutes.js         # Admin auth routes
```

## 🔐 Authentication Features

### User Registration & Login
- **Email Registration**: Register with email, receive verification link and OTP
- **Phone Registration**: Register with phone number, receive OTP via SMS
- **Login**: Login with email/phone and password
- **Profile Completion**: Complete profile after OTP verification

### Password Management
- **Forgot Password**: Request OTP for password reset
- **Reset Password**: Reset password using OTP verification
- **Supports**: Both email and phone number for password reset

### Email & Phone Change
- **Email Change**: Request and verify email change with OTP
- **Phone Change**: Request and verify phone number change with OTP
- **Protected Routes**: Requires authentication

### Admin Authentication
- **Admin Login**: Secure admin login using environment variables

## 🛣️ API Endpoints

### User Routes (`/api/user/`)

#### Registration & Verification
```
POST /register              - Register new user with email or phone
POST /send-otp              - Alias for registration (send OTP)
POST /verify-email-otp      - Verify email OTP
POST /verify-phone-otp      - Verify phone OTP
POST /verify-otp            - Unified OTP verification
POST /complete-profile      - Complete user profile after verification
```

#### Login & Authentication
```
POST /login                 - Login with email/phone and password
GET  /auth/status           - Get current authentication status
POST /auth/resend-otp       - Resend OTP for verification
```

#### Password Management
```
POST /forgot-password       - Request password reset OTP
POST /reset-password        - Reset password with OTP
```

#### Email & Phone Change (Protected)
```
POST /request-email-change  - Request email change (requires auth)
POST /verify-email-change   - Verify email change with OTP
POST /request-phone-change  - Request phone change (requires auth)
POST /verify-phone-change   - Verify phone change with OTP
```

### Admin Routes (`/api/admin/`)

```
POST /login                 - Admin login
```

## 📝 Controllers

### authController.js
Handles password reset and recovery:
- `forgotPassword` - Sends OTP for password reset
- `resetPassword` - Verifies OTP and resets password

### userController.js
Handles user registration and login:
- `registerUser` - Registers new user with email or phone
- `verifyEmailOtp` - Verifies email OTP
- `verifyPhoneOtp` - Verifies phone OTP
- `completeProfile` - Completes user profile
- `loginUser` - Authenticates user login

### profileController.js
Handles profile changes:
- `requestEmailChange` - Initiates email change process
- `verifyEmailChange` - Completes email change
- `requestPhoneChange` - Initiates phone change process
- `verifyPhoneChange` - Completes phone change

### adminController.js
Handles admin authentication:
- `adminLogin` - Authenticates admin users

## 🔧 Services

### userService.js
Database operations for users:
- `createUser` - Creates new user
- `findUserByEmail` - Finds user by email
- `findUserByPhone` - Finds user by phone
- `findUserById` - Finds user by ID
- `updateProfile` - Updates user profile
- `updateProfileCompletion` - Completes user profile
- `verifyUserEmail` - Marks email as verified
- `verifyUserPhone` - Marks phone as verified

### otpService.js
OTP management:
- `storeEmailOTP` - Stores email OTP
- `verifyEmailOtpService` - Verifies email OTP
- `verifyEmailOTPByUserId` - Verifies email OTP by user ID
- `storePhoneOTP` - Stores phone OTP
- `verifyPhoneOtpService` - Verifies phone OTP

## 🔒 Security Features

1. **OTP Expiration**: All OTPs expire after 10 minutes
2. **Rate Limiting**: Maximum 3 OTP requests per minute
3. **Max Attempts**: Maximum 3 verification attempts per OTP
4. **Password Requirements**:
   - Minimum 10 characters
   - At least one uppercase letter
   - At least one number
5. **JWT Authentication**: Secure token-based authentication
6. **Bcrypt Hashing**: Password hashing with salt rounds

## 📦 Dependencies

External dependencies used by user_modules:
- `bcryptjs` / `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation
- `validator` - Input validation
- `@prisma/client` - Database operations

Shared services (from parent project):
- `mailService.js` - Email sending
- `smsService.js` - SMS sending
- `tokenService.js` - Token management
- `authMiddleware.js` - Authentication middleware

## 🚀 Usage

### Import routes in your main server file:

```javascript
import userRoutes from './user_modules/routes/userRoutes.js';
import adminRoutes from './user_modules/routes/adminRoutes.js';

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
```

### Example: User Registration with Email

```javascript
POST /api/user/register
Content-Type: application/json

{
  "email": "user@example.com"
}

// Response:
{
  "success": true,
  "message": "Registration successful. Check your email for verification.",
  "userId": 123,
  "verificationType": "email",
  "contactInfo": "user@example.com",
  "requiresProfileCompletion": true
}
```

### Example: Password Reset

```javascript
// Step 1: Request OTP
POST /api/user/forgot-password
{
  "emailOrPhone": "user@example.com"
}

// Step 2: Reset with OTP
POST /api/user/reset-password
{
  "emailOrPhone": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123"
}
```

## 🔄 Flow Diagrams

### Email Registration Flow
```
1. POST /register { email }
   → Creates user
   → Sends verification email with OTP
   
2. POST /verify-email-otp { email, otp }
   → Verifies OTP
   → Marks email as verified
   → Returns userId
   
3. POST /complete-profile { userId, name, password }
   → Updates profile
   → Returns JWT token
```

### Phone Registration Flow
```
1. POST /register { phoneNumber }
   → Creates user
   → Sends OTP via SMS
   
2. POST /verify-phone-otp { phoneNumber, otp }
   → Verifies OTP
   → Marks phone as verified
   → Returns userId
   
3. POST /complete-profile { userId, name, password }
   → Updates profile
   → Returns JWT token
```

### Password Reset Flow
```
1. POST /forgot-password { emailOrPhone }
   → Generates OTP
   → Sends OTP via email/SMS
   
2. POST /reset-password { emailOrPhone, otp, newPassword }
   → Verifies OTP
   → Updates password
   → Returns JWT token
```

## 📄 Environment Variables

Required environment variables:
```
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_admin_password
```

## 🧪 Testing

Each controller includes comprehensive error handling:
- Input validation
- Database error handling
- Rate limiting checks
- Security validations

## 📞 Support

For issues or questions about user authentication:
1. Check the API endpoint documentation above
2. Review error messages in the response
3. Check server logs for detailed error information

## 🔐 Best Practices

1. Always use HTTPS in production
2. Keep JWT_SECRET secure and never commit to version control
3. Implement rate limiting at the API gateway level
4. Monitor failed login attempts
5. Regularly rotate admin credentials
6. Use strong password policies
7. Implement 2FA for admin accounts (future enhancement)

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Maintained by**: Dolchico Development Team
