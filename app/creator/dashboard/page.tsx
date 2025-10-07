'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { CreatorStats } from '@/components/creator/CreatorStats';
import { CreatorDashboard } from '@/components/creator/CreatorDashboard';
import { Button } from '@/components/ui/button';
import { creatorAPI, CreatorDashboardResponse } from '@/lib/api';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function CreatorDashboardPage() {
  const [dashboardData, setDashboardData] = useState<CreatorDashboardResponse['dashboard'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await creatorAPI.getDashboard();
      setDashboardData(response.dashboard);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCourseCreated = (courseId: string) => {
    // Refresh dashboard data
    fetchDashboard();
    // Optionally navigate to the new course editor
    // router.push(`/creator/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600">Loading dashboard...</p>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={fetchDashboard}>Try Again</Button>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <AuthenticatedLayout>
      <div className="relative px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your courses and track your impact</p>
          </div>
          <Button
            onClick={() => router.push('/creator/courses/new')}
            className="flex items-center gap-2"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            New Course
          </Button>
        </motion.div>

        {/* Stats */}
        <CreatorStats stats={dashboardData.stats} />

        {/* Courses List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CreatorDashboard courses={dashboardData.courses} />
        </motion.div>

  {/* Creation modal removed in favor of dedicated route /creator/courses/new */}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
