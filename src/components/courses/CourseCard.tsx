'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Course } from '@/lib/api';
import { Clock, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CourseCardProps {
  course: Course;
  index?: number;
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-emerald-100 text-emerald-800';
      case 'INTERMEDIATE':
        return 'bg-amber-100 text-amber-800';
      case 'ADVANCED':
        return 'bg-rose-100 text-rose-800';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="h-full group"
    >
      <Link href={`/courses/${course.id}`} className="block h-full">
        <div className="h-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
          {/* Course Thumbnail */}
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            {(course.thumbnail || course.thumbnailUrl) ? (
              <Image
                src={course.thumbnail || course.thumbnailUrl || ''}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-600)]">
                <span className="text-white text-3xl font-bold">
                  {course.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Level Badge */}
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-4 flex-grow flex flex-col">
            <div className="flex-grow">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-[var(--brand-600)] transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {course.description}
              </p>
              <p className="text-xs text-gray-500 font-medium mb-4">
                {getCreatorName()}
              </p>
            </div>

            {/* Course Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-600 border-t border-gray-100 pt-3">
              {course.lessonCount > 0 && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.lessonCount} lessons</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.duration)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.enrollmentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
