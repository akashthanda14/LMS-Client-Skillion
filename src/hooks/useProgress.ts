import { useState, useEffect, useCallback } from 'react';
import { progressAPI, GetProgressResponse } from '@/lib/api';

interface UseProgressReturn {
  progress: GetProgressResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching user's learning progress
 * Includes all enrollments with course details
 */
export function useProgress(): UseProgressReturn {
  const [progress, setProgress] = useState<GetProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await progressAPI.getProgress();
      setProgress(data);
    } catch (err: any) {
      console.error('Failed to fetch progress:', err);
      setError(err.response?.data?.message || 'Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress,
  };
}
