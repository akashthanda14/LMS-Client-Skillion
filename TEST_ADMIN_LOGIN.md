# Admin Login API Test

## ✅ Current Implementation Status

### Frontend Configuration
**File**: `src/lib/api.ts`
```typescript
// Admin login payload uses only email (backend: POST /api/admin-auth/login)
export interface AdminLoginRequest {
  email: string;
  password: string;
}

// Auth API - adminLogin method
adminLogin: async (data: AdminLoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/admin-auth/login', data);
  return response.data;
}
```

**File**: `src/app/admin/login/page.tsx`
```typescript
const response = await authAPI.adminLogin({ 
  email,        // ✅ Uses 'email' key
  password      // ✅ Uses 'password' key
});
```

### Backend Expectation
**Endpoint**: `POST /api/admin-auth/login`
**Expected Payload**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### ✅ Verification
- ✅ Frontend sends `{ email, password }` - NOT `{ emailOrPhone, password }`
- ✅ API method uses `AdminLoginRequest` type
- ✅ No TypeScript errors
- ✅ Matches backend API documentation

---

## 🧪 Manual Test

### Using curl:
```bash
curl -X POST http://localhost:4000/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@microcourses.com",
    "password": "password123"
  }'
```

### Using Browser DevTools:
1. Open `http://localhost:3001/admin/login`
2. Open DevTools → Network tab
3. Enter email: `admin@microcourses.com`
4. Enter password: `password123`
5. Click "Sign In as Admin"
6. Check Network tab → Find `admin-auth/login` request
7. Verify Request Payload shows:
   ```json
   {
     "email": "admin@microcourses.com",
     "password": "password123"
   }
   ```

---

## 📝 Test Credentials (from docs)

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@microcourses.com | password123 |

---

## 🔍 What Changed

### Before (Incorrect):
```typescript
// Wrong - was using emailOrPhone
const response = await authAPI.adminLogin({ 
  emailOrPhone: email,  // ❌ Wrong key
  password 
});
```

### After (Correct):
```typescript
// Correct - using email only
const response = await authAPI.adminLogin({ 
  email,               // ✅ Correct key
  password 
});
```

---

## ✅ Confirmation

The admin login API is **correctly configured** and sends only `email` and `password` in the request payload, matching the backend expectation of `POST /api/admin-auth/login`.

**No changes needed** - the implementation is already correct!
