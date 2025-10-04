import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/lib/api';

interface AdminMetrics {
  pendingApplications: number;
  pendingCourses: number;
  totalCreators: number;
  totalCourses: number;
  publishedCourses: number;
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
    } catch (err: any) {
      console.error('Failed to fetch metrics:', err);
      setError(err.response?.data?.message || 'Failed to load metrics');
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
