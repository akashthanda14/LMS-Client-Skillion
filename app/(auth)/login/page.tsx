'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import Navbar from '@/components/landing/Navbar';

export default function LoginPage() {
  return (
    <>
      <Navbar forceTransparent />
      <main id="main">
        <LoginForm />
      </main>
  {/* Footer rendered globally in app/layout.tsx */}
    </>
  );
}
