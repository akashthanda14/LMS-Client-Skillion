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
    <div className="min-h-screen w-full">
      {/* Hero Section with Brand Background */}
      <div className="relative bg-gradient-to-br from-[var(--brand-600)] via-[var(--brand-500)] to-[var(--brand-400)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 -right-4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        
        <div className="relative w-full px-6 lg:px-12 py-20 sm:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Learn without limits
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
            >
              Build skills with courses, certificates, and degrees online from world-class creators and instructors
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button asChild size="lg" className="px-8 py-6 text-lg bg-white text-[var(--brand-600)] hover:bg-white/90 font-semibold shadow-lg">
                <Link href="/register">
                  Join for Free
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="w-full px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What we offer
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive learning platform for everyone
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-5xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Learners</h3>
              <p className="text-gray-600 leading-relaxed">
                Access diverse courses, track your progress, earn certificates, and achieve your learning goals with expert-led content
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-5xl mb-6">🎨</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Creators</h3>
              <p className="text-gray-600 leading-relaxed">
                Create and manage engaging courses, reach thousands of students, and share your knowledge with the world
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-5xl mb-6">🛡️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Admins</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage users, oversee platform content, review creator applications, and maintain quality standards
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="w-full px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-4xl sm:text-5xl font-bold text-[var(--brand-600)] mb-2">1000+</div>
              <div className="text-gray-600 text-lg">Courses Available</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="text-4xl sm:text-5xl font-bold text-[var(--brand-600)] mb-2">50k+</div>
              <div className="text-gray-600 text-lg">Active Learners</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="text-4xl sm:text-5xl font-bold text-[var(--brand-600)] mb-2">200+</div>
              <div className="text-gray-600 text-lg">Expert Instructors</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
