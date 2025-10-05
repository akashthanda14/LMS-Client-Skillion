# Unified Login System

## Overview

The application uses a **single unified login system** for all user types (Admin, Creator, Learner). There is no separate admin login route or endpoint.

## Key Changes

### ✅ Removed
- ❌ `/admin/login` route (deleted)
- ❌ `AdminLoginRequest` interface
- ❌ `authAPI.adminLogin()` method
- ❌ Separate admin login endpoint calls

### ✅ Unified System
- ✅ Single login page: `/login` for **all users**
- ✅ Single API endpoint: `POST /api/auth/login`
- ✅ Role-based routing after authentication
- ✅ Simplified 401 redirect logic

## How It Works

### 1. Login Flow

```
User (Admin/Creator/Learner) → /login
                                  ↓
                       LoginForm component
                                  ↓
                    POST /api/auth/login
                      { emailOrPhone, password }
                                  ↓
                    Backend returns JWT + user object
                       { token, user: { role } }
                                  ↓
                    Frontend stores token + user
                                  ↓
              Role-based redirect in LoginForm:
                                  ↓
        ┌──────────────────────┬─────────────────────┐
        ↓                      ↓                     ↓
    ADMIN                   CREATOR              LEARNER
/admin/dashboard      /creator/dashboard       /courses
```

### 2. Authentication Components

**Login Page**: `src/app/(auth)/login/page.tsx`
```tsx
// Simple wrapper that renders LoginForm
export default function LoginPage() {
  return <LoginForm />;
}
```

**Login Form**: `src/components/auth/LoginForm.tsx`
```tsx
// Handles login for all user types with role-based routing
const onSubmit = async (data: LoginFormData) => {
  const user = await login(data);
  
  // Role-based redirect
  if (user?.role === 'ADMIN') {
    router.replace('/admin/dashboard');
  } else if (user?.role === 'CREATOR') {
    router.replace('/creator/dashboard');  
  } else {
    router.replace('/courses');
  }
};
```

**API Client**: `src/lib/api.ts`
```tsx
// Single login method for all users
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/user-auth/login', data);
    return response.data;
  },
};

// LoginRequest interface
export interface LoginRequest {
  emailOrPhone: string;  // Works for email or phone
  password: string;
}
```

### 3. Authorization & Protection

**Route Protection**: `src/components/auth/ProtectedRoute.tsx`
```tsx
// Checks user role for authorized access
<ProtectedRoute allowedRoles={['ADMIN']}>
  {children}
</ProtectedRoute>

// Redirects to /login if not authenticated
if (!isAuthenticated) {
  router.push('/login');
}
```

**401 Interceptor**: `src/lib/api.ts`
```tsx
// All 401 errors redirect to single /login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-user');
      window.location.href = '/login';  // Single redirect
    }
    return Promise.reject(error);
  }
);
```

## Admin Access

### Testing Admin Login

1. **Navigate to**: `http://localhost:3000/login`
2. **Use admin credentials**:
   ```
   Email: admin@example.com
   Password: [admin-password]
   ```
3. **Automatic redirect** to `/admin/dashboard`

### Important Notes

- ✅ Admins use the **same login page** as all users
- ✅ Database determines user role
- ✅ Frontend routes based on role after authentication
- ✅ No separate admin authentication endpoint needed
- ✅ Simpler, more maintainable architecture

## Role-Based Dashboards

| Role      | Default Redirect After Login |
|-----------|------------------------------|
| `ADMIN`   | `/admin/dashboard`           |
| `CREATOR` | `/creator/dashboard`         |
| `LEARNER` | `/courses`                   |

## API Specification

### Login Endpoint

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "emailOrPhone": "admin@example.com",  // or phone number
  "password": "yourpassword"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "ADMIN",  // or CREATOR, LEARNER
    "isVerified": true
  }
}
```

## Migration Notes

### Before (Dual Login System)
```
/login         → User login (POST /api/user-auth/login)
/admin/login   → Admin login (POST /api/admin-auth/login)
```

### After (Unified Login)
```
/login         → All users (POST /api/auth/login)
                 Role-based routing after authentication
```

### Benefits of Unified System

1. **Simpler Architecture**
   - Single login page
   - Single authentication endpoint
   - Less code to maintain

2. **Better UX**
   - Consistent login experience
   - No confusion about which login to use
   - Same password reset flow for all

3. **Easier Maintenance**
   - One place to update login logic
   - Single source of truth
   - Less duplication

4. **Flexible Role Management**
   - Backend controls roles
   - Easy to add new roles
   - No frontend changes needed for new role types

## Related Files

### Components
- `src/app/(auth)/login/page.tsx` - Login page (all users)
- `src/components/auth/LoginForm.tsx` - Login form with role-based routing
- `src/components/auth/ProtectedRoute.tsx` - Route protection by role

### API & Types
- `src/lib/api.ts` - API client with single login method
- `src/contexts/AuthContext.tsx` - Auth state management

### Admin Dashboard
- `src/app/admin/dashboard/page.tsx` - Admin dashboard
- `src/app/admin/review/creators/page.tsx` - Creator reviews
- `src/app/admin/review/courses/page.tsx` - Course reviews

## Troubleshooting

### Issue: "Can't access admin dashboard"
**Solution**: Make sure you're logging in with an account that has `role: "ADMIN"` in the database.

### Issue: "Redirected to wrong dashboard"
**Solution**: Check the `user.role` value. The LoginForm component routes based on this.

### Issue: "401 redirect not working"
**Solution**: The axios interceptor automatically redirects all 401 errors to `/login`.

## Summary

The unified login system simplifies authentication by:
- ✅ Using one login page for all users
- ✅ Letting the backend determine roles
- ✅ Routing users after login based on their role
- ✅ Maintaining consistent UX across all user types

**For admin access**: Just use the standard `/login` page with admin credentials!
