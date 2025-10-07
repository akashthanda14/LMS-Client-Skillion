'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { ProgressDashboard } from '@/components/progress/ProgressDashboard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { progressAPI, EnrollmentProgress } from '@/lib/api';

export default function ProgressPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchProgress = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await progressAPI.getProgress();
      const progressData = response.data.enrollments.map(enrollment => ({
        enrollmentId: enrollment.id,
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        completedLessons: typeof enrollment.progress === 'number' ? enrollment.progress : ((enrollment.progress as any)?.completedLessons || 0),
        totalLessons: enrollment.course.totalLessons || 0,
        progress: enrollment.progress
      }));
      setEnrollments(progressData);
    } catch (err: any) {
      console.error('Failed to load progress:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load your progress';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

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
            <p className="text-gray-600">Loading your progress...</p>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
              <p className="text-gray-600">Track your learning journey</p>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={fetchProgress} className="mt-4">
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Progress Dashboard */}
        {!error && <ProgressDashboard enrollments={enrollments} />}
      </div>
    </AuthenticatedLayout>
  );
}
