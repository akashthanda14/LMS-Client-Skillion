'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { CourseEditor } from '@/components/creator/CourseEditor';
import { LessonUploader } from '@/components/creator/LessonUploader';
import { LessonList } from '@/components/creator/LessonList';
import { SubmitCourseButton } from '@/components/creator/SubmitCourseButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { courseAPI, CourseDetail, LessonDetail } from '@/lib/api';

interface CourseEditPageProps {
  params: {
    id: string;
  };
}

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lessons, setLessons] = useState<LessonDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch course details
      const courseData = await courseAPI.getCourseById(params.id);
      setCourse(courseData);

      // Fetch lessons
      const lessonsResponse = await courseAPI.getCourseLessons(params.id);
      setLessons(lessonsResponse.data || []);
    } catch (err: any) {
      console.error('Failed to load course:', err);
      const errorMessage =
        err.response?.data?.message || 'Failed to load course data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [params.id]);

  const handleCourseSubmitted = () => {
    // Show success message and redirect to dashboard
    alert('Course submitted successfully! An admin will review it soon.');
    router.push('/creator/dashboard');
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
            <p className="text-gray-600">Loading course...</p>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !course) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Course not found'}
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/creator/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const isDraft = course.status === 'DRAFT';
  const canEdit = isDraft;

  return (
    <AuthenticatedLayout>
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
              onClick={() => router.push('/creator/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Course
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    course.status === 'PUBLISHED'
                      ? 'default'
                      : course.status === 'PENDING'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {course.status}
                </Badge>
                <span className="text-sm text-gray-600">
                  {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {isDraft && (
            <SubmitCourseButton
              courseId={course.id}
              courseTitle={course.title}
              lessonCount={lessons.length}
              onSubmitted={handleCourseSubmitted}
            />
          )}
        </motion.div>

        {/* Status Warning */}
        {!canEdit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {course.status === 'PENDING' &&
                  'This course is under review. You cannot make changes until it is reviewed.'}
                {course.status === 'PUBLISHED' &&
                  'This course is published. Contact support to make changes.'}
                {course.status === 'ARCHIVED' &&
                  'This course is archived. Contact support to reactivate it.'}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Course Details Editor */}
        {canEdit && (
          <CourseEditor course={course} onSaved={fetchCourseData} />
        )}

        {/* Lessons Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Course Lessons
            </h2>
            <p className="text-gray-600">
              Upload and organize your video lessons. Drag to reorder.
            </p>
          </div>

          {/* Upload Section */}
          {canEdit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <LessonUploader
                courseId={course.id}
                lessonOrder={lessons.length + 1}
                onUploadComplete={fetchCourseData}
              />
            </motion.div>
          )}

          {/* Lessons List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LessonList
              lessons={lessons}
              onLessonsUpdated={fetchCourseData}
            />
          </motion.div>
        </div>

        {/* Bottom Submit Button (for convenience on long pages) */}
        {isDraft && lessons.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center pt-8 border-t"
          >
            <SubmitCourseButton
              courseId={course.id}
              courseTitle={course.title}
              lessonCount={lessons.length}
              onSubmitted={handleCourseSubmitted}
            />
          </motion.div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
