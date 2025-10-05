# Admin Panel Access Guide

## 🔐 How to Access the Admin Panel

### Method 1: Direct URL Access (Recommended for Initial Setup)
Navigate directly to the admin login page:
```
http://localhost:3001/admin/login
```

**What happens:**
1. You'll see the Admin Portal login page with a shield icon
2. Enter your admin credentials (email/phone and password)
3. Upon successful login, you'll be redirected to `/admin/dashboard`
4. Your JWT token will be stored in localStorage

### Method 2: Via Navigation Menu (After Login)
Once logged in as an admin user:

1. **Look at the top navigation bar** - You'll see:
   - Dashboard
   - Browse Courses
   - My Learning
   - My Progress
   - Creator Dashboard (if you're also a creator)
   - **Admin Panel** ← Click this!

2. The "Admin Panel" link is **only visible** if your user role is `ADMIN`

3. Your role badge will show in **red** with "admin" text

### Method 3: Manual URL Navigation
If you're already logged in with an admin account, you can directly visit:
- `/admin` - Redirects to dashboard
- `/admin/dashboard` - Main admin dashboard
- `/admin/review/creators` - Review creator applications
- `/admin/review/courses` - Review pending courses

---

## 🎯 Admin Panel Routes

### Public Route (No Auth Required)
- `/admin/login` - Admin login portal

### Protected Routes (Require ADMIN Role)
All these routes are protected by `AuthenticatedLayout` with `allowedRoles={['ADMIN']}`:

| Route | Purpose | Features |
|-------|---------|----------|
| `/admin` | Root redirect | Automatically redirects to `/admin/dashboard` |
| `/admin/dashboard` | Main dashboard | View metrics, pending counts, quick actions |
| `/admin/review/creators` | Creator applications | Approve/reject creator applications |
| `/admin/review/courses` | Course review | Publish/reject submitted courses |

---

## 👤 User Role Requirements

### To Access Admin Panel:
Your user account **must have** `role: 'ADMIN'` in the database.

### Role Hierarchy:
```
LEARNER   → Can browse and enroll in courses
CREATOR   → Can create courses + all LEARNER permissions
ADMIN     → Full platform access + all CREATOR permissions
```

### Check Your Role:
1. Look at the navigation bar - your role badge shows your current role
2. Role badge colors:
   - 🔴 Red = ADMIN
   - 🔵 Blue = CREATOR
   - 🟢 Green = LEARNER

---

## 🔑 Authentication Flow

### 1. Admin Login Process
```
User navigates to /admin/login
      ↓
Enters credentials (email + password only — phone not accepted for admin login)
      ↓
Frontend calls: POST /api/admin/login
      ↓
Backend validates credentials + checks role === 'ADMIN'
      ↓
Returns JWT token if valid
      ↓
Token stored in localStorage
      ↓
Redirect to /admin/dashboard
```

### 2. Protected Route Access
```
User visits /admin/dashboard
      ↓
AuthenticatedLayout checks:
  - Is there a valid token in localStorage?
  - Does the user have role: 'ADMIN'?
      ↓
If YES: Show admin dashboard
If NO: Redirect to /login or show error
```

### 3. JWT Token Structure
The token contains:
```json
{
  "userId": "user_id",
  "role": "ADMIN",
  "email": "admin@example.com",
  "exp": 1728000000
}
```

---

## 🛡️ Security Features

### 1. Role-Based Access Control (RBAC)
- Frontend checks user role before rendering admin UI
- Backend validates role on every API request
- Non-admin users cannot access admin routes

### 2. Route Protection
```tsx
<AuthenticatedLayout allowedRoles={['ADMIN']}>
  {/* Admin content here */}
</AuthenticatedLayout>
```

### 3. API Protection
All admin API endpoints require:
- Valid JWT token in `Authorization: Bearer <token>` header
- User role must be `ADMIN`
- Backend middleware: `ensureAuth` + `requireAdmin`

### 4. Automatic Redirection
- If not logged in → Redirect to `/login`
- If logged in but not admin → Show "Access Denied" message
- If token expired → Prompt to re-login

---

## 📊 Admin Dashboard Features

### Main Dashboard (`/admin/dashboard`)
**Metrics Displayed:**
- Total Users
- Total Creators
- Total Courses
- Published Courses
- Total Enrollments
- Pending Applications (with alert badge)
- Pending Courses (with alert badge)

**Quick Actions:**
1. **Review Creator Applications**
   - Shows count of pending applications
   - Direct link to review page
   - Yellow notification badge if pending items

2. **Review Pending Courses**
   - Shows count of pending courses
   - Direct link to review page
   - Yellow notification badge if pending items

### Creator Applications Review (`/admin/review/creators`)
**Features:**
- View all pending creator applications
- See applicant details (name, email, bio, portfolio, experience)
- **Approve** - Grant CREATOR role
- **Reject** - Provide reason (minimum 10 characters)
- Optimistic updates (instant UI feedback)

### Course Review (`/admin/review/courses`)
**Features:**
- View all courses submitted for review
- See course details (title, description, creator, lesson count)
- **Publish** - Make course public
- **Reject** - Provide feedback (minimum 10 characters)
- Optimistic updates (instant UI feedback)

---

## 🚀 First-Time Setup

### Step 1: Create Admin Account
You need a user account with `role: 'ADMIN'` in your database.

**Option A: Via Backend Script**
```sql
-- Update existing user to admin
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';
```

**Option B: Via Backend API** (if you have a seed script)
```typescript
// Create admin user
await prisma.user.create({
  data: {
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'ADMIN',
    emailVerified: true,
    // other required fields
  }
});
```

### Step 2: Access Admin Login
1. Navigate to `http://localhost:3001/admin/login`
2. Enter your admin credentials
3. Click "Sign In as Admin"

### Step 3: Verify Access
After successful login:
- ✅ You should see "admin" badge in red on the navigation
- ✅ "Admin Panel" link should appear in navigation
- ✅ You should be redirected to `/admin/dashboard`
- ✅ Dashboard should show metrics and quick actions

---

## 🔧 Troubleshooting

### Issue 1: "Access Denied" or Not Redirecting
**Possible Causes:**
- Your user role is not `ADMIN`
- Token is expired or invalid
- Not logged in

**Solution:**
1. Check your user role in the database
2. Clear localStorage and login again
3. Verify backend is returning correct role in JWT

### Issue 2: "Admin Panel" Link Not Showing
**Cause:** Your user role is not `ADMIN`

**Solution:**
```sql
-- Verify your role
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';

-- Update to admin if needed
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### Issue 3: 401 Unauthorized on Admin APIs
**Possible Causes:**
- JWT token missing or expired
- Backend not recognizing admin role

**Solution:**
1. Check browser console for token
2. Verify `Authorization` header is being sent
3. Check backend logs for authentication errors
4. Re-login to get fresh token

### Issue 4: Empty Dashboard
**Cause:** Backend API not returning data

**Solution:**
1. Check browser Network tab for API calls
2. Verify backend `/api/admin/metrics` endpoint is working
3. Check backend logs for errors
4. Ensure database has data to display

---

## 📱 Browser Storage

### localStorage Keys:
```
token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### To Debug:
```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));

// Decode JWT (without verification)
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('User Role:', payload.role);
console.log('Token Expires:', new Date(payload.exp * 1000));
```

---

## 🎨 UI Indicators

### Admin User Indicators:
1. **Role Badge**: Red badge with "admin" text
2. **Navigation Link**: "Admin Panel" link visible
3. **Dashboard Access**: Can see admin-specific metrics

### Non-Admin User:
1. **Role Badge**: Green (learner) or Blue (creator)
2. **Navigation Link**: No "Admin Panel" link
3. **Dashboard Access**: Redirect or access denied if trying to access `/admin/*`

---

## 📖 Example Access Scenarios

### Scenario 1: First-Time Admin Access
```
1. Backend creates user with role='ADMIN'
2. User navigates to http://localhost:3001/admin/login
3. Enters credentials: admin@example.com / password123
4. System validates → Returns JWT with role='ADMIN'
5. Frontend stores token → Redirects to /admin/dashboard
6. User sees metrics and can review applications/courses
```

### Scenario 2: Regular User Trying Admin Access
```
1. User with role='LEARNER' tries to visit /admin/dashboard
2. AuthenticatedLayout checks role
3. Role is not 'ADMIN' → Access denied
4. User sees error message or gets redirected
```

### Scenario 3: Admin Switching Between Sections
```
1. Admin logged in at /admin/dashboard
2. Clicks "Review Creator Applications"
3. Navigates to /admin/review/creators
4. Reviews and approves application
5. Clicks "Back" or navigates via menu
6. Returns to /admin/dashboard
7. Can access any admin section seamlessly
```

---

## 🔗 Related Files

### Frontend Files:
- `src/app/admin/login/page.tsx` - Login page
- `src/app/admin/dashboard/page.tsx` - Main dashboard
- `src/app/admin/review/creators/page.tsx` - Applications review
- `src/app/admin/review/courses/page.tsx` - Courses review
- `src/components/auth/Navigation.tsx` - Shows admin link
- `src/components/auth/AuthenticatedLayout.tsx` - Role protection
- `src/lib/api.ts` - Admin API methods

### Backend Files (for reference):
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/metrics` - Dashboard metrics
- `GET /api/admin/applications/pending` - Pending applications
- `GET /api/admin/courses/pending` - Pending courses
- `POST /api/admin/applications/:id/approve` - Approve application
- `POST /api/admin/applications/:id/reject` - Reject application
- `POST /api/admin/courses/:id/publish` - Publish course
- `POST /api/admin/courses/:id/reject` - Reject course

---

## ✅ Quick Checklist

Before accessing admin panel, ensure:
- [ ] Backend is running and accessible
- [ ] Admin user exists in database with `role='ADMIN'`
- [ ] Admin login endpoint (`/api/admin/login`) is working
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] You have the admin credentials (email/phone + password)

To access:
- [ ] Navigate to `http://localhost:3001/admin/login`
- [ ] Enter admin credentials
- [ ] Click "Sign In as Admin"
- [ ] Verify you're redirected to dashboard
- [ ] Check that "Admin Panel" link appears in navigation

---

## 🎯 Summary

**Direct Access URL**: `http://localhost:3001/admin/login`

**Requirements**:
- User account with `role='ADMIN'`
- Valid credentials (email/phone + password)
- Backend API running

**After Login**:
- Access via "Admin Panel" link in navigation
- Or directly visit `/admin/dashboard`, `/admin/review/creators`, `/admin/review/courses`

**Features Available**:
- View platform metrics
- Review and approve/reject creator applications
- Review and publish/reject courses
- All with optimistic updates and proper error handling

---

**Need Help?**
- Check browser console for errors
- Verify your user role in database
- Check backend logs for API errors
- Ensure JWT token is being sent with requests
- Clear localStorage and re-login if issues persist
