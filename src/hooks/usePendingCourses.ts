import { useState, useEffect, useCallback } from 'react';
import { adminAPI, type PendingCourse } from '@/lib/api';

interface UsePendingCoursesReturn {
  courses: PendingCourse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  publishCourse: (id: string) => Promise<void>;
  rejectCourse: (id: string, feedback: string) => Promise<void>;
}

/**
 * Custom hook for managing pending courses with optimistic updates
 */
export function usePendingCourses(): UsePendingCoursesReturn {
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getPendingCourses('PENDING');
      setCourses(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch pending courses:', err);
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const publishCourse = useCallback(async (id: string) => {
    // Optimistic update: remove from list
    const originalCourses = [...courses];
    setCourses(prev => prev.filter(c => c.id !== id));

    try {
      await adminAPI.publishCourse(id, {});
      // Success - keep optimistic update
    } catch (err: any) {
      // Rollback on error
      setCourses(originalCourses);
      throw err;
    }
  }, [courses]);

  const rejectCourse = useCallback(async (id: string, feedback: string) => {
    // Optimistic update: remove from list
    const originalCourses = [...courses];
    setCourses(prev => prev.filter(c => c.id !== id));

    try {
      await adminAPI.rejectCourse(id, { comments: feedback });
      // Success - keep optimistic update
    } catch (err: any) {
      // Rollback on error
      setCourses(originalCourses);
      throw err;
    }
  }, [courses]);

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses,
    publishCourse,
    rejectCourse,
  };
}
