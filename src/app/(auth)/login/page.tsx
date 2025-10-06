'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function LoginPage() {
  return (
    <>
      <Navbar forceTransparent />
      <main id="main">
        <LoginForm />
      </main>
      <Footer />
    </>
  );
}
