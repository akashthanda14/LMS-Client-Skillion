'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { VideoPlayer } from '@/components/learn/VideoPlayer';
import TranscriptViewer from '@/components/lesson/TranscriptViewer';
import { ProgressTracker } from '@/components/learn/ProgressTracker';
import { CompletionButton } from '@/components/learn/CompletionButton';
import { LessonNavigation } from '@/components/learn/LessonNavigation';
import { lessonAPI, courseAPI, LessonDetail, progressAPI } from '@/lib/api';
import { CertificateDownload } from '@/components/progress/CertificateDownload';

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
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [isPollingCert, setIsPollingCert] = useState(false);
  const [certError, setCertError] = useState<string>('');
  const [certificate, setCertificate] = useState<any>(null);
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

        // Fetch course progress (API returns EnrollmentDetail at data)
        const progressResponse = await courseAPI.getCourseProgress(lessonResponse.data.courseId);
        const enrollment = progressResponse.data;
  // save enrollment id for certificate flows
  setEnrollmentId(enrollment.id);
        setProgress({
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons,
          totalLessons: enrollment.totalLessons
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
  // completeLesson may return enrollment under data.enrollment or directly under data
  const enrollment = response.data?.enrollment ?? response.data;
      setProgress({
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        totalLessons: enrollment.totalLessons
      });
  // persist enrollmentId if returned (some responses don't include id)
  if ((enrollment as any).id) setEnrollmentId((enrollment as any).id);
      
      // Update lesson completion status
      if (lesson) {
        setLesson({ ...lesson, isCompleted: true });
      }
      
      // Update lessons list
      setLessons(lessons.map(l => 
        l.id === lessonId ? { ...l, isCompleted: true } : l
      ));

      // If course is now complete, start polling for certificate
      if (enrollment.progress >= 100) {
        setCertError('');
        setIsPollingCert(true);
        setCertificate(null);

        // use a cancellable pattern with a local flag
        let cancelled = false;
        const doPoll = async () => {
          try {
            const pollEnrollmentId = (enrollment as any).id || enrollmentId;
            if (!pollEnrollmentId) throw new Error('Missing enrollment id for certificate polling');
            const resp = await progressAPI.waitForCertificate(pollEnrollmentId, { intervalMs: 3000, timeoutMs: 60000 });
            if (cancelled) return;
            if (resp && resp.data && resp.data.certificate) {
              setCertificate(resp.data.certificate);
            } else {
              setCertError('Certificate metadata returned unexpected shape');
            }
          } catch (err: any) {
            if (cancelled) return;
            // timeout or other errors
            const msg = err?.message || err?.response?.data?.message || 'Failed to fetch certificate';
            setCertError(msg.includes('timed out') ? 'Certificate generation timed out' : msg);
          } finally {
            if (!cancelled) setIsPollingCert(false);
          }
        };

        doPoll();

        // optional: expose cancel via closure by returning a function (not used here)
      }
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
            <TranscriptViewer
              lessonId={lessonId}
              initialTranscript={lesson.transcript || undefined}
              lessonTitle={lesson.title}
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

        {/* Certificate area */}
        {enrollmentId && (
          <div className="mt-6">
            {isPollingCert && (
              <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                  <div>
                    <p className="font-medium">Generating certificate…</p>
                    <p className="text-sm text-gray-600">This may take up to a minute.</p>
                  </div>
                </div>
              </div>
            )}

            {certError && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200 mt-2">
                <p className="text-red-700 font-medium">{certError}</p>
                <div className="mt-2">
                  <Button onClick={async () => {
                    setCertError('');
                    setIsPollingCert(true);
                    try {
                      const resp = await progressAPI.waitForCertificate(enrollmentId!, { intervalMs: 3000, timeoutMs: 60000 });
                      if (resp?.data?.certificate) setCertificate(resp.data.certificate);
                    } catch (e: any) {
                      setCertError(e?.message || 'Retry failed');
                    } finally {
                      setIsPollingCert(false);
                    }
                  }} className="mt-2">Retry</Button>
                </div>
              </div>
            )}

            {certificate && (
              <div className="mt-4 p-4 border rounded-md bg-white">
                <h3 className="text-lg font-semibold">Certificate ready</h3>
                <p className="text-sm text-gray-600">Issued: {new Date(certificate.issuedAt).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Serial: {certificate.serialHash}</p>
                <div className="mt-3">
                  <CertificateDownload enrollmentId={enrollmentId} courseTitle={lesson.title} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
