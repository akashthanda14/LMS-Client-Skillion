import { useState, useCallback } from 'react';
import { courseAPI, EnrollmentResponse } from '@/lib/api';

interface UseEnrollmentReturn {
  enroll: (courseId: string) => Promise<void>;
  isEnrolling: boolean;
  error: string | null;
}

/**
 * Custom hook for course enrollment with optimistic updates
 * Returns enroll function, loading state, and error
 */
export function useEnrollment(onSuccess?: () => void): UseEnrollmentReturn {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enroll = useCallback(async (courseId: string) => {
    try {
      setIsEnrolling(true);
      setError(null);

      const response = await courseAPI.enrollInCourse(courseId);

      if (response.success) {
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Enrollment failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to enroll in course';
      setError(errorMessage);
      throw err;
    } finally {
      setIsEnrolling(false);
    }
  }, [onSuccess]);

  return {
    enroll,
    isEnrolling,
    error,
  };
}
