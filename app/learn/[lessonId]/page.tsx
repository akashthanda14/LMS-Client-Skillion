'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/auth/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { VideoPlayer } from '@/components/learn/VideoPlayer';
import TranscriptViewer from '@/components/lesson/TranscriptViewer';
import { ProgressTracker } from '@/components/learn/ProgressTracker';
import { CompletionButton } from '@/components/learn/CompletionButton';
import { LessonNavigation } from '@/components/learn/LessonNavigation';
import { lessonAPI, courseAPI, LessonDetail } from '@/lib/api';
import { getApiBase } from '@/lib/apiBase';
import { getToken } from '@/utils/tokenStorage';
import CoursePageCertificateBanner from '@/components/progress/CoursePageCertificateBanner';

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
  const { isAuthenticated } = useAuth();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [lessons, setLessons] = useState<LessonDetail[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number | undefined>(undefined);

  const getErrorMessage = (err: unknown, fallback = 'An error occurred') => {
    if (err instanceof Error) return err.message;
    const resp = err as unknown as { response?: { data?: { message?: string } } } | null;
    return resp?.response?.data?.message ?? fallback;
  }

  // Fetch lesson details and course lessons
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setIsLoading(true);
        setError('');

  // Fetch lesson details using fetch (avoid axios interceptor that redirects on 401)
  const base = getApiBase();

  // Try to attach an auth token if available. Prefer legacy 'token' key then tokenStorage strategy.
  const storedToken = typeof window !== 'undefined' ? (localStorage.getItem('token') || null) : null;
  const utilToken = getToken();
  const tokenToUse = storedToken || utilToken || '';

  const fetchHeaders: Record<string, string> = {};
  if (tokenToUse) fetchHeaders['Authorization'] = `Bearer ${tokenToUse}`;

  const lessonRes = await fetch(`${base}/api/lessons/${lessonId}`, { headers: fetchHeaders });
        if (!lessonRes.ok) {
          // If backend returns 401/403, avoid throwing and instead show a friendly message
          if (lessonRes.status === 401 || lessonRes.status === 403) {
            const errJson = await lessonRes.json().catch(()=>({ message: 'Access denied' }));
            const msg = errJson?.message || 'Login required to view this lesson';
            setError(msg.includes('Access denied') ? 'This lesson requires sign in to view.' : msg);
            setIsLoading(false);
            return;
          }

          const errText = await lessonRes.text().catch(()=>(''));
          throw new Error(lessonRes.status === 404 ? 'Lesson not found' : errText || 'Failed to fetch lesson');
        }

        const lessonJson = await lessonRes.json().catch(()=>({}));
        const lessonData: LessonDetail = lessonJson.data || lessonJson.lesson || lessonJson;
        setLesson(lessonData as LessonDetail);

        // Fetch all lessons for navigation (public endpoint)
  const lessonsRes = await fetch(`${base}/api/courses/${lessonData.courseId}/lessons`, { headers: fetchHeaders });
        if (lessonsRes.ok) {
          const lessonsJson = await lessonsRes.json().catch(()=>({}));
          const lessonsData = lessonsJson.data || lessonsJson.lessons || lessonsJson;
          setLessons(lessonsData || []);
        } else {
          // If lessons list is not accessible, continue without navigation list
          console.warn('Failed to fetch course lessons:', lessonsRes.status);
        }

        // Fetch course progress only if authenticated (avoids forcing auth redirect on public video play)
        if (isAuthenticated) {
          const progressResponse = await courseAPI.getCourseProgress(lessonData.courseId);
          const enrollment = progressResponse.data;
          // save enrollment id for certificate flows
          setEnrollmentId(enrollment.id);
          setProgress({
            progress: enrollment.progress,
            completedLessons: enrollment.completedLessons,
            totalLessons: enrollment.totalLessons
          });
        }
      } catch (err: unknown) {
        console.error('Failed to fetch lesson data:', err);
        setError(getErrorMessage(err, 'Failed to load lesson. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId, isAuthenticated]);

  const handleComplete = async () => {
    try {
      const response = await lessonAPI.completeLesson(lessonId);
  // completeLesson may return enrollment under data.enrollment or directly under data
  const enrollment = response.data?.enrollment ?? response.data;
      setProgress({
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        totalLessons: enrollment.totalLessons
      });
  // persist enrollmentId if returned (some responses don't include id)
  if ((enrollment as { id?: string }).id) setEnrollmentId((enrollment as { id?: string }).id ?? null);
      
      // Update lesson completion status
      if (lesson) {
        setLesson({ ...lesson, isCompleted: true });
      }
      
      // Update lessons list
      setLessons(lessons.map(l => 
        l.id === lessonId ? { ...l, isCompleted: true } : l
      ));

  // Certificate generation/polling is handled by the CoursePageCertificateBanner component.
    } catch (err: unknown) {
      console.error('Failed to complete lesson:', err);
      throw err;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh]">
        <Navigation />
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4 p-8"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600">Loading lesson...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lesson) {
    return (
      <div className="min-h-[60vh]">
        <Navigation />
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-md mx-auto p-8"
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
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="space-y-6 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                onTimeUpdate={(t) => setCurrentTime(t)}
                onSeek={(t) => {
                  const vid = document.querySelector('video[aria-label]') as HTMLVideoElement | null;
                  if (vid) {
                    vid.currentTime = t;
                    vid.play().catch(() => {});
                  }
                }}
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

          {/* Transcript viewer - synced with the player */}
          <div className="lg:col-span-1">
            <TranscriptViewer lessonId={lessonId} lessonTitle={lesson.title} currentTime={currentTime} onSeek={(t) => {
              const vid = document.querySelector('video[aria-label]') as HTMLVideoElement | null;
              if (vid) {
                vid.currentTime = t;
                vid.play().catch(() => {});
              }
            }} />
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

        {/* Certificate area (wrapped by reusable component) */}
        <CoursePageCertificateBanner
          enrollmentId={enrollmentId}
          progress={progress?.progress ?? 0}
        />
      </div>
    </div>
  );
}
