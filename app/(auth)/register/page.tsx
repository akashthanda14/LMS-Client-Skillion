import RegisterForm from '@/components/auth/NewRegisterForm';
import Navbar from '@/components/landing/Navbar';

export default function RegisterPage() {
  return (
    <>
      <Navbar forceTransparent />
      <main id="main">
        <RegisterForm />
      </main>
  {/* Footer rendered globally in app/layout.tsx */}
    </>
  );
}
