"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Play,
  FileText,
  User,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getCourseForReview, publishCourse, rejectCourse } from '@/services/adminCourseService';

export default function CourseReviewClient({ courseId }: { courseId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isCoursePreviewOpen, setIsCoursePreviewOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-course-review', courseId],
    queryFn: () => getCourseForReview(courseId),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishCourse(courseId),
    onSuccess: () => {
      toast.success('Course published successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      router.push('/admin/courses');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish course');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (feedback: string) => rejectCourse(courseId, feedback),
    onSuccess: () => {
      toast.success('Course rejected with feedback');
      setRejectDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      router.push('/admin/courses');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject course');
    },
  });

  const handleReject = () => {
    if (rejectionFeedback.trim().length < 10) {
      toast.error('Feedback must be at least 10 characters');
      return;
    }
    rejectMutation.mutate(rejectionFeedback);
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error || !data?.data?.course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load course</AlertDescription>
        </Alert>
      </div>
    );
  }

  // narrow to any to satisfy TS checks; service returns structured course object
  const course = (data.data.course as any);
  const canReview = course?.status === 'PENDING';

  const lessons: any[] = course.lessons || [];
  const currentLessonIndex = selectedLesson ? lessons.findIndex(l => l.id === selectedLesson) : -1;
  const currentLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex] : null;

  const openLesson = (lessonId: string) => {
    setSelectedLesson(lessonId);
    setIsCoursePreviewOpen(true);
  };

  const navigateLesson = (direction: 'prev' | 'next') => {
    if (currentLessonIndex === -1) return;
    const newIndex = direction === 'prev' ? currentLessonIndex - 1 : currentLessonIndex + 1;
    if (newIndex >= 0 && newIndex < lessons.length) {
      setSelectedLesson(lessons[newIndex].id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-4">
              <Badge variant={course.status === 'PENDING' ? 'destructive' : 'secondary'}>
                {course.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {course.stats.lessonCount} lessons
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.floor(course.duration / 60)} min total
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                if (lessons.length > 0) {
                  openLesson(lessons[0].id);
                } else {
                  toast.info('No lessons to preview');
                }
              }}
            >
              <Play className="h-4 w-4 mr-2" /> Preview
            </Button>
            {canReview && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publish Course
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Thumbnail */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {course.description}
              </p>
            </CardContent>
          </Card>

          {/* Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>Lessons ({course.lessons.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-auto">
                <div className="space-y-4">
          {course.lessons.map((lesson: any, index: number) => (
                    <div
                      key={lesson.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => openLesson(lesson.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-1">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {lesson.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(lesson.duration / 60)} min
                            </span>
                            {lesson.videoUrl && (
                              <span className="flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                Video
                              </span>
                            )}
                            {lesson.transcript && (
                              <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              Transcript
                            </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Creator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">{course.creator.name}</p>
                <p className="text-sm text-muted-foreground">@{course.creator.username}</p>
              </div>
              <hr className="my-2" />
              <div className="text-sm">
                <p className="text-muted-foreground">{course.creator.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{course.category}</p>
              </div>
              <hr className="my-2" />
              <div>
                <p className="text-muted-foreground">Level</p>
                <p className="font-medium">{course.level}</p>
              </div>
              <hr className="my-2" />
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p className="font-medium">
                  {course.submittedAt
                    ? new Date(course.submittedAt).toLocaleDateString()
                    : 'Not submitted'}
                </p>
              </div>
              {course.publishedAt && (
                <>
                  <hr className="my-2" />
                  <div>
                    <p className="text-muted-foreground">Published</p>
                    <p className="font-medium">
                      {new Date(course.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Rejection Reason (if rejected) */}
          {course.status === 'REJECTED' && course.rejectionReason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{course.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Lesson / Course Preview Modal */}
      {isCoursePreviewOpen && currentLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-full max-w-5xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center gap-3 min-w-0">
                <Badge variant="secondary" className="text-xs">Lesson {currentLessonIndex + 1} / {lessons.length}</Badge>
                <h3 className="font-semibold truncate max-w-[40ch]">{currentLesson.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentLessonIndex <= 0}
                  onClick={() => navigateLesson('prev')}
                >Prev</Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentLessonIndex >= lessons.length - 1}
                  onClick={() => navigateLesson('next')}
                >Next</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsCoursePreviewOpen(false); setSelectedLesson(null); }}
                >Close</Button>
              </div>
            </div>
            {/* Body */}
            <div className="grid gap-6 md:grid-cols-3 flex-1 overflow-hidden">
              <div className="md:col-span-2 flex flex-col overflow-hidden">
                <div className="aspect-video bg-black flex items-center justify-center relative">
                  {currentLesson.videoUrl ? (
                    <video
                      key={currentLesson.id}
                      src={currentLesson.videoUrl}
                      controls
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <div className="text-white text-sm opacity-70">No video for this lesson</div>
                  )}
                </div>
                <div className="p-4 space-y-3 overflow-y-auto">
                  <div>
                    <h4 className="font-semibold mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {currentLesson.description || 'No description provided.'}
                    </p>
                  </div>
                  {currentLesson.transcript && (
                    <div className="space-y-2">
                      <h4 className="font-semibold mb-1 flex items-center gap-2"><FileText className="w-4 h-4" /> Transcript</h4>
                      <div className="border rounded-md p-3 max-h-52 overflow-y-auto bg-muted/30 text-xs leading-relaxed whitespace-pre-wrap">
                        {currentLesson.transcript.slice(0, 800)}{currentLesson.transcript.length > 800 && '...'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-l flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-muted/20">
                  <h4 className="font-semibold text-sm">All Lessons</h4>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ul className="divide-y">
                    {lessons.map((l, idx) => (
                      <li
                        key={l.id}
                        className={`px-4 py-3 text-sm cursor-pointer flex items-start gap-3 hover:bg-muted/40 ${l.id === currentLesson.id ? 'bg-muted/50 font-medium' : ''}`}
                        onClick={() => setSelectedLesson(l.id)}
                      >
                        <span className="text-xs mt-0.5 w-6 shrink-0 text-center rounded bg-muted px-1 py-0.5">{idx + 1}</span>
                        <div className="min-w-0">
                          <p className="truncate">{l.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                            {l.duration && <span>{Math.floor(l.duration/60)}m</span>}
                            {l.videoUrl && <span className="flex items-center gap-1"><Play className="w-3 h-3" />vid</span>}
                            {l.transcript && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />txt</span>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* Footer (actions) */}
            {canReview && (
              <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30 gap-3 flex-wrap">
                <div className="text-xs text-muted-foreground">Previewing: {course.title}</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => publishMutation.mutate()}
                    disabled={publishMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Publish
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-medium">Reject Course</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Provide detailed feedback to help the creator improve their course. Minimum 10 characters required.
            </p>
            <Textarea
              placeholder="Explain what needs to be improved..."
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending || rejectionFeedback.length < 10}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Course'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
