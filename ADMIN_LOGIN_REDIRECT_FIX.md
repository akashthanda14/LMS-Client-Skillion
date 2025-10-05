# Admin Login Redirect Fix

## Issue
After successful admin login, the app was redirecting back to the login page instead of staying on the admin dashboard.

## Root Causes

### 1. Missing User Data in localStorage
The admin login was only storing the `token` but not the `user` object in localStorage. The `AuthContext`'s `checkAuth()` function looks for both:
- `token` in localStorage
- `auth-user` in localStorage

When `ProtectedRoute` called `checkAuth()` after redirect, it couldn't find the user data and redirected back to login.

### 2. AuthContext Not Updated Immediately
After login, the redirect happened before the AuthContext state was updated, causing `ProtectedRoute` to see an unauthenticated state.

### 3. Wrong Redirect on 401
The axios interceptor was redirecting all 401 errors to `/login`, including admin users who should go to `/admin/login`.

## Fixes Applied

### Fix 1: Store Complete Auth Data
**File**: `src/app/admin/login/page.tsx`

```typescript
// BEFORE (Wrong)
localStorage.setItem('token', response.token);

// AFTER (Correct)
localStorage.setItem('token', response.token);
localStorage.setItem('auth-user', JSON.stringify(response.user));
```

### Fix 2: Update AuthContext Immediately
**File**: `src/app/admin/login/page.tsx`

Added immediate AuthContext update before redirect:

```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
  const { updateUser } = useAuth();
  
  // In handleSubmit:
  if (response.success && response.token && response.user) {
    // Store in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('auth-user', JSON.stringify(response.user));
    
    // Update AuthContext immediately ← NEW
    updateUser(response.user);
    
    // Wait for state sync
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Now safe to redirect
    router.push('/admin/dashboard');
  }
}
```

### Fix 3: Smart 401 Redirect
**File**: `src/lib/api.ts`

```typescript
// BEFORE (Wrong)
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login'; // Always goes to /login
}

// AFTER (Correct)
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('auth-user');
  
  // Check if current path is admin-related
  const isAdminPath = window.location.pathname.startsWith('/admin');
  window.location.href = isAdminPath ? '/admin/login' : '/login';
}
```

### Fix 4: Improved updateUser Function
**File**: `src/contexts/AuthContext.tsx`

```typescript
// BEFORE (Wrong - relied on state.token)
const updateUser = useCallback((user: User) => {
  localStorage.setItem('auth-user', JSON.stringify(user));
  dispatch({
    type: 'SET_USER',
    payload: { user, token: state.token! } // Could be null!
  });
}, [state.token]);

// AFTER (Correct - reads from localStorage)
const updateUser = useCallback((user: User) => {
  const token = localStorage.getItem('token');
  if (token) {
    localStorage.setItem('auth-user', JSON.stringify(user));
    dispatch({
      type: 'SET_USER',
      payload: { user, token }
    });
  }
}, []);
```

## Flow After Fix

### Successful Admin Login Flow:
```
1. User enters credentials at /admin/login
   ↓
2. POST /api/admin-auth/login
   ↓
3. Response: { success: true, token: "...", user: { role: "ADMIN", ... } }
   ↓
4. Store in localStorage:
   - token: "..."
   - auth-user: { role: "ADMIN", ... }
   ↓
5. Update AuthContext state immediately
   - user: { role: "ADMIN", ... }
   - token: "..."
   - isAuthenticated: true
   ↓
6. Wait 100ms for state sync
   ↓
7. Redirect to /admin/dashboard
   ↓
8. ProtectedRoute checks:
   - isAuthenticated: ✅ true
   - user.role: ✅ "ADMIN"
   - allowedRoles: ✅ includes "ADMIN"
   ↓
9. Dashboard renders successfully ✅
```

### What Happens on 401 Error (Token Expired):
```
1. API call returns 401
   ↓
2. Axios interceptor:
   - Clears localStorage (token + auth-user)
   - Checks current path
   ↓
3. If path starts with /admin:
   → Redirect to /admin/login
   
   If regular user path:
   → Redirect to /login
```

## Testing

### Manual Test Steps:
1. Navigate to `http://localhost:3001/admin/login`
2. Enter credentials:
   - Email: `admin@microcourses.com`
   - Password: `password123`
3. Click "Sign In as Admin"
4. **Expected**: Redirects to `/admin/dashboard` and stays there
5. **Expected**: Can see admin metrics and navigate admin sections
6. **Expected**: "Admin Panel" link visible in navigation with red "admin" badge

### Browser Console Verification:
```javascript
// After login, check:
localStorage.getItem('token') // Should have JWT token
localStorage.getItem('auth-user') // Should have user object with role: "ADMIN"

// Parse user:
JSON.parse(localStorage.getItem('auth-user'))
// Should show: { id: "...", email: "admin@microcourses.com", role: "ADMIN", ... }
```

## Related Files Modified

1. `src/app/admin/login/page.tsx`
   - Added `useAuth` hook
   - Store both token and user in localStorage
   - Call `updateUser()` before redirect
   - Added console logs for debugging

2. `src/lib/api.ts`
   - Updated 401 interceptor for smart redirect
   - Clears both token and auth-user on 401

3. `src/contexts/AuthContext.tsx`
   - Fixed `updateUser` to read token from localStorage
   - Removed dependency on `state.token`

## Console Debug Messages

After fix, you'll see in browser console:
```
Admin login successful: { id: "...", role: "ADMIN", ... }
Redirecting to /admin/dashboard
ProtectedRoute: User exists and authenticated, skipping checkAuth
ProtectedRoute: Access granted. User role: ADMIN
```

## Verification Checklist

- [x] Admin login stores token in localStorage
- [x] Admin login stores user in localStorage
- [x] Admin login updates AuthContext immediately
- [x] Redirect waits for state sync (100ms delay)
- [x] ProtectedRoute recognizes authenticated admin
- [x] No redirect loop to /admin/login
- [x] 401 errors redirect admin users to /admin/login
- [x] No TypeScript errors

## Summary

The admin login redirect issue was caused by incomplete state synchronization. The fix ensures:
1. Complete auth data (token + user) is stored in localStorage
2. AuthContext state is updated before navigation
3. 401 errors redirect to the correct login page based on user type
4. State sync delay prevents race conditions

**Status**: ✅ Fixed - Admin login now works correctly with proper redirect to dashboard.
