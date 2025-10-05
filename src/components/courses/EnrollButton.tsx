'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  price?: number; // Optional since backend doesn't support pricing yet
  onEnrollmentSuccess?: () => void;
  className?: string;
}

export function EnrollButton({ 
  courseId, 
  isEnrolled, 
  price = 0, 
  onEnrollmentSuccess,
  className 
}: EnrollButtonProps) {
  const { enrollInCourse, isEnrolling } = useCourses();
  const { isAuthenticated } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      await enrollInCourse(courseId);
      setShowSuccess(true);
      
      // Call success callback
      if (onEnrollmentSuccess) {
        onEnrollmentSuccess();
      }
      
      // Hide success message and refresh page after 1.5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      // Error is handled in the store
      console.error('Enrollment failed:', error);
    }
  };

  if (isEnrolled) {
    return (
      <Button
        disabled
        className={`flex items-center gap-2 ${className}`}
        variant="outline"
      >
        <CheckCircle className="w-4 h-4 text-green-500" />
        Enrolled
      </Button>
    );
  }

  if (showSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center justify-center gap-2 bg-green-500 text-white rounded-md px-4 py-2 ${className}`}
      >
        <CheckCircle className="w-4 h-4" />
        Successfully Enrolled!
      </motion.div>
    );
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={isEnrolling}
      className={`flex items-center gap-2 ${className}`}
      size="lg"
    >
      {isEnrolling ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>
          {price === 0 ? 'Enroll for Free' : `Enroll for $${price}`}
        </>
      )}
    </Button>
  );
}
