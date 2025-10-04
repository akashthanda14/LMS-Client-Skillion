'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';

// Step 1: Email or Phone
const step1Schema = z.object({
  contactType: z.enum(['email', 'phone']),
  email: z.string().email('Please enter a valid email').optional(),
  phoneNumber: z.string().regex(/^\+91\d{10}$/, 'Phone must be in format +91XXXXXXXXXX').optional(),
}).refine((data) => {
  if (data.contactType === 'email') return !!data.email;
  if (data.contactType === 'phone') return !!data.phoneNumber;
  return false;
}, {
  message: 'Please provide either email or phone number',
  path: ['email'],
});

// Step 2: OTP Verification
const step2Schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

// Step 3: Complete Profile
const step3Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export function RegisterForm() {
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [contactData, setContactData] = useState<{ type: 'email' | 'phone'; value: string }>({ type: 'email', value: '' });
  
  const { register, verifyEmail, verifyPhone, completeProfile, resendOTP, isLoading, pendingVerification, user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  // Step 1 Form
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      contactType: 'email',
      email: '',
      phoneNumber: '',
    },
  });

  // Step 2 Form
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: '' },
  });

  // Step 3 Form
  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onStep1Submit = async (data: Step1Data) => {
    try {
      setError('');
      const payload = data.contactType === 'email' 
        ? { email: data.email }
        : { phoneNumber: data.phoneNumber };
      
      await register(payload);
      
      setContactData({
        type: data.contactType,
        value: data.contactType === 'email' ? data.email! : data.phoneNumber!,
      });
      
      addToast(`Verification code sent to your ${data.contactType}`, 'success');
      setStep(2);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    }
  };

  const onStep2Submit = async (data: Step2Data) => {
    try {
      setError('');
      let profileComplete = false;
      
      if (contactData.type === 'email') {
        profileComplete = await verifyEmail(contactData.value, data.otp);
      } else {
        profileComplete = await verifyPhone(contactData.value, data.otp);
      }

      if (profileComplete) {
        addToast('Registration successful! Welcome to MicroCourses.', 'success');
        // Get user from store and redirect based on role
        // user is already available from context
        
        // Small delay to ensure state is fully updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (user?.role === 'ADMIN') {
          router.replace('/admin/dashboard');
        } else if (user?.role === 'CREATOR') {
          router.replace('/creator/dashboard');
        } else {
          router.replace('/courses');
        }
      } else {
        addToast('Verification successful! Please complete your profile.', 'success');
        setStep(3);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    }
  };

  const onStep3Submit = async (data: Step3Data) => {
    try {
      setError('');
      const user = await completeProfile(data.name, data.password);
      addToast('Profile completed successfully! Welcome to MicroCourses.', 'success');
      
      // Small delay to ensure state is fully updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on user role
      if (user?.role === 'ADMIN') {
        router.replace('/admin/dashboard');
      } else if (user?.role === 'CREATOR') {
        router.replace('/creator/dashboard');
      } else {
        router.replace('/courses');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Profile completion failed. Please try again.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    }
  };

  const handleResendOTP = async () => {
    try {
      if (contactData.type === 'email') {
        await resendOTP(contactData.value, undefined);
      } else {
        await resendOTP(undefined, contactData.value);
      }
      addToast('Verification code resent successfully', 'success');
    } catch (err: any) {
      addToast('Failed to resend code. Please try again.', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CardTitle className="text-2xl font-bold text-gray-900">
              {step === 1 && 'Create Account'}
              {step === 2 && 'Verify Your Account'}
              {step === 3 && 'Complete Your Profile'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {step === 1 && 'Join MicroCourses and start learning'}
              {step === 2 && `Enter the code sent to your ${contactData.type}`}
              {step === 3 && 'Just a few more details'}
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s === step ? 'bg-green-500' : s < step ? 'bg-green-300' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {/* Step 1: Contact Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Form {...step1Form}>
                  <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
                    <FormField
                      control={step1Form.control}
                      name="contactType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Register with</FormLabel>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={field.value === 'email' ? 'default' : 'outline'}
                              onClick={() => field.onChange('email')}
                              className="flex-1"
                            >
                              Email
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === 'phone' ? 'default' : 'outline'}
                              onClick={() => field.onChange('phone')}
                              className="flex-1"
                            >
                              Phone
                            </Button>
                          </div>
                        </FormItem>
                      )}
                    />

                    {step1Form.watch('contactType') === 'email' ? (
                      <FormField
                        control={step1Form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={step1Form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+919876543210"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-red-600 text-sm font-medium"
                      >
                        {error}
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        'Continue'
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Form {...step2Form}>
                  <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
                    <FormField
                      control={step2Form.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                              {...field}
                              className="text-center text-2xl tracking-widest"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-red-600 text-sm font-medium"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-sm text-blue-600 hover:text-blue-800"
                        disabled={isLoading}
                      >
                        Didn't receive the code? Resend
                      </button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {/* Step 3: Complete Profile */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Form {...step3Form}>
                  <form onSubmit={step3Form.handleSubmit(onStep3Submit)} className="space-y-4">
                    <FormField
                      control={step3Form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter your full name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={step3Form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a strong password"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500 mt-1">
                            Min 10 characters, uppercase letter, and a number
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={step3Form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-red-600 text-sm font-medium"
                      >
                        {error}
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Complete Registration'}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
