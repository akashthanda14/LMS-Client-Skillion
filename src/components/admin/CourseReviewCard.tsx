'use client';

import { motion } from 'framer-motion';
import { BookOpen, User, Video, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PendingCourse } from '@/lib/api';
import Link from 'next/link';

interface CourseReviewCardProps {
  course: PendingCourse;
  onPublish: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

export function CourseReviewCard({
  course,
  onPublish,
  onReject,
  isProcessing = false,
}: CourseReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Thumbnail */}
        {course.thumbnailUrl && (
          <div className="relative w-full h-48 bg-gray-100">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            {!course.thumbnailUrl && (
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                {course.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>by {course.creatorName}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Video className="w-4 h-4" />
              <span>
                {course.lessonCount} {course.lessonCount === 1 ? 'Lesson' : 'Lessons'}
              </span>
            </div>
            {course.createdAt && (
              <span className="text-xs text-gray-400">
                Submitted {new Date(course.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {/* Preview Button */}
            <Button
              asChild
              variant="outline"
              className="w-full"
            >
              <Link href={`/courses/${course.id}`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                Preview Course
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => onPublish(course.id)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Publish
              </Button>
              <Button
                onClick={() => onReject(course.id)}
                disabled={isProcessing}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
