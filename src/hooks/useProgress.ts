import { useState, useEffect, useCallback } from 'react';
import { progressAPI, GetProgressResponse } from '@/lib/api';

const getErrorMessage = (err: unknown, fallback = 'Failed to load progress') => {
  if (err instanceof Error) return err.message;
  const resp = err as unknown as { response?: { data?: { message?: string } } } | null;
  return resp?.response?.data?.message ?? fallback;
}

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
    } catch (err: unknown) {
      console.error('Failed to fetch progress:', err);
      setError(getErrorMessage(err, 'Failed to load progress'));
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
