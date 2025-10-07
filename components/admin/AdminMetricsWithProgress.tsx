'use client';

import { motion } from 'framer-motion';
import { Users, FileText, BookOpen, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AdminMetrics as AdminMetricsType } from '@/lib/api';

interface AdminMetricsProps {
  metrics: AdminMetricsType;
}

function numberOrZero(n?: number | null) {
  return typeof n === 'number' ? n : 0;
}

export function AdminMetricsWithProgress({ metrics }: AdminMetricsProps) {
  // Users
  const usersTotal = numberOrZero(metrics.users?.total);
  const usersStudents = numberOrZero(metrics.users?.byRole?.USER);
  const usersCreators = numberOrZero(metrics.users?.byRole?.CREATOR);

  const studentPct = usersTotal > 0 ? Math.round((usersStudents / usersTotal) * 100) : 0;
  const creatorPct = usersTotal > 0 ? Math.round((usersCreators / usersTotal) * 100) : 0;

  // Applications
  const appPending = numberOrZero(metrics.applications?.byStatus?.PENDING);
  const appApproved = numberOrZero(metrics.applications?.byStatus?.APPROVED);
  const appRejected = numberOrZero(metrics.applications?.byStatus?.REJECTED);
  const appTotal = appPending + appApproved + appRejected;
  const appApprovedPct = appTotal > 0 ? Math.round((appApproved / appTotal) * 100) : 0;
  const appPendingPct = appTotal > 0 ? Math.round((appPending / appTotal) * 100) : 0;
  const appRejectedPct = appTotal > 0 ? Math.round((appRejected / appTotal) * 100) : 0;

  // Courses
  const coursesTotal = numberOrZero(metrics.courses?.total);
  const coursesPublished = numberOrZero(metrics.courses?.byStatus?.PUBLISHED);
  const coursesPending = numberOrZero(metrics.courses?.byStatus?.PENDING);
  const coursesDraft = numberOrZero(metrics.courses?.byStatus?.DRAFT);
  const pubPct = coursesTotal > 0 ? Math.round((coursesPublished / coursesTotal) * 100) : 0;
  const coursePendingPct = coursesTotal > 0 ? Math.round((coursesPending / coursesTotal) * 100) : 0;
  const draftPct = coursesTotal > 0 ? Math.round((coursesDraft / coursesTotal) * 100) : 0;

  // Enrollments
  const enrollTotal = numberOrZero(metrics.enrollments?.total);

  const cardMotion = (index: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: index * 0.1 },
  });

  const ProgressRow = ({
    label,
    percent,
    barClass = 'bg-gradient-to-r from-blue-400 to-blue-600',
    labelClass = 'text-gray-700',
    percentClass = 'text-blue-600 font-semibold',
  }: {
    label: string;
    percent: number;
    barClass?: string;
    labelClass?: string;
    percentClass?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`${labelClass} text-sm`}>{label}</span>
        <span className={`${percentClass} text-sm`}>{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <motion.div
          className={`${barClass} h-3 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8 }}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Users Card */}
      <motion.div {...cardMotion(0)}>
        <Card className="p-6 bg-white border border-gray-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-blue-600 mb-1">Users</h3>
              <p className="text-sm text-gray-700 mb-3">Total: <span className="font-semibold text-gray-900">{usersTotal.toLocaleString()}</span></p>

              <div className="space-y-3">
                <ProgressRow label="Students" percent={studentPct} />
                <ProgressRow label="Creators" percent={creatorPct} />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Applications Card */}
      <motion.div {...cardMotion(1)}>
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-blue-700 mb-1">Applications</h3>
              <p className="text-sm text-gray-700 mb-3">Total: <span className="font-semibold text-gray-900">{appTotal}</span></p>

              <div className="space-y-3">
                <ProgressRow label="Approved" percent={appApprovedPct} barClass="bg-gradient-to-r from-blue-500 to-sky-500" />
                <ProgressRow label="Pending" percent={appPendingPct} barClass="bg-gradient-to-r from-sky-400 to-blue-400" />
                <ProgressRow label="Rejected" percent={appRejectedPct} barClass="bg-gradient-to-r from-gray-300 to-gray-400" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Courses Card */}
      <motion.div {...cardMotion(2)}>
        <Card className="p-6 bg-white border-2 border-blue-100 hover:border-blue-300">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-blue-600 mb-1">Courses</h3>
              <p className="text-sm text-gray-700 mb-3">Total: <span className="font-semibold text-gray-900">{coursesTotal.toLocaleString()}</span></p>

              <div className="space-y-3">
                <ProgressRow label="Published" percent={pubPct} barClass="bg-gradient-to-r from-blue-600 to-blue-500" />
                <ProgressRow label="Pending" percent={coursePendingPct} barClass="bg-gradient-to-r from-sky-500 to-blue-400" />
                <ProgressRow label="Draft" percent={draftPct} barClass="bg-gradient-to-r from-blue-300 to-sky-300" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enrollments Card (optional) */}
      {typeof metrics.enrollments !== 'undefined' && (
        <motion.div {...cardMotion(3)}>
          <Card className="p-6 bg-gradient-to-br from-white to-blue-50">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-blue-600 mb-1">Enrollments</h3>
                <p className="text-sm text-gray-700 mb-3">Total: <span className="font-semibold text-gray-900">{enrollTotal.toLocaleString()}</span></p>

                <ProgressRow label="Enrollment Index" percent={enrollTotal > 0 ? 100 : 0} barClass="bg-gradient-to-r from-blue-500 to-sky-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
