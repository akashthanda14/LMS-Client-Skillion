import { useState, useEffect, useCallback } from 'react';
import { adminAPI, type CreatorApplication } from '@/lib/api';

interface UsePendingApplicationsReturn {
  applications: CreatorApplication[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  approveApplication: (id: string) => Promise<void>;
  rejectApplication: (id: string, reason: string) => Promise<void>;
}

/**
 * Custom hook for managing pending creator applications with optimistic updates
 */
export function usePendingApplications(): UsePendingApplicationsReturn {
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Fetching pending applications...');
      const response = await adminAPI.getApplicationsPending();
      console.log('📦 Raw API response:', response);
      
      // Handle both response formats:
      // 1. { success: true, data: { applications: [...] } }
      // 2. { success: true, applications: [...] }
      const apps = response.data?.applications || (response as any).applications || [];
      
      console.log('✅ Parsed applications:', apps);
      console.log('📊 Total applications:', apps.length);
      
      setApplications(apps);
    } catch (err: any) {
      console.error('❌ Failed to fetch pending applications:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const approveApplication = useCallback(async (id: string) => {
    // Optimistic update: remove from list
    const originalApplications = [...applications];
    setApplications(prev => prev.filter(a => a.id !== id));

    try {
      await adminAPI.approveApplication(id);
      // Success - keep optimistic update
    } catch (err: any) {
      // Rollback on error
      setApplications(originalApplications);
      throw err;
    }
  }, [applications]);

  const rejectApplication = useCallback(async (id: string, reason: string) => {
    // Validate reason length (backend requires ≥10 characters)
    if (reason.trim().length < 10) {
      throw new Error('Rejection reason must be at least 10 characters');
    }

    // Optimistic update: remove from list
    const originalApplications = [...applications];
    setApplications(prev => prev.filter(a => a.id !== id));

    try {
      await adminAPI.rejectApplication(id, { reason });
      // Success - keep optimistic update
    } catch (err: any) {
      // Rollback on error
      setApplications(originalApplications);
      throw err;
    }
  }, [applications]);

  return {
    applications,
    isLoading,
    error,
    refetch: fetchApplications,
    approveApplication,
    rejectApplication,
  };
}
