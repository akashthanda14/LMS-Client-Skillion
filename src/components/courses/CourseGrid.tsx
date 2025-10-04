'use client';

import { CourseCard } from './CourseCard';
import { Course } from '@/lib/api';
import { motion } from 'framer-motion';

interface CourseGridProps {
  courses: Course[];
  isLoading: boolean;
}

export function CourseGrid({ courses, isLoading }: CourseGridProps) {
  if (isLoading) {
    return <CourseGridSkeleton />;
  }

  // Safety check: ensure courses is an array
  if (!courses || !Array.isArray(courses)) {
    console.error('CourseGrid: courses is not an array:', courses);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-700 mb-2">
          Error loading courses
        </h3>
        <p className="text-gray-500">
          There was an issue loading the course data. Please refresh the page.
        </p>
      </motion.div>
    );
  }

  if (courses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-gray-400 text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No courses found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          index={index}
        />
      ))}
    </div>
  );
}

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
            {/* Thumbnail skeleton */}
            <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
            
            {/* Header skeleton */}
            <div className="p-6 flex-grow">
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>

            {/* Content skeleton */}
            <div className="px-6 pb-4">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>

            {/* Footer skeleton */}
            <div className="p-6 pt-0">
              <div className="h-9 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
