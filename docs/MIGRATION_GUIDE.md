# Migration Guide - Integrating user_modules

This guide will help you integrate the new `user_modules` folder into your existing server.

## 📋 Overview

The `user_modules` folder contains a reorganized and modular approach to user authentication. This guide covers:
1. How to integrate the new routes
2. How to update your existing code
3. How to test the new endpoints

## 🔧 Step 1: Update server.js

Add the new routes to your main server file (`server.js`):

```javascript
// Import the new user authentication routes
import userAuthRoutes from './user_modules/routes/userRoutes.js';
import adminAuthRoutes from './user_modules/routes/adminRoutes.js';

// Register the routes (add these lines after your existing route registrations)
app.use('/api/user-auth', userAuthRoutes);    // New modular user routes
app.use('/api/admin-auth', adminAuthRoutes);  // New modular admin routes

// Keep your existing routes for backward compatibility:
// app.use('/api/user', userRoute);  // Existing routes
// app.use('/api/admin', adminRoute); // Existing routes
```

## 🔄 Step 2: Route Mapping (Old vs New)

Here's how the old routes map to the new structure:

### User Routes

| Old Route | New Route | Controller Source |
|-----------|-----------|-------------------|
| `/api/user/register` | `/api/user-auth/register` | `user_modules/controllers/userController.js` |
| `/api/user/login` | `/api/user-auth/login` | `user_modules/controllers/userController.js` |
| `/api/user/forgot-password` | `/api/user-auth/forgot-password` | `user_modules/controllers/authController.js` |
| `/api/user/reset-password` | `/api/user-auth/reset-password` | `user_modules/controllers/authController.js` |
| `/api/user/verify-email-otp` | `/api/user-auth/verify-email-otp` | `user_modules/controllers/userController.js` |
| `/api/user/verify-phone-otp` | `/api/user-auth/verify-phone-otp` | `user_modules/controllers/userController.js` |
| `/api/user/complete-profile` | `/api/user-auth/complete-profile` | `user_modules/controllers/userController.js` |
| `/api/user/request-email-change` | `/api/user-auth/request-email-change` | `user_modules/controllers/profileController.js` |
| `/api/user/verify-email-change` | `/api/user-auth/verify-email-change` | `user_modules/controllers/profileController.js` |
| `/api/user/request-phone-change` | `/api/user-auth/request-phone-change` | `user_modules/controllers/profileController.js` |
| `/api/user/verify-phone-change` | `/api/user-auth/verify-phone-change` | `user_modules/controllers/profileController.js` |

### Admin Routes

| Old Route | New Route | Controller Source |
|-----------|-----------|-------------------|
| `/api/admin/login` | `/api/admin-auth/login` | `user_modules/controllers/adminController.js` |

## 🎯 Step 3: Testing the New Routes

### Test User Registration (Email)
```bash
curl -X POST http://localhost:3000/api/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test User Registration (Phone)
```bash
curl -X POST http://localhost:3000/api/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+911234567890"}'
```

### Test User Login
```bash
curl -X POST http://localhost:3000/api/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone": "test@example.com", "password": "YourPassword123"}'
```

### Test Forgot Password
```bash
curl -X POST http://localhost:3000/api/user-auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone": "test@example.com"}'
```

### Test Admin Login
```bash
curl -X POST http://localhost:3000/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin_password"}'
```

## 🔐 Step 4: Update Frontend/Client

If you have a frontend application, update the API endpoints:

### Before:
```javascript
// Old endpoint
const response = await fetch('/api/user/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});
```

### After:
```javascript
// New endpoint
const response = await fetch('/api/user-auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});
```

## 📦 Step 5: Gradual Migration Strategy

You can migrate gradually to minimize disruption:

### Option A: Run both old and new routes simultaneously
```javascript
// server.js

// New modular routes (preferred)
app.use('/api/user-auth', userAuthRoutes);
app.use('/api/admin-auth', adminAuthRoutes);

// Keep old routes for backward compatibility
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
```

### Option B: Redirect old routes to new ones
```javascript
// Add redirects in server.js
app.use('/api/user', (req, res, next) => {
  console.warn('Using deprecated route. Please update to /api/user-auth');
  next();
}, userAuthRoutes);
```

## 🧪 Step 6: Verify Database Operations

The new modules use the same Prisma models. Verify that:

1. ✅ User creation works
2. ✅ OTP storage and verification works
3. ✅ Email and phone verification works
4. ✅ Password reset works
5. ✅ Profile updates work

Run your existing database tests or create new ones:

```javascript
// Example test (using Jest or similar)
describe('User Registration', () => {
  it('should register a new user with email', async () => {
    const response = await request(app)
      .post('/api/user-auth/register')
      .send({ email: 'newuser@example.com' })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.userId).toBeDefined();
  });
});
```

## ⚠️ Important Notes

### Database Schema
- The new modules use the existing Prisma schema
- No database migrations are required
- Existing users will work with the new system

### Environment Variables
Ensure these are set:
```env
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_admin_password
```

### Middleware
The new routes use the existing middleware from:
- `middleware/authMiddleware.js`
- Other existing middleware in your project

### Services
The new modules reuse services from:
- `services/mailService.js` - For sending emails
- `services/smsService.js` - For sending SMS
- `services/tokenService.js` - For token management

## 🎉 Step 7: Remove Old Files (Optional)

Once you've tested and verified everything works, you can optionally remove the old files:

```bash
# Backup first!
mkdir backup
cp controllers/authController.js backup/
cp controllers/userController.js backup/
cp controllers/adminController.js backup/

# Then you can remove the old auth-related code from these files
# But keep the files if they have other functionality
```

## 🐛 Troubleshooting

### Issue: "Cannot find module"
**Solution**: Check your import paths. The new modules use relative paths from `user_modules/`.

### Issue: JWT token not working
**Solution**: Ensure `JWT_SECRET` is the same in both old and new implementations.

### Issue: OTP not being sent
**Solution**: Check email/SMS service configurations are properly imported.

### Issue: Database connection errors
**Solution**: Verify Prisma client is properly initialized in `lib/prisma.js`.

## 📚 Next Steps

1. ✅ Integrate the routes into server.js
2. ✅ Test all endpoints
3. ✅ Update your frontend API calls
4. ✅ Run integration tests
5. ✅ Monitor logs for any issues
6. ✅ Update API documentation
7. ✅ Deploy to staging environment first

## 🆘 Need Help?

If you encounter issues:
1. Check the logs in `logs/app.log`
2. Review the README in `user_modules/README.md`
3. Check the controller-specific error messages
4. Verify middleware is properly configured

## 📈 Benefits of the New Structure

✅ **Modular**: Easy to maintain and extend  
✅ **Organized**: Clear separation of concerns  
✅ **Scalable**: Easy to add new features  
✅ **Testable**: Each module can be tested independently  
✅ **Documented**: Comprehensive documentation included  
✅ **Secure**: Enhanced security features built-in  

---

**Good luck with the migration!** 🚀
