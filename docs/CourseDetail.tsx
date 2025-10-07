'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CourseDetail as CourseDetailType, courseAPI } from '@/lib/api';
import { EnrollButton } from '@/components/courses/EnrollButton';
import { Clock, Users, BookOpen, CheckCircle, Play, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import CoursePageCertificateBanner from '@/components/progress/CoursePageCertificateBanner';

interface CourseDetailProps {
  course: CourseDetailType;
}

export function CourseDetail({ course }: CourseDetailProps) {
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    enrolled: boolean;
    progress?: number;
    enrollmentId?: string;
  }>({
    enrolled: course.enrolled ?? course.isEnrolled ?? false,
    progress: 0
  });
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  // Check enrollment status on mount and when course changes
  const checkEnrollment = useCallback(async () => {
    try {
      setCheckingEnrollment(true);
      const response = await courseAPI.checkEnrollmentStatus(course.id);
      
      if (response.success && response.data) {
        setEnrollmentStatus({
          enrolled: response.data.enrolled ?? false,
          progress: response.data.enrollment?.progress,
          enrollmentId: response.data.enrollment?.id
        });
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
      // Keep current status if check fails
    } finally {
      setCheckingEnrollment(false);
    }
  }, [course.id]);

  useEffect(() => {
    checkEnrollment();
  }, [checkEnrollment]);

  const handleEnrollmentSuccess = () => {
    // Refresh enrollment status after successful enrollment
    checkEnrollment();
  };
  const getLevelColor = (level: CourseDetailType['level']) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getCreatorName = () => {
    return course.creator.name || course.creator.username || 'Anonymous';
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Play className="w-4 h-4" />;
      case 'QUIZ':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column - Course Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={getLevelColor(course.level)}>
                {course.level}
              </Badge>
              {course.lessonCount > 0 && (
                <Badge variant="outline">
                  {course.lessonCount} Lessons
                </Badge>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {course.title}
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              {course.description}
            </p>

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.duration)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{course.enrollmentCount} students</span>
              </div>

              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.lessonCount} lessons</span>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Created by <span className="font-medium">{getCreatorName()}</span>
            </p>
          </div>

          {/* Course Image */}
          <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-white text-6xl font-bold">
                  {course.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

                  {/* Certificate banner for enrolled users */}
                  {enrollmentStatus.enrolled && (
                    <div className="mt-4">
                      <CoursePageCertificateBanner
                        enrollmentId={enrollmentStatus.enrollmentId}
                        progress={enrollmentStatus.progress ?? 0}
                      />
                    </div>
                  )}
          </div>

          {/* Course Description Sections */}
          <div className="space-y-6">
            {course.syllabus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Course Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {course.syllabus}
                  </p>
                </CardContent>
              </Card>
            )}

            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    What You&apos;ll Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {course.learningOutcomes.map((outcome, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{outcome}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column - Enrollment Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="sticky top-6"
          >
            <Card className="border-2 border-blue-100">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {checkingEnrollment ? (
                    <Button disabled size="lg" className="w-full">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Checking enrollment...
                    </Button>
                  ) : enrollmentStatus.enrolled ? (
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      {enrollmentStatus.progress !== undefined && enrollmentStatus.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Your Progress</span>
                            <span className="font-medium text-gray-900">
                              {enrollmentStatus.progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${enrollmentStatus.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Start/Continue Learning Button */}
                      <Button
                        asChild
                        size="lg"
                        className="w-full flex items-center gap-2"
                      >
                        <Link href={`/learn/${course.lessons[0]?.id}`}>
                          <Play className="w-4 h-4" />
                          {enrollmentStatus.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <EnrollButton
                      courseId={course.id}
                      isEnrolled={false}
                      onEnrollmentSuccess={handleEnrollmentSuccess}
                      className="w-full"
                    />
                  )}

                  <div className="border-t pt-4 space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lessons:</span>
                      <span className="font-medium">{course.lessons.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Students:</span>
                      <span className="font-medium">{course.enrollmentCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Course Curriculum */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Course Curriculum ({course.lessons.length} lessons)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getLessonIcon(lesson.type)}
                        <h4 className="font-medium text-gray-900 truncate">
                          {lesson.title}
                        </h4>
                      </div>
                      {lesson.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.duration}</span>
                    {lesson.isCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
