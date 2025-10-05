'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Please enter your email or phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [error, setError] = useState<string>('');
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
    },
  });

  // Quick fill function for test accounts
  const fillTestAccount = (email: string, password: string) => {
    form.setValue('emailOrPhone', email);
    form.setValue('password', password);
  };

    const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      console.log('LoginForm: Starting login with data:', { emailOrPhone: data.emailOrPhone });
      const user = await login(data);
      console.log('LoginForm: Login successful, user role:', user?.role);
      addToast('Login successful! Welcome back.', 'success');
      
      // Brief delay to ensure token is properly synced
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Redirect based on user role
      if (user?.role === 'ADMIN') {
        console.log('LoginForm: Redirecting to /admin/dashboard');
        router.replace('/admin/dashboard');
      } else if (user?.role === 'CREATOR') {
        console.log('LoginForm: Redirecting to /creator/dashboard');
        router.replace('/creator/dashboard');  
      } else {
        console.log('LoginForm: Redirecting to /courses');
        router.replace('/courses');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      console.error('LoginForm: Login failed:', errorMessage, err);
      setError(errorMessage);
      addToast(errorMessage, 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 mt-2">Sign in to your MicroCourses account</p>
          </motion.div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="emailOrPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your email or phone number"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        className="w-full"
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

              {/* Test Credentials for Judges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-800">Test Accounts for Judges</h3>
                </div>
                
                <div className="space-y-2">
                  {/* Admin Account */}
                  <div className="bg-white/70 rounded-lg p-2 hover:bg-white/90 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-red-700">🛡️ ADMIN</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div>📧 admin@microcourses.com</div>
                          <div>🔑 password123</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fillTestAccount('admin@microcourses.com', 'password123')}
                        className="text-xs h-7 px-2"
                      >
                        Fill
                      </Button>
                    </div>
                  </div>

                  {/* Creator Account */}
                  <div className="bg-white/70 rounded-lg p-2 hover:bg-white/90 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-blue-700">🎨 CREATOR</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div>📧 sarah@example.com</div>
                          <div>🔑 password123</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fillTestAccount('sarah@example.com', 'password123')}
                        className="text-xs h-7 px-2"
                      >
                        Fill
                      </Button>
                    </div>
                  </div>

                  {/* Learner Account */}
                  <div className="bg-white/70 rounded-lg p-2 hover:bg-white/90 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-green-700">👨‍🎓 LEARNER</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div>📧 akashthanda14@gmail.com</div>
                          <div>🔑 Ak@sh274648</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fillTestAccount('akashthanda14@gmail.com', 'Ak@sh274648')}
                        className="text-xs h-7 px-2"
                      >
                        Fill
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

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
                  'Sign In'
                )}
              </Button>


            </form>
          </Form>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
