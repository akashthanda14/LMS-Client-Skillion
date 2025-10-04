import { useState, useEffect, useCallback } from 'react';
import { courseAPI, CourseDetail } from '@/lib/api';

interface UseCourseReturn {
  course: CourseDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (updater: (prev: CourseDetail) => CourseDetail) => void;
}

/**
 * Custom hook for fetching and managing course details
 * Includes caching and optimistic updates
 */
export function useCourse(courseId: string | null): UseCourseReturn {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await courseAPI.getCourseById(courseId);
      setCourse(data);
    } catch (err: any) {
      console.error('Failed to fetch course:', err);
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Manual mutate function for optimistic updates
  const mutate = useCallback((updater: (prev: CourseDetail) => CourseDetail) => {
    setCourse((prev) => prev ? updater(prev) : null);
  }, []);

  return {
    course,
    isLoading,
    error,
    refetch: fetchCourse,
    mutate,
  };
}
