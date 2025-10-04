'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import Link from 'next/link';
import { LessonDetail } from '@/lib/api';
import { useState } from 'react';

interface LessonNavigationProps {
  lessons: LessonDetail[];
  currentLessonId: string;
  courseId: string;
  className?: string;
}

export function LessonNavigation({
  lessons,
  currentLessonId,
  courseId,
  className = '',
}: LessonNavigationProps) {
  const [showLessonList, setShowLessonList] = useState(false);
  
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
  const previousLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];

  return (
    <div className={className}>
      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-4 bg-white rounded-lg shadow-md p-4"
      >
        {/* Previous Lesson */}
        {previousLesson ? (
          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2"
          >
            <Link href={`/learn/${previousLesson.id}`}>
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Link>
          </Button>
        ) : (
          <div className="w-24" />
        )}

        {/* Lesson List Toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowLessonList(!showLessonList)}
          className="flex items-center gap-2"
        >
          <List className="w-4 h-4" />
          <span className="hidden sm:inline">
            Lesson {currentIndex + 1} of {lessons.length}
          </span>
          <span className="sm:hidden">{currentIndex + 1}/{lessons.length}</span>
        </Button>

        {/* Next Lesson */}
        {nextLesson ? (
          <Button
            asChild
            className="flex items-center gap-2"
          >
            <Link href={`/learn/${nextLesson.id}`}>
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        ) : (
          <div className="w-24" />
        )}
      </motion.div>

      {/* Lesson List Dropdown */}
      {showLessonList && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 bg-white rounded-lg shadow-md p-4 max-h-96 overflow-y-auto"
        >
          <h3 className="font-semibold text-gray-900 mb-3">All Lessons</h3>
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={`/learn/${lesson.id}`}
                className={`block p-3 rounded-md transition-colors ${
                  lesson.id === currentLessonId
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        {index + 1}.
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          lesson.id === currentLessonId
                            ? 'text-blue-700'
                            : 'text-gray-900'
                        }`}
                      >
                        {lesson.title}
                      </span>
                    </div>
                    {lesson.duration && (
                      <span className="text-xs text-gray-500 ml-6">
                        {lesson.duration}
                      </span>
                    )}
                  </div>
                  {lesson.isCompleted && (
                    <span className="text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded">
                      ✓
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
