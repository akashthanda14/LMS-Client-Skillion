import RegisterForm from '@/components/auth/NewRegisterForm';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function RegisterPage() {
  return (
    <>
      <Navbar forceTransparent />
      <main id="main">
        <RegisterForm />
      </main>
      <Footer />
    </>
  );
}
