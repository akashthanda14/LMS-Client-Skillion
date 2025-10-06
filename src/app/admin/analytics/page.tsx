'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, TrendingUp, TrendingDown, Users, BookOpen, Award, Activity } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminAPI, type GrowthMetrics, type TopCourse, type ActivityItem } from '@/lib/api';
import { AdminAnalyticsWithProgress } from '@/components/admin/AdminAnalyticsWithProgress';
import { useRouter } from 'next/navigation';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [growth, courses, activity] = await Promise.all([
        adminAPI.getGrowthMetrics().catch(() => null),
        adminAPI.getTopCourses(10).catch(() => null),
        adminAPI.getRecentActivity(20).catch(() => null),
      ]);

      setGrowthMetrics(growth?.data || null);
      setTopCourses(courses?.data?.courses || []);
      setRecentActivity(activity?.data?.activities || []);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

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
            <p className="text-gray-600">Loading analytics...</p>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout allowedRoles={['ADMIN']}>
        <div className="max-w-4xl mx-auto py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchAnalytics} className="mt-4">Try Again</Button>
        </div>
      </AuthenticatedLayout>
    );
  }

  const GrowthCard = ({ title, icon: Icon, data, color }: any) => {
    const isPositive = parseFloat(data.growthRate) >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${color.bg} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${color.text}`} />
            </div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{data.growthRate}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Current</p>
            <p className="text-2xl font-bold text-gray-900">{data.current.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Previous</p>
            <p className="text-xl font-semibold text-gray-600">{data.previous.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Growth</p>
            <p className={`text-xl font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {data.growth >= 0 ? '+' : ''}{data.growth}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <AuthenticatedLayout allowedRoles={['ADMIN']}>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Platform growth and performance metrics
              </p>
            </div>
          </div>
        </motion.div>

        {/* Growth Metrics */}
        {growthMetrics && (
          <AdminAnalyticsWithProgress growthMetrics={growthMetrics} />
        )}

        {/* Top Courses */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Courses</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creator
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topCourses.map((course, index) => (
                    <motion.tr
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                            #{index + 1}
                          </div>
                          <div className="font-medium text-gray-900">{course.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {course.creator.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {course.enrollmentCount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {course.completionRate}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: course.averageProgress }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{course.averageProgress}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <Card className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 uppercase">
                    {activity.type.replace('_', ' ')}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
