import React, { Suspense } from 'react';
import CompleteProfile from '@/components/auth/CompleteProfile';

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CompleteProfile />
    </Suspense>
  );
}
