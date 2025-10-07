"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Eye,
  AlertCircle 
} from 'lucide-react';
import { getCoursesForReview } from '@/services/adminCourseService';
import Link from 'next/link';

export default function AdminCoursesClient() {
  const [activeTab, setActiveTab] = useState('PENDING');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-courses', activeTab],
    queryFn: () => getCoursesForReview(activeTab === 'ALL' ? undefined : activeTab),
  });

  // Narrow unknown shapes returned by react-query for TS build
  const statusCounts = data?.data ? (data.data as any).statusCounts : undefined;

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: { variant: 'secondary', icon: FileText, label: 'Draft' },
      PENDING: { variant: 'warning', icon: Clock, label: 'Pending Review' },
      PUBLISHED: { variant: 'success', icon: CheckCircle, label: 'Published' },
      REJECTED: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
    } as any;

    const config = variants[status] || variants.DRAFT;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <div className="h-12 w-64 bg-gray-200 rounded" />
        <div className="h-96 w-full bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Course Review</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage submitted courses
          </p>
        </div>
  {statusCounts && (
          <Card className="w-fit">
            <CardContent className="pt-6">
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
        {statusCounts?.PENDING ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-green-600">
        {statusCounts?.PUBLISHED ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-2 items-center">
            {['PENDING', 'PUBLISHED', 'REJECTED', 'DRAFT', 'ALL'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'PENDING' ? 'Pending' : tab === 'PUBLISHED' ? 'Published' : tab === 'REJECTED' ? 'Rejected' : tab === 'DRAFT' ? 'Drafts' : 'All Courses'}
                {tab === 'PENDING' && statusCounts && (statusCounts.PENDING ?? 0) > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts.PENDING}
                  </Badge>
                )}
          </Button>
        ))}
      </div>

      <div className="mt-6">
    {data?.data?.courses?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No {activeTab.toLowerCase()} courses found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data?.data?.courses?.map((course: any) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(course.status)}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{course.lessonCount} lessons</span>
                      <span>•</span>
                      <span>{Math.floor(course.duration / 60)} min</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Creator:</p>
                      <p className="text-muted-foreground">{course.creator.name}</p>
                    </div>
                    {course.submittedAt && (
                      <div className="text-xs text-muted-foreground">
                        Submitted {new Date(course.submittedAt).toLocaleDateString()}
                      </div>
                    )}
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button className="w-full" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview & Review
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
