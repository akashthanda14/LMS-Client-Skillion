'use client';

import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AdminMetrics as AdminMetricsType } from '@/lib/api';

interface AdminMetricsProps {
  metrics: AdminMetricsType;
}

export function AdminMetrics({ metrics }: AdminMetricsProps) {
  const metricsData = [
    {
      label: 'Total Users',
      value: metrics.users?.total || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      subtitle: `+${metrics.users?.recentSignups || 0} recent`,
    },
    {
      label: 'Creators',
      value: metrics.users?.byRole?.CREATOR || 0,
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      subtitle: `${metrics.users?.byRole?.ADMIN || 0} admins`,
    },
    {
      label: 'Published Courses',
      value: metrics.courses?.byStatus?.PUBLISHED || 0,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      subtitle: `${metrics.courses?.total || 0} total`,
    },
    {
      label: 'Total Enrollments',
      value: metrics.enrollments?.total || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      subtitle: `${metrics.enrollments?.completionRate || '0'}% completion`,
    },
    {
      label: 'Pending Applications',
      value: metrics.applications?.byStatus?.PENDING || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      highlight: (metrics.applications?.byStatus?.PENDING || 0) > 0,
      subtitle: `${metrics.applications?.total || 0} total`,
    },
    {
      label: 'Pending Courses',
      value: metrics.courses?.byStatus?.PENDING || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      highlight: (metrics.courses?.byStatus?.PENDING || 0) > 0,
      subtitle: `${metrics.courses?.byStatus?.DRAFT || 0} drafts`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card
              className={`p-6 ${
                metric.highlight ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${metric.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-7 h-7 ${metric.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {metric.value.toLocaleString()}
                  </p>
                  {metric.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {metric.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
