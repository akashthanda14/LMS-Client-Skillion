'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { registerUser } from '@/services/authService';
import { validateEmail } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  
  // Form state
  const [email, setEmail] = useState('');
  const [subscribe, setSubscribe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    const trimmedEmail = email.trim();
    const validation = validateEmail(trimmedEmail);
    
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid email');
      return;
    }

    await handleRegistration({ email: trimmedEmail });
  };

  // Handle registration API call
  const handleRegistration = async (data: { email: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await registerUser(data);

      // Registration flow changed: backend now auto-verifies free-plan users.
      // If profile completion is required, send the user to the profile setup page.
      const params = new URLSearchParams({
        userId: response.userId,
        requiresProfileCompletion: response.requiresProfileCompletion.toString(),
      });

      if (response.requiresProfileCompletion) {
        // Brief success state could be shown here if desired; redirect to profile completion
        router.push(`/complete-profile?${params.toString()}`);
      } else {
        // No profile completion required — treat register as complete and send user to login
        router.push('/login');
      }
    } catch (err: any) {
      setIsLoading(false);
      
      // Handle specific error codes
      if (err.success === false) {
        if (err.message?.includes('already registered')) {
          setError('This account is already registered. Please log in instead.');
        } else {
          setError(err.message || 'Registration failed. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center px-4"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1612117229486-78abff6d84c3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      role="img"
      aria-label="Person learning on a laptop with soft gradient background"
    >
      {/* gradient overlay to ensure text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/65 to-black/30 mix-blend-multiply" aria-hidden />
      {/* inset shadow overlay to darken edges and improve contrast */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 80px 120px rgba(0,0,0,0.45), inset 0 -80px 120px rgba(0,0,0,0.25)',
        }}
      />
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 -left-8 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-8 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
          {/* Heading */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">Welcome — create your account</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-800">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className={`pl-10 h-12 text-base bg-gray-50 border border-gray-200 rounded-md text-gray-900 ${validationError ? 'ring-1 ring-red-300' : ''}`}
                />
              </div>
            </div>

            {/* Subscribe checkbox */}
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <input
                id="subscribe"
                type="checkbox"
                checked={subscribe}
                onChange={(e) => setSubscribe(e.target.checked)}
                className="w-4 h-4 text-[var(--primary)] rounded focus:ring-2 focus:ring-[var(--primary)]"
              />
              <label htmlFor="subscribe">Get course updates</label>
            </div>

            {/* Validation Error */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200"
              >
                {validationError}
              </motion.div>
            )}

            {/* API Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base bg-[#0D6EFD] hover:bg-[#0A58CA] text-white font-semibold shadow-lg transition-all duration-200 rounded-md"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creating Account...
                </span>
              ) : (
                'Continue with Email'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-semibold text-[#0D6EFD] hover:text-[#0A58CA] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Additional info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          By signing up, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
}
