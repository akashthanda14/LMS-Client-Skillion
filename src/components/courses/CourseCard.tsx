'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course } from '@/lib/api';
import { Clock, Users } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        {/* Course Thumbnail */}
        <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
          {(course.thumbnail || course.thumbnailUrl) ? (
            <Image
              src={course.thumbnail || course.thumbnailUrl || ''}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-white text-2xl font-bold">
                {course.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Level Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
              {course.level}
            </span>
          </div>
        </div>

        <CardHeader className="flex-grow">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2 text-gray-900">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {course.description}
            </p>
            <p className="text-xs text-gray-500">
              by {getCreatorName()}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{course.enrollmentCount} enrolled</span>
            </div>

            {course.lessonCount > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-xs">{course.lessonCount} lessons</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button asChild className="w-full" size="sm">
            <Link href={`/courses/${course.id}`}>
              View Course
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
