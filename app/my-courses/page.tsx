'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProgress } from '@/hooks/useProgress';
import { CertificateDownload } from '@/components/progress/CertificateDownload';
import { useRouter } from 'next/navigation';

export default function MyCoursesPage() {
  const router = useRouter();
  const { progress, isLoading, error, refetch } = useProgress();

  if (isLoading) {
    return (
      <AuthenticatedLayout allowedRoles={['LEARNER', 'CREATOR', 'ADMIN']}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600">Loading your courses...</p>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout allowedRoles={['LEARNER', 'CREATOR', 'ADMIN']}>
        <div className="max-w-4xl mx-auto py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={refetch} className="mt-4">Try Again</Button>
        </div>
      </AuthenticatedLayout>
    );
  }

  const enrollments = progress?.data?.enrollments || [];

  return (
    <AuthenticatedLayout allowedRoles={['LEARNER', 'CREATOR', 'ADMIN']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-2">Track your learning progress and continue where you left off</p>
        </motion.div>

        {/* Empty State */}
        {enrollments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-6">Start learning by enrolling in courses</p>
            <Button onClick={() => router.push('/courses')}>
              Browse Courses
            </Button>
          </motion.div>
        )}

        {/* Course Grid */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment, index) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div
                    onClick={() => router.push(`/courses/${enrollment.course.id}`)}
                    className="relative"
                  >
                    {/* Course Thumbnail */}
                    {enrollment.course.thumbnail && (
                      <div className="relative h-48 bg-gray-200">
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Progress Badge */}
                        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-sm font-semibold flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span>{Math.round(enrollment.progress)}%</span>
                        </div>
                      </div>
                    )}

                    {/* Course Info */}
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {enrollment.course.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{enrollment.course.lessonCount} lessons</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{enrollment.course.level}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(enrollment.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Lesson Progress */}
                      <div className="text-sm text-gray-600 mb-4">
                        {enrollment.completedLessons || 0} of {enrollment.course.lessonCount} lessons completed
                      </div>

                      {/* Certificate Badge */}
                      {enrollment.progress >= 100 && (
                        <div className="flex items-center space-x-2 text-green-600 text-sm font-medium">
                          <Award className="w-5 h-5" />
                          <span>Completed - Certificate Available</span>
                        </div>
                      )}

                      {/* Actions */}
                      {enrollment.progress >= 100 ? (
                        <div className="flex flex-col gap-2 mt-4">
                          <CertificateDownload enrollmentId={enrollment.id} courseTitle={enrollment.course.title} />
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/courses/${enrollment.course.id}`);
                            }}
                            className="w-full"
                            variant="outline"
                          >
                            View Course
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/courses/${enrollment.course.id}`);
                          }}
                          className="w-full mt-4"
                          variant="default"
                        >
                          Continue Learning
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {enrollments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollments.filter(e => e.progress >= 100).length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollments.filter(e => e.progress > 0 && e.progress < 100).length}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
