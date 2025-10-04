'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { VideoPlayer } from '@/components/learn/VideoPlayer';
import { TranscriptSidebar } from '@/components/learn/TranscriptSidebar';
import { ProgressTracker } from '@/components/learn/ProgressTracker';
import { CompletionButton } from '@/components/learn/CompletionButton';
import { LessonNavigation } from '@/components/learn/LessonNavigation';
import { lessonAPI, courseAPI, LessonDetail } from '@/lib/api';

interface CourseProgress {
  progress: number;
  completedLessons: number;
  totalLessons: number;
}
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [lessons, setLessons] = useState<LessonDetail[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch lesson details and course lessons
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Fetch lesson details
        const lessonResponse = await lessonAPI.getLessonById(lessonId);
        setLesson(lessonResponse.data);

        // Fetch all lessons for navigation
        const lessonsResponse = await courseAPI.getCourseLessons(lessonResponse.data.courseId);
        setLessons(lessonsResponse.data);

        // Fetch course progress
        const progressResponse = await courseAPI.getCourseProgress(lessonResponse.data.courseId);
        setProgress({
          progress: progressResponse.data.enrollment.progress,
          completedLessons: progressResponse.data.enrollment.completedLessons,
          totalLessons: progressResponse.data.enrollment.totalLessons
        });
      } catch (err: any) {
        console.error('Failed to fetch lesson data:', err);
        setError(err.response?.data?.message || 'Failed to load lesson. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId]);

  const handleComplete = async () => {
    try {
      const response = await lessonAPI.completeLesson(lessonId);
      setProgress({
        progress: response.data.enrollment.progress,
        completedLessons: response.data.enrollment.completedLessons,
        totalLessons: response.data.enrollment.totalLessons
      });
      
      // Update lesson completion status
      if (lesson) {
        setLesson({ ...lesson, isCompleted: true });
      }
      
      // Update lessons list
      setLessons(lessons.map(l => 
        l.id === lessonId ? { ...l, isCompleted: true } : l
      ));
    } catch (err: any) {
      console.error('Failed to complete lesson:', err);
      throw err;
    }
  };

  // Loading state
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
            <p className="text-gray-600">Loading lesson...</p>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Error state
  if (error || !lesson) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-md mx-auto"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Lesson not found'}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              
              <Button asChild>
                <Link href="/courses">
                  Browse Courses
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Progress Tracker */}
        {progress && (
          <ProgressTracker
            progress={progress.progress}
            completedLessons={progress.completedLessons}
            totalLessons={progress.totalLessons}
          />
        )}

        {/* Lesson Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href={`/courses/${lesson.courseId}`}
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-4 h-4" />
              Back to Course
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-gray-600">{lesson.description}</p>
          )}
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4">
            {lesson.videoUrl ? (
              <VideoPlayer
                videoUrl={lesson.videoUrl}
                title={lesson.title}
              />
            ) : (
              <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No video available for this lesson</p>
              </div>
            )}

            {/* Completion Button */}
            <div className="flex justify-center">
              <CompletionButton
                lessonId={lessonId}
                isCompleted={lesson.isCompleted || false}
                onComplete={handleComplete}
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          {/* Transcript Sidebar - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <TranscriptSidebar
              transcript={lesson.transcript || 'No transcript available for this lesson.'}
            />
          </div>
        </div>

        {/* Lesson Navigation */}
        {lessons.length > 0 && (
          <LessonNavigation
            lessons={lessons}
            currentLessonId={lessonId}
            courseId={lesson.courseId}
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
