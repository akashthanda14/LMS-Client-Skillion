# Admin Login Testing Guide

## Summary of Changes

We've successfully **unified the login system** so that all users (Admin, Creator, Learner) use the same login page and endpoint.

### What Was Changed

✅ **Removed**:
- `/admin/login` route (deleted)
- `AdminLoginRequest` interface
- `authAPI.adminLogin()` method
- Admin-specific login directory

✅ **Updated**:
- All users now use `/login` page
- Single API endpoint: `POST /api/auth/login`
- Role-based routing happens after login
- Simplified 401 redirect (always goes to `/login`)

## How Admin Login Works Now

### 1. Admin Login Flow

```
Admin User → Navigate to /login (NOT /admin/login)
                      ↓
            Enter email & password
                      ↓
          POST /api/auth/login
                      ↓
     Backend returns JWT + user object
        { token, user: { role: "ADMIN" } }
                      ↓
        Frontend stores token + user
                      ↓
      LoginForm checks user.role === 'ADMIN'
                      ↓
     Redirects to /admin/dashboard
                      ↓
   AuthenticatedLayout checks allowedRoles
                      ↓
        Dashboard loads successfully
```

### 2. Testing Admin Login

**Step 1**: Open the login page
```
http://localhost:3000/login
```

**Step 2**: Enter admin credentials
```
Email: admin@example.com (or your admin email)
Password: [your-admin-password]
```

**Step 3**: Check console logs
After clicking "Sign In", you should see:
```
LoginForm: Starting login with data: { emailOrPhone: "admin@example.com" }
LoginForm: Login successful, user role: ADMIN
LoginForm: Redirecting to /admin/dashboard
ProtectedRoute: State check - user: {...} isAuthenticated: true
ProtectedRoute: Access granted. User role: ADMIN
```

**Step 4**: Verify redirect
You should be automatically redirected to:
```
http://localhost:3000/admin/dashboard
```

## Troubleshooting

### Issue: "Route not found" or 404 error

**Check 1**: Make sure the server is running
```bash
npm run dev
```

**Check 2**: Check browser console for errors
- Open DevTools (F12 or Cmd+Option+I)
- Look at Console tab for any red errors

**Check 3**: Check Network tab
- Open DevTools → Network tab
- Click "Sign In"
- Look for the `POST /api/auth/login` request
- Check if it returns 200 with user data

**Check 4**: Verify user role in response
The login response should include:
```json
{
  "success": true,
  "token": "jwt-token...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "ADMIN",  ← This must be "ADMIN"
    "name": "..."
  }
}
```

### Issue: Redirects back to /login

**Cause**: User is not authenticated or role is not ADMIN

**Solution**:
1. Clear browser storage:
   - Open DevTools → Application tab
   - Clear all localStorage items
   - Clear all cookies
2. Try logging in again
3. Check console logs to see where it fails

### Issue: "Access Denied" message

**Cause**: User is logged in but role is not ADMIN

**Solution**: 
- Check the database - make sure the user has `role: "ADMIN"`
- If role is wrong, update in database:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## Console Debugging

The app has extensive console logging to help debug issues:

### LoginForm logs:
```
LoginForm: Starting login with data: {...}
LoginForm: Login successful, user role: ADMIN
LoginForm: Redirecting to /admin/dashboard
```

### AuthContext logs:
```
checkAuth: token exists? true
checkAuth: calling /api/auth/me
checkAuth: success, user: {...}
```

### ProtectedRoute logs:
```
ProtectedRoute: State check - user: {...} isAuthenticated: true isLoading: false
ProtectedRoute: User exists and authenticated, skipping checkAuth
ProtectedRoute: Before render checks - isLoading: false
ProtectedRoute: Access granted. User role: ADMIN
```

## File Structure

After consolidation, the structure is:

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          ← Single login page for all users
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx          ← Admin dashboard
│   │   ├── review/
│   │   │   ├── creators/
│   │   │   │   └── page.tsx      ← Creator review page
│   │   │   └── courses/
│   │   │       └── page.tsx      ← Course review page
│   │   └── page.tsx              ← Redirects /admin → /admin/dashboard
│   └── ...
├── components/
│   └── auth/
│       ├── LoginForm.tsx         ← Login form with role-based routing
│       ├── ProtectedRoute.tsx    ← Role-based access control
│       └── AuthenticatedLayout.tsx
├── contexts/
│   └── AuthContext.tsx           ← Auth state management
└── lib/
    └── api.ts                    ← API client (single login method)
```

## Quick Test Commands

### 1. Check if server is running
```bash
npm run dev
```
Should show:
```
✓ Ready in 1063ms
- Local: http://localhost:3000
```

### 2. Check if admin dashboard page exists
```bash
ls -la src/app/admin/dashboard/page.tsx
```
Should show the file exists

### 3. Check if old admin login is removed
```bash
ls -la src/app/admin/login/
```
Should show: `No such file or directory` (this is correct!)

### 4. Test the endpoint directly
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"admin@example.com","password":"yourpassword"}'
```

## Expected Behavior

✅ **Correct**:
1. Navigate to `/login` (not `/admin/login`)
2. Enter admin credentials
3. Click "Sign In"
4. See success message
5. Automatically redirect to `/admin/dashboard`
6. Dashboard loads with admin metrics

❌ **Incorrect**:
- Trying to go to `/admin/login` (page doesn't exist)
- Getting "Route not found" for `/admin/dashboard`
- Stuck in redirect loop
- "Access Denied" message

## Key Points

1. **There is NO `/admin/login` page anymore** - Use `/login` for everyone
2. **The backend determines the user's role** - Not the frontend
3. **Role-based routing happens AFTER login** - LoginForm component handles this
4. **All 401 errors redirect to `/login`** - Single unified redirect

## Testing Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Can access `http://localhost:3000/login`
- [ ] Can enter admin credentials
- [ ] Login succeeds (check Network tab for 200 response)
- [ ] Console shows "LoginForm: Redirecting to /admin/dashboard"
- [ ] Browser URL changes to `/admin/dashboard`
- [ ] Dashboard content loads
- [ ] Navigation shows admin links
- [ ] Can navigate to creator/course review pages

## Need Help?

If you're still seeing "route not found" errors:

1. **Share the exact error message** from the console
2. **Share the Network tab** - what does the login response show?
3. **Share the console logs** - what do the ProtectedRoute logs show?
4. **Check the URL** - are you trying to go to `/admin/login` (wrong) or `/admin/dashboard` (correct)?

The most common issue is trying to access the old `/admin/login` route which no longer exists. Always use `/login` for all users now!
