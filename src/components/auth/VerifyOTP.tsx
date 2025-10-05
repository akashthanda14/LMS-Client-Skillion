'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmailOTP, verifyPhoneOTP, resendOTP } from '@/services/authService';
import { setToken, setUser } from '@/utils/tokenStorage';
import { maskEmail, maskPhone, validateOTP } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function VerifyOTP() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get props from URL params
  const verificationType = searchParams.get('verificationType') as 'email' | 'phone' | null;
  const contactInfo = searchParams.get('contactInfo') || '';
  const userId = searchParams.get('userId') || '';
  const requiresProfileCompletion = searchParams.get('requiresProfileCompletion') === 'true';

  // Form state
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Resend OTP state
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  // Redirect if no verification type
  useEffect(() => {
    if (!verificationType || !contactInfo) {
      router.push('/register');
    }
  }, [verificationType, contactInfo, router]);

  // Handle OTP submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    // Validate OTP
    const validation = validateOTP(otp);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid OTP');
      return;
    }

    setIsLoading(true);

    try {
      let response;

      // Call appropriate verification endpoint
      if (verificationType === 'email') {
        response = await verifyEmailOTP(contactInfo, otp);
      } else {
        response = await verifyPhoneOTP(contactInfo, otp);
      }

      // Check if we received a token (user already has profile)
      if (response.token && response.user) {
        // Store token and user data
        setToken(response.token);
        setUser(response.user);

        // Redirect to dashboard
        router.push('/dashboard');
      } 
      // Check if profile completion is required
      else if (response.requiresProfileCompletion || requiresProfileCompletion) {
        // Navigate to profile completion
        const params = new URLSearchParams({
          userId: response.userId || userId,
        });
        router.push(`/complete-profile?${params.toString()}`);
      } 
      else {
        setError('Unexpected response from server. Please try again.');
      }
    } catch (err: any) {
      setIsLoading(false);

      if (err.success === false) {
        // Handle specific error messages
        if (err.message?.includes('Invalid') || err.message?.includes('expired')) {
          setError('Invalid or expired OTP. Please try again.');
        } else if (err.message?.includes('not found')) {
          setError('No account found with this information.');
        } else {
          setError(err.message || 'Verification failed. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError('');
    setValidationError('');

    try {
      const data = verificationType === 'email'
        ? { email: contactInfo }
        : { phoneNumber: contactInfo };

      await resendOTP(data);

      // Reset countdown
      setCanResend(false);
      setResendCountdown(60);
      setIsResending(false);

      // Show success message (you can use a toast here)
      setError(''); // Clear any previous errors
    } catch (err: any) {
      setIsResending(false);
      setError(err.message || 'Failed to resend OTP. Please try again.');
    }
  };

  // Handle OTP input change (only numbers)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  // Mask contact info for display
  const maskedContact = verificationType === 'email' 
    ? maskEmail(contactInfo)
    : maskPhone(contactInfo);

  if (!verificationType || !contactInfo) {
    return null; // Will redirect
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify OTP</CardTitle>
          <CardDescription className="text-center">
            We've sent a 6-digit code to
            <br />
            <span className="font-semibold text-gray-900">{maskedContact}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="otp">Enter 6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="\d*"
                placeholder="123456"
                value={otp}
                onChange={handleOtpChange}
                disabled={isLoading}
                autoFocus
                className={`text-center text-2xl tracking-widest ${
                  validationError ? 'border-red-500' : ''
                }`}
                maxLength={6}
              />
            </div>

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
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Verifying...
                </span>
              ) : (
                'Verify OTP'
              )}
            </Button>

            {/* Resend OTP Button */}
            <div className="text-center pt-2">
              {canResend ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="text-primary hover:text-primary/80"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </Button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend OTP in {resendCountdown}s
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
