import { useState, useCallback } from 'react';
import { lessonAPI, CompleteLessonResponse } from '@/lib/api';

const getErrorMessage = (err: unknown, fallback = 'Failed to mark lesson as complete') => {
  if (err instanceof Error) return err.message;
  const resp = err as unknown as { response?: { data?: { message?: string }, status?: number } } | null;
  return resp?.response?.data?.message ?? fallback;
}

const getStatus = (err: unknown) => (err as any)?.response?.status ?? null;

interface UseLessonCompletionReturn {
  completeLesson: (lessonId: string) => Promise<CompleteLessonResponse | null>;
  isCompleting: boolean;
  error: string | null;
}

/**
 * Custom hook for marking lessons as complete
 * Includes retry logic and optimistic updates
 */
export function useLessonCompletion(onSuccess?: (data: CompleteLessonResponse) => void): UseLessonCompletionReturn {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeLesson = useCallback(async (lessonId: string, retries = 2): Promise<CompleteLessonResponse | null> => {
    try {
      setIsCompleting(true);
      setError(null);

      const response = await lessonAPI.completeLesson(lessonId);

      if (response.success) {
        onSuccess?.(response);
      }

      return response;
    } catch (err: unknown) {
      console.error('Failed to complete lesson:', err);

      // Retry on network errors or 5xx
      const status = getStatus(err);
      if (retries > 0 && (!status || status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return completeLesson(lessonId, retries - 1);
      }

      setError(getErrorMessage(err, 'Failed to mark lesson as complete'));
      return null;
    } finally {
      setIsCompleting(false);
    }
  }, [onSuccess]);

  return {
    completeLesson,
    isCompleting,
    error,
  };
}
