import React, { Suspense } from 'react';
import VerifyOTP from '@/components/auth/VerifyOTP';

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOTP />
    </Suspense>
  );
}
