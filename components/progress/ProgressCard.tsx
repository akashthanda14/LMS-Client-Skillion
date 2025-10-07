'use client';

import { motion } from 'framer-motion';
import { BookOpen, Play, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressChart } from './ProgressChart';
import { CompletionBadge } from './CompletionBadge';
import { CertificateDownload } from './CertificateDownload';
import { EnrollmentProgress } from '@/lib/api';
import Link from 'next/link';

interface ProgressCardProps {
  enrollment: EnrollmentProgress;
}

export function ProgressCard({ enrollment }: ProgressCardProps) {
  const isComplete = enrollment.progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${isComplete ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}>
        {/* Thumbnail */}
        <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100">
          {enrollment.thumbnailUrl ? (
            <img
              src={enrollment.thumbnailUrl}
              alt={enrollment.courseTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-blue-300" />
            </div>
          )}

          {/* Completion Badge Overlay */}
          {isComplete && (
            <div className="absolute top-4 right-4">
              <CompletionBadge size="sm" />
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
              {enrollment.courseTitle}
            </h3>
            <p className="text-sm text-gray-600">
              {enrollment.completedLessons} of {enrollment.totalLessons} lessons completed
            </p>
          </div>

          {/* Progress Chart */}
          <div className="flex justify-center py-4">
            <ProgressChart percent={enrollment.progress} size="md" />
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t">
            {isComplete ? (
              <>
                {/* Completion Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <Award className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-green-800">
                    🎉 Course Completed!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    You've earned your certificate
                  </p>
                </div>

                {/* Certificate Download */}
                <CertificateDownload
                  enrollmentId={enrollment.enrollmentId}
                  courseTitle={enrollment.courseTitle}
                />

                {/* View Course Button */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href={`/courses/${enrollment.courseId}`}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Course
                  </Link>
                </Button>
              </>
            ) : (
              <>
                {/* Continue Learning Button */}
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Link href={`/courses/${enrollment.courseId}`}>
                    <Play className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Link>
                </Button>

                {/* Progress Details */}
                <div className="text-xs text-center text-gray-500">
                  {enrollment.totalLessons - enrollment.completedLessons} lessons remaining
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
