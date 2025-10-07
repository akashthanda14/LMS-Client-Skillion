'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreatorCourse } from '@/lib/api';
import { BookOpen, Users, FileText, Edit, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CreatorDashboardProps {
  courses: CreatorCourse[];
}

export function CreatorDashboard({ courses }: CreatorDashboardProps) {
  const getStatusColor = (status: CreatorCourse['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first course to start teaching and inspiring learners worldwide.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
      
      <div className="grid grid-cols-1 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-48 h-32 bg-gray-200 rounded-lg overflow-hidden">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          width={192}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                          <span className="text-white text-3xl font-bold">
                            {course.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {course.title}
                        </h3>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{course.lessonCount} Lessons</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{course.studentCount} Students</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Link href={`/creator/courses/${course.id}/edit`}>
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                      </Button>
                      
                      {course.status === 'PUBLISHED' && (
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="flex items-center gap-2"
                        >
                          <Link href={`/courses/${course.id}`}>
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
