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
      {/* Background blur orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Header Section */}
          <div className="mb-8 space-y-2">
            <motion.h1 
              className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Welcome back, <span className="text-blue-600">{user?.name}</span>!
            </motion.h1>
            <motion.p 
              className="text-base text-gray-600 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {user?.role && getRoleDescription(user.role)}
            </motion.p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="h-full"
            >
              <Card className="relative overflow-hidden border-white/60 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {user?.role && getWelcomeMessage(user.role)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Your role:</span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                      {user?.role}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Email: <span className="font-medium text-gray-900">{user?.email}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="h-full"
            >
              <Card className="relative overflow-hidden border-white/60 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl" />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-xl font-semibold text-gray-900">📊 Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    {user?.role === 'LEARNER' && (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50">
                          <span className="text-sm font-medium text-gray-700">Courses Enrolled</span>
                          <span className="text-2xl font-bold text-blue-600">0</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100/50">
                          <span className="text-sm font-medium text-gray-700">Courses Completed</span>
                          <span className="text-2xl font-bold text-green-600">0</span>
                        </div>
                      </>
                    )}
                    {user?.role === 'CREATOR' && (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100/50">
                          <span className="text-sm font-medium text-gray-700">Courses Created</span>
                          <span className="text-2xl font-bold text-purple-600">0</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100/50">
                          <span className="text-sm font-medium text-gray-700">Total Students</span>
                          <span className="text-2xl font-bold text-orange-600">0</span>
                        </div>
                      </>
                    )}
                    {user?.role === 'ADMIN' && (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50">
                          <span className="text-sm font-medium text-gray-700">Total Users</span>
                          <span className="text-2xl font-bold text-indigo-600">0</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100/50">
                          <span className="text-sm font-medium text-gray-700">Total Courses</span>
                          <span className="text-2xl font-bold text-violet-600">0</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Getting Started Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="h-full md:col-span-2 lg:col-span-1"
            >
              <Card className="relative overflow-hidden border-white/60 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-gradient-to-tl from-purple-500/10 to-pink-500/10 rounded-full blur-2xl" />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-xl font-semibold text-gray-900">🚀 Getting Started</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-3">
                    {user?.role === 'LEARNER' && (
                      <>
                        <li className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">1</span>
                          <span>Browse available courses</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">2</span>
                          <span>Enroll in courses that interest you</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">3</span>
                          <span>Track your learning progress</span>
                        </li>
                      </>
                    )}
                    {user?.role === 'CREATOR' && (
                      <>
                        <li className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-purple-50/50 transition-colors">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold mt-0.5">1</span>
                          <span>Create your first course</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-purple-50/50 transition-colors">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold mt-0.5">2</span>
                          <span>Add lessons and content</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-purple-50/50 transition-colors">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold mt-0.5">3</span>
                          <span>Publish and manage courses</span>
                        </li>
                      </>
                    )}
                    {user?.role === 'ADMIN' && (
                      <>
                        <li className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-indigo-50/50 transition-colors">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold mt-0.5">1</span>
                          <span>Manage user accounts</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-indigo-50/50 transition-colors">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold mt-0.5">2</span>
                          <span>Review course content</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-700 p-2 rounded-lg hover:bg-indigo-50/50 transition-colors">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold mt-0.5">3</span>
                          <span>Monitor platform activity</span>
                        </li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AuthenticatedLayout>
  );
}
