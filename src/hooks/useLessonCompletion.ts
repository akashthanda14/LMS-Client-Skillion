import { useState, useCallback } from 'react';
import { lessonAPI, CompleteLessonResponse } from '@/lib/api';

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
    } catch (err: any) {
      console.error('Failed to complete lesson:', err);
      
      // Retry on network errors or 5xx
      if (retries > 0 && (!err.response || err.response.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return completeLesson(lessonId, retries - 1);
      }

      const errorMessage = err.response?.data?.message || 'Failed to mark lesson as complete';
      setError(errorMessage);
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
