'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuth();
  const router = useRouter();

  console.log('🏠 Homepage: State check', { isAuthenticated, isLoading, user: user?.role });

  useEffect(() => {
    console.log('🏠 Homepage: Calling checkAuth');
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    console.log('🏠 Homepage: Redirect check', { isLoading, isAuthenticated, user: user?.role });
    if (!isLoading && isAuthenticated && user) {
      console.log('🏠 Homepage: Will redirect in 100ms to role-based dashboard');
      // Small delay to ensure clean redirect
      setTimeout(() => {
        // Redirect based on user role
        if (user.role === 'ADMIN') {
          console.log('🏠 Homepage: Redirecting to admin dashboard');
          router.replace('/admin/dashboard');
        } else if (user.role === 'CREATOR') {
          console.log('🏠 Homepage: Redirecting to creator dashboard');
          router.replace('/creator/dashboard');
        } else {
          console.log('🏠 Homepage: Redirecting to courses');
          router.replace('/courses');
        }
      }, 100);
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-6xl font-bold text-gray-900 mb-6"
            >
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MicroCourses
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              A modern Learning Management System built with Next.js 15. 
              Create, share, and learn with our comprehensive platform supporting 
              learners, creators, and administrators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button asChild size="lg" className="px-8 py-3 text-lg">
                <Link href="/register">
                  Get Started
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="px-8 py-3 text-lg">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="text-center p-6">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-semibold text-gray-900 mb-2">For Learners</h3>
                <p className="text-gray-600 text-sm">
                  Access courses, track progress, and achieve your learning goals
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="font-semibold text-gray-900 mb-2">For Creators</h3>
                <p className="text-gray-600 text-sm">
                  Create and manage courses, engage with students, and share knowledge
                </p>
              </div>

              <div className="text-center p-6">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="font-semibold text-gray-900 mb-2">For Admins</h3>
                <p className="text-gray-600 text-sm">
                  Manage users, oversee content, and maintain platform integrity
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
