'use client';

import { ReactNode } from 'react';
import { Navigation } from '@/components/auth/Navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { User } from '@/lib/api';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  allowedRoles?: User['role'][];
}

export function AuthenticatedLayout({ children, allowedRoles }: AuthenticatedLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
