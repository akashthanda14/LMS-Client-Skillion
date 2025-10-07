'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/lib/api';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: User['role'][];
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['LEARNER', 'CREATOR', 'ADMIN'], 
  fallback = <div>Loading...</div> 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();

  console.log('ProtectedRoute: State check - user:', user, 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  useEffect(() => {
    // Only check auth if we don't already have a user
    // This prevents unnecessary API calls after login
    if (!user && !isAuthenticated) {
      console.log('ProtectedRoute: No user or not authenticated, calling checkAuth');
      checkAuth();
    } else {
      console.log('ProtectedRoute: User exists and authenticated, skipping checkAuth');
    }
  }, [checkAuth, user, isAuthenticated]);

  useEffect(() => {
    // Only redirect to login if we're done loading and definitely not authenticated
    if (!isLoading && !isAuthenticated && !user) {
      console.log('ProtectedRoute: Not authenticated after loading, redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  console.log('ProtectedRoute: Before render checks - isLoading:', isLoading);

  if (isLoading) {
    console.log('ProtectedRoute: Still loading, showing fallback');
    return <>{fallback}</>;
  }

  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: Not authenticated or no user, returning null');
    return null;
  }

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute: Access denied. User role:', user.role, 'Allowed roles:', allowedRoles);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute: Access granted. User role:', user.role);
  return <>{children}</>;
}

export default ProtectedRoute;
