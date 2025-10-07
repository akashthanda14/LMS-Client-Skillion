# MicroCourses Development Guide

## Adding New Features

### 1. Creating New Protected Pages

To add a new page that requires authentication:

```tsx
// src/app/courses/page.tsx
'use client';

import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CoursesPage() {
  return (
    <AuthenticatedLayout>
      {/* Your page content */}
    </AuthenticatedLayout>
  );
}
```

### 2. Adding Role-Specific Pages

For pages that require specific roles:

```tsx
// src/app/admin/page.tsx
'use client';

import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AuthenticatedLayout>
        {/* Admin-only content */}
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
```

### 3. Adding New API Endpoints

Extend the API client in `src/lib/api.ts`:

```typescript
// Add new interface
export interface Course {
  id: string;
  title: string;
  description: string;
  creatorId: string;
}

// Add new API functions
export const courseAPI = {
  getCourses: async (): Promise<Course[]> => {
    const response = await api.get<Course[]>('/courses');
    return response.data;
  },
  
  createCourse: async (data: Omit<Course, 'id'>): Promise<Course> => {
    const response = await api.post<Course>('/courses', data);
    return response.data;
  },
};
```

### 4. Adding New Store Slices

Create additional Zustand stores:

```typescript
// src/store/courseStore.ts
import { create } from 'zustand';
import { courseAPI, Course } from '@/lib/api';

interface CourseState {
  courses: Course[];
  isLoading: boolean;
  fetchCourses: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  isLoading: false,
  
  fetchCourses: async () => {
    try {
      set({ isLoading: true });
      const courses = await courseAPI.getCourses();
      set({ courses, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
```

## Testing the Authentication Flow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Ensure your backend API is running on `http://localhost:4000`**

3. **Test the registration flow:**
   - Go to `/register`
   - Fill in the form with valid data
   - Submit and verify JWT token storage
   - Check redirect to dashboard

4. **Test the login flow:**
   - Go to `/login`
   - Use existing credentials
   - Verify successful authentication

5. **Test role-based access:**
   - Try accessing different routes with different user roles
   - Verify proper permission handling

## Customization Tips

### 1. Styling
- Modify Tailwind classes in components
- Update `src/app/globals.css` for global styles
- Customize ShadCN components in `src/components/ui/`

### 2. Navigation
- Update `navigationItems` in `src/components/auth/Navigation.tsx`
- Add new menu items with appropriate role restrictions

### 3. Form Validation
- Modify Zod schemas in auth forms
- Add new validation rules as needed

### 4. API Configuration
- Update `src/lib/config.ts` for environment-specific settings
- Modify Axios interceptors in `src/lib/api.ts`

## Common Patterns

### 1. Loading States
```tsx
const { isLoading } = useAuthStore();

if (isLoading) {
  return <div>Loading...</div>;
}
```

### 2. Error Handling
```tsx
try {
  await someAPICall();
  addToast('Success!', 'success');
} catch (error) {
  addToast('Error occurred', 'error');
}
```

### 3. Role Checks
```tsx
const { user } = useAuthStore();

if (user?.role === 'ADMIN') {
  return <AdminPanel />;
}
```
