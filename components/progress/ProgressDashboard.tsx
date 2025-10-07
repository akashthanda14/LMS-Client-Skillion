'use client';

import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Award, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProgressCard } from './ProgressCard';
import { EnrollmentProgress } from '@/lib/api';

interface ProgressDashboardProps {
  enrollments: EnrollmentProgress[];
}

export function ProgressDashboard({ enrollments }: ProgressDashboardProps) {
  // Calculate statistics
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.progress === 100).length;
  const inProgressCourses = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const averageProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;

  const stats = [
    {
      label: 'Total Enrolled',
      value: totalCourses,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'In Progress',
      value: inProgressCourses,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Completed',
      value: completedCourses,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Average Progress',
      value: `${averageProgress}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  // Sort: completed first, then by progress
  const sortedEnrollments = [...enrollments].sort((a, b) => {
    if (a.progress === 100 && b.progress !== 100) return -1;
    if (a.progress !== 100 && b.progress === 100) return 1;
    return b.progress - a.progress;
  });

  if (enrollments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed"
      >
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Enrollments Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Start learning by enrolling in a course
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Course Progress Cards */}
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-2xl font-bold text-gray-900 mb-6"
        >
          Your Courses
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEnrollments.map((enrollment, index) => (
            <motion.div
              key={enrollment.enrollmentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            >
              <ProgressCard enrollment={enrollment} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
