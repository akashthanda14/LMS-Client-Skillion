'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, BookCheck } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { CourseReviewCard } from '@/components/admin/CourseReviewCard';
import { ApprovalModal } from '@/components/admin/ApprovalModal';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePendingCourses } from '@/hooks/usePendingCourses';
import { CourseForReview, PendingCourse } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ReviewCoursesPage() {
  const router = useRouter();
  const { courses, isLoading, error, publishCourse, rejectCourse } = usePendingCourses();
  const [selectedCourse, setSelectedCourse] = useState<CourseForReview | null>(null);
  
  // Transform CourseForReview to PendingCourse format for the card component
  const transformedCourses: PendingCourse[] = courses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    creatorName: course.creator.name || course.creator.email,
    lessonCount: course.lessonCount,
    thumbnailUrl: course.thumbnailUrl,
    createdAt: course.createdAt,
  }));
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  const handlePublish = (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (course) {
      setSelectedCourse(course);
      setModalType('approve');
      setShowModal(true);
    }
  };

  const handleReject = (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (course) {
      setSelectedCourse(course);
      setModalType('reject');
      setShowModal(true);
    }
  };

  const handleConfirm = async (comments: string) => {
    if (!selectedCourse) return;

    try {
      setActionLoading(true);
      if (modalType === 'approve') {
        await publishCourse(selectedCourse.id);
        setSuccessMessage(`✓ Published "${selectedCourse.title}"`);
      } else {
        await rejectCourse(selectedCourse.id, comments);
        setSuccessMessage(`✓ Rejected "${selectedCourse.title}"`);
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Action failed:', err);
      alert(err.response?.data?.message || 'Action failed. Please try again.');
      throw err; // Re-throw to keep modal open
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600">Loading pending courses...</p>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
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
              <h1 className="text-3xl font-bold text-gray-900">Course Review Queue</h1>
              <p className="text-gray-600 mt-1">
                Review and publish pending courses
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-lg">
            <BookCheck className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-900">
              {courses.length} Pending
            </span>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Empty State */}
        {!error && courses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed"
          >
            <BookCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600">
              No pending courses to review at the moment.
            </p>
          </motion.div>
        )}

        {/* Courses Grid */}
        {!error && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedCourses.map((course) => (
              <CourseReviewCard
                key={course.id}
                course={course}
                onPublish={handlePublish}
                onReject={handleReject}
              />
            ))}
          </div>
        )}

        {/* Approval Modal */}
        <AnimatePresence>
          {showModal && selectedCourse && (
            <ApprovalModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title={
                modalType === 'approve'
                  ? 'Publish Course'
                  : 'Reject Course'
              }
              description={
                modalType === 'approve'
                  ? `You are about to publish "${selectedCourse.title}". It will be visible to all learners on the platform.`
                  : `You are about to reject "${selectedCourse.title}". The creator will be notified and can resubmit after making improvements.`
              }
              type={modalType}
              onConfirm={handleConfirm}
              itemType="course"
            />
          )}
        </AnimatePresence>
      </div>
    </AuthenticatedLayout>
  );
}
