'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, UserCheck, BookCheck, ArrowRight } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { AdminMetrics } from '@/components/admin/AdminMetrics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminAPI, AdminMetrics as AdminMetricsType } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetricsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await adminAPI.getMetrics();
      setMetrics(response.data);
    } catch (err: any) {
      console.error('Failed to load metrics:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard metrics';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <AuthenticatedLayout allowedRoles={['ADMIN']}>
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

  if (error || !metrics) {
    return (
      <AuthenticatedLayout allowedRoles={['ADMIN']}>
        <div className="max-w-4xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Failed to load dashboard'}
              </AlertDescription>
            </Alert>
            <Button onClick={fetchMetrics}>Try Again</Button>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const quickActions = [
    {
      title: 'Review Creator Applications',
      description: `${metrics.pendingApplications} pending applications`,
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/review/creators',
      count: metrics.pendingApplications,
    },
    {
      title: 'Review Pending Courses',
      description: `${metrics.pendingCourses} courses awaiting approval`,
      icon: BookCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/review/courses',
      count: metrics.pendingCourses,
    },
  ];

  return (
    <AuthenticatedLayout allowedRoles={['ADMIN']}>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage platform content and review submissions
          </p>
        </motion.div>

        {/* Metrics */}
        <AdminMetrics metrics={metrics} />

        {/* Quick Actions */}
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            Quick Actions
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Card
                    className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                      action.count > 0 ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                    }`}
                    onClick={() => router.push(action.href)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 ${action.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-7 h-7 ${action.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {action.description}
                        </p>
                        <Button
                          size="sm"
                          variant={action.count > 0 ? 'default' : 'outline'}
                        >
                          {action.count > 0 ? 'Review Now' : 'View All'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>

                    {action.count > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Action Required</span>
                          <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-yellow-800">
                              {action.count} Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-gray-900">System Status</h3>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AuthenticatedLayout>
  );
}
