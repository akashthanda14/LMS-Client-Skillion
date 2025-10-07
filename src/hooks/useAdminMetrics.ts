import { useState, useEffect, useCallback } from 'react';
import { adminAPI, type AdminMetrics } from '@/lib/api';

const getErrorMessage = (err: unknown, fallback = 'Failed to load metrics') => {
  if (err instanceof Error) return err.message;
  const resp = err as unknown as { response?: { data?: { message?: string } } } | null;
  return resp?.response?.data?.message ?? fallback;
}

interface UseAdminMetricsReturn {
  metrics: AdminMetrics | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching admin dashboard metrics
 */
export function useAdminMetrics(): UseAdminMetricsReturn {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAPI.getMetrics();
      setMetrics(response.data);
    } catch (err: unknown) {
      console.error('Failed to fetch metrics:', err);
      const msg = getErrorMessage(err, 'Failed to load metrics');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
  };
}
