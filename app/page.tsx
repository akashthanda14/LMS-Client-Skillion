"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import HeroSection from '@/components/landing/HeroSection';

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      setTimeout(() => {
        if (user.role === 'ADMIN') {
          router.replace('/admin/dashboard');
        } else if (user.role === 'CREATOR') {
          router.replace('/creator/dashboard');
        } else {
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
    return null; // redirect handled in effect
  }

  return <HeroSection />;
}
