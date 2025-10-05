'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/services/authService';
import { validateEmail, validatePhone } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type ContactType = 'email' | 'phone';

export default function RegisterForm() {
  const router = useRouter();
  
  // Form state
  const [contactType, setContactType] = useState<ContactType>('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    // Validate input based on contact type
    if (contactType === 'email') {
      const trimmedEmail = email.trim();
      const validation = validateEmail(trimmedEmail);
      
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid email');
        return;
      }

      await handleRegistration({ email: trimmedEmail });
    } else {
      const trimmedPhone = phoneNumber.trim();
      const validation = validatePhone(trimmedPhone);
      
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid phone number');
        return;
      }

      await handleRegistration({ phoneNumber: trimmedPhone });
    }
  };

  // Handle registration API call
  const handleRegistration = async (data: { email?: string; phoneNumber?: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await registerUser(data);

      // Navigate to OTP verification with state
      router.push('/verify-otp', {
        state: {
          verificationType: response.verificationType,
          contactInfo: data.email || data.phoneNumber || '',
          userId: response.userId,
          requiresProfileCompletion: response.requiresProfileCompletion,
        },
      } as any);

      // For Next.js, we'll use query params instead
      const params = new URLSearchParams({
        verificationType: response.verificationType,
        contactInfo: data.email || data.phoneNumber || '',
        userId: response.userId,
        requiresProfileCompletion: response.requiresProfileCompletion.toString(),
      });
      
      router.push(`/verify-otp?${params.toString()}`);
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

  // Handle contact type change
  const handleContactTypeChange = (type: ContactType) => {
    setContactType(type);
    setError('');
    setValidationError('');
    setEmail('');
    setPhoneNumber('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Sign up to get started with MicroCourses
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact Type Selection */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => handleContactTypeChange('email')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  contactType === 'email'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => handleContactTypeChange('phone')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  contactType === 'phone'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Phone
              </button>
            </div>

            {/* Email Input */}
            {contactType === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className={validationError ? 'border-red-500' : ''}
                />
              </div>
            )}

            {/* Phone Input */}
            {contactType === 'phone' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+911234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className={validationError ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500">
                  Format: +[country code][number] (e.g., +911234567890)
                </p>
              </div>
            )}

            {/* Validation Error */}
            {validationError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {validationError}
              </div>
            )}

            {/* API Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (!email && !phoneNumber)}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Registering...
                </span>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <div className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
