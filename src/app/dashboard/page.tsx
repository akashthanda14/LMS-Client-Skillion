'use client';

import { motion } from 'framer-motion';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'You have full administrative access to the platform.';
      case 'CREATOR':
        return 'You can create and manage courses for learners.';
      case 'LEARNER':
        return 'You can enroll in and complete courses.';
      default:
        return 'Welcome to the platform!';
    }
  };

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '🛡️ Admin Dashboard';
      case 'CREATOR':
        return '🎨 Creator Studio';
      case 'LEARNER':
        return '📚 Learning Hub';
      default:
        return '🏠 Dashboard';
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="px-4 py-6 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              {user?.role && getRoleDescription(user.role)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {user?.role && getWelcomeMessage(user.role)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Your role: <span className="font-semibold text-blue-600">{user?.role}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Email: <span className="font-semibold">{user?.email}</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {user?.role === 'LEARNER' && (
                      <>
                        <p className="text-sm">Courses Enrolled: <span className="font-semibold">0</span></p>
                        <p className="text-sm">Courses Completed: <span className="font-semibold">0</span></p>
                      </>
                    )}
                    {user?.role === 'CREATOR' && (
                      <>
                        <p className="text-sm">Courses Created: <span className="font-semibold">0</span></p>
                        <p className="text-sm">Total Students: <span className="font-semibold">0</span></p>
                      </>
                    )}
                    {user?.role === 'ADMIN' && (
                      <>
                        <p className="text-sm">Total Users: <span className="font-semibold">0</span></p>
                        <p className="text-sm">Total Courses: <span className="font-semibold">0</span></p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Getting Started Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🚀 Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    {user?.role === 'LEARNER' && (
                      <>
                        <p>• Browse available courses</p>
                        <p>• Enroll in courses that interest you</p>
                        <p>• Track your learning progress</p>
                      </>
                    )}
                    {user?.role === 'CREATOR' && (
                      <>
                        <p>• Create your first course</p>
                        <p>• Add lessons and content</p>
                        <p>• Publish and manage courses</p>
                      </>
                    )}
                    {user?.role === 'ADMIN' && (
                      <>
                        <p>• Manage user accounts</p>
                        <p>• Review course content</p>
                        <p>• Monitor platform activity</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AuthenticatedLayout>
  );
}
