# Frontend Implementation Guide: Admin Course Review & Preview

## Overview
Implement a comprehensive admin course review system that allows admins to preview courses (including all lessons and content) before approving or rejecting them. Admins can view courses in any status (DRAFT, PENDING, PUBLISHED, REJECTED) and take review actions.

---

## Course Status Flow

```
DRAFT → Creator submits → PENDING → Admin reviews
                              ↓
                         ┌────┴────┐
                         ↓         ↓
                    PUBLISHED   REJECTED
                         ↓         ↓
                    Live to      Creator can
                    learners     resubmit
```

**Status Definitions:**
- `DRAFT` - Creator is still building the course
- `PENDING` - Submitted for admin review (awaiting approval)
- `PUBLISHED` - Approved by admin, visible to learners
- `REJECTED` - Rejected by admin with feedback

---

## Backend API Endpoints

### 1. Get All Courses (with optional filter)
```
GET /api/admin/courses?status=PENDING
```

**Access:** Private - ADMIN only

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters:**
- `status` (optional): `DRAFT` | `PENDING` | `PUBLISHED` | `REJECTED`
- If no status provided, returns all courses

**Success Response (200 OK):**
```json
{
  "success": true,
  "courses": [
    {
      "id": "uuid",
      "title": "React Masterclass",
      "description": "Learn React from scratch...",
      "thumbnail": "https://cloudinary.com/.../image.jpg",
      "category": "PROGRAMMING",
      "level": "INTERMEDIATE",
      "status": "PENDING",
      "duration": 7200,
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-03T15:30:00.000Z",
      "submittedAt": "2025-10-03T15:30:00.000Z",
      "publishedAt": null,
      "reviewedAt": null,
      "rejectionReason": null,
      "creator": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "username": "johndoe"
      },
      "lessonCount": 12,
      "enrollmentCount": 0
    }
  ],
  "total": 15,
  "statusCounts": {
    "DRAFT": 5,
    "PENDING": 3,
    "PUBLISHED": 6,
    "REJECTED": 1
  }
}
```

---

### 2. Get Pending Courses (shortcut)
```
GET /api/admin/courses/pending
```

**Access:** Private - ADMIN only

**Success Response (200 OK):**
```json
{
  "success": true,
  "courses": [
    {
      "id": "uuid",
      "title": "Node.js Advanced",
      "description": "Deep dive into Node.js...",
      "thumbnail": "https://cloudinary.com/.../image.jpg",
      "category": "PROGRAMMING",
      "level": "ADVANCED",
      "status": "PENDING",
      "submittedAt": "2025-10-04T12:00:00.000Z",
      "creator": {
        "id": "uuid",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "lessonCount": 15,
      "enrollmentCount": 0,
      "reviewedAt": null
    }
  ],
  "count": 3
}
```

---

### 3. Get Course Details for Review (PREVIEW)
```
GET /api/admin/courses/:id
```

**Access:** Private - ADMIN only

**This is the main preview endpoint!**

**Success Response (200 OK):**
```json
{
  "success": true,
  "course": {
    "id": "uuid",
    "title": "React Masterclass",
    "description": "Comprehensive React course covering hooks, context, routing, and more...",
    "thumbnail": "https://cloudinary.com/.../thumbnail.jpg",
    "category": "PROGRAMMING",
    "level": "INTERMEDIATE",
    "duration": 7200,
    "status": "PENDING",
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-03T15:30:00.000Z",
    "submittedAt": "2025-10-03T15:30:00.000Z",
    "publishedAt": null,
    "rejectionReason": null,
    "creator": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "role": "CREATOR"
    },
    "lessons": [
      {
        "id": "uuid",
        "title": "Introduction to React",
        "description": "Learn React basics and setup",
        "videoUrl": "https://cloudinary.com/.../lesson1.mp4",
        "duration": 600,
        "order": 1,
        "transcript": "Welcome to React course..."
      },
      {
        "id": "uuid",
        "title": "React Hooks Deep Dive",
        "description": "Master useState, useEffect, and custom hooks",
        "videoUrl": "https://cloudinary.com/.../lesson2.mp4",
        "duration": 900,
        "order": 2,
        "transcript": null
      }
    ],
    "stats": {
      "lessonCount": 12,
      "enrollmentCount": 0,
      "certificateCount": 0
    }
  }
}
```

**Key: Admins get full access to:**
- All course metadata
- Full lesson list with video URLs
- Transcripts (if available)
- Creator information
- Course stats

---

### 4. Publish Course (Approve)
```
POST /api/admin/courses/:id/publish
```

**Access:** Private - ADMIN only

**Requirements:**
- Course must be in `PENDING` status
- Course must have at least 1 lesson

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course published successfully",
  "course": {
    "id": "uuid",
    "title": "React Masterclass",
    "status": "PUBLISHED",
    "publishedAt": "2025-10-05T14:30:00.000Z",
    "creator": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "lessonCount": 12
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Course must be in PENDING status to publish",
  "currentStatus": "DRAFT"
}
```

---

### 5. Reject Course (with feedback)
```
POST /api/admin/courses/:id/reject
```

**Access:** Private - ADMIN only

**Request Body:**
```json
{
  "feedback": "The course needs more detailed explanations in lessons 3-5. Please add code examples and update the video quality."
}
```

**Requirements:**
- Course must be in `PENDING` status
- Feedback must be at least 10 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Course rejected with feedback",
  "course": {
    "id": "uuid",
    "title": "React Masterclass",
    "status": "REJECTED",
    "rejectionReason": "The course needs more detailed explanations in lessons 3-5...",
    "creator": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Rejection feedback is required and must be at least 10 characters"
}
```

---

## Frontend Implementation

### 1. API Service Functions

Create `src/services/adminCourseService.ts`:

```typescript
import apiClient from './api';

export interface CourseForReview {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  duration: number;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  publishedAt: string | null;
  rejectionReason: string | null;
  creator: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
  lessons: Lesson[];
  stats: {
    lessonCount: number;
    enrollmentCount: number;
    certificateCount: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  transcript: string | null;
}

/**
 * Get all courses with optional status filter
 */
export const getCoursesForReview = async (status?: string) => {
  const params = status ? { status } : {};
  const response = await apiClient.get('/api/admin/courses', { params });
  return response.data;
};

/**
 * Get pending courses only
 */
export const getPendingCourses = async () => {
  const response = await apiClient.get('/api/admin/courses/pending');
  return response.data;
};

/**
 * Get detailed course for preview/review
 */
export const getCourseForReview = async (courseId: string) => {
  const response = await apiClient.get(`/api/admin/courses/${courseId}`);
  return response.data;
};

/**
 * Approve/publish a course
 */
export const publishCourse = async (courseId: string) => {
  const response = await apiClient.post(`/api/admin/courses/${courseId}/publish`);
  return response.data;
};

/**
 * Reject a course with feedback
 */
export const rejectCourse = async (courseId: string, feedback: string) => {
  const response = await apiClient.post(`/api/admin/courses/${courseId}/reject`, {
    feedback,
  });
  return response.data;
};
```

---

### 2. Course Review List Page

Create `app/(admin)/admin/courses/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function AdminCoursesPage() {
  const [activeTab, setActiveTab] = useState('PENDING');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-courses', activeTab],
    queryFn: () => getCoursesForReview(activeTab === 'ALL' ? undefined : activeTab),
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: { variant: 'secondary', icon: FileText, label: 'Draft' },
      PENDING: { variant: 'warning', icon: Clock, label: 'Pending Review' },
      PUBLISHED: { variant: 'success', icon: CheckCircle, label: 'Published' },
      REJECTED: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
    };

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
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
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
        {data?.statusCounts && (
          <Card className="w-fit">
            <CardContent className="pt-6">
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {data.statusCounts.PENDING}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {data.statusCounts.PUBLISHED}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="PENDING">
            Pending
            {data?.statusCounts?.PENDING > 0 && (
              <Badge variant="secondary" className="ml-2">
                {data.statusCounts.PENDING}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          <TabsTrigger value="DRAFT">Drafts</TabsTrigger>
          <TabsTrigger value="ALL">All Courses</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {data?.courses?.length === 0 ? (
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
              {data?.courses?.map((course) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### 3. Course Preview & Review Page

Create `app/(admin)/admin/courses/[id]/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getCourseForReview,
  publishCourse,
  rejectCourse,
} from '@/services/adminCourseService';
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

export default function CourseReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-course-review', params.id],
    queryFn: () => getCourseForReview(params.id),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishCourse(params.id),
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
    mutationFn: (feedback: string) => rejectCourse(params.id, feedback),
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

  if (error || !data?.course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load course</AlertDescription>
        </Alert>
      </div>
    );
  }

  const course = data.course;
  const canReview = course.status === 'PENDING';

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
              <Badge variant={course.status === 'PENDING' ? 'warning' : 'default'}>
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

          {canReview && (
            <div className="flex gap-2">
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
            </div>
          )}
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
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLesson(lesson.id)}
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
              </ScrollArea>
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
              <Separator />
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
              <Separator />
              <div>
                <p className="text-muted-foreground">Level</p>
                <p className="font-medium">{course.level}</p>
              </div>
              <Separator />
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
                  <Separator />
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

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course</DialogTitle>
            <DialogDescription>
              Provide detailed feedback to help the creator improve their course.
              Minimum 10 characters required.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Explain what needs to be improved..."
            value={rejectionFeedback}
            onChange={(e) => setRejectionFeedback(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## Key Features

### ✅ What Admins Can Preview:
1. **Full Course Details:**
   - Title, description, thumbnail
   - Category, level, duration
   - Creator information

2. **All Lessons:**
   - Lesson titles and descriptions
   - Video URLs (can watch videos)
   - Duration of each lesson
   - Transcripts (if generated)

3. **Course Stats:**
   - Total lesson count
   - Enrollment count
   - Certificate count

4. **Status History:**
   - When submitted
   - When published (if applicable)
   - Rejection reason (if rejected)

### ✅ Admin Actions:
- **Publish** - Approve course (PENDING → PUBLISHED)
- **Reject** - Send back with feedback (PENDING → REJECTED)
- **Filter** - View by status (PENDING, PUBLISHED, REJECTED, DRAFT)

---

## UX Guidelines

### 1. Status Colors
```tsx
const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};
```

### 2. Review Workflow
```
Admin Dashboard
    ↓
Pending Courses (3 waiting)
    ↓
Click "Preview & Review"
    ↓
Preview Full Course + All Lessons
    ↓
Decision:
  ├─ Publish → Course goes live
  └─ Reject → Creator receives feedback
```

### 3. Mobile Responsive
- List view on mobile (cards stack)
- Preview page: tabs for sections (Details, Lessons, Creator)
- Review actions in fixed bottom bar on mobile

---

## Notifications (Optional Enhancement)

When admin approves/rejects, notify creator:

```typescript
// Backend could send email/notification
// Frontend can show toast when action complete

onSuccess: () => {
  toast.success('Course published! Creator has been notified.');
}
```

---

## Testing Checklist

- [ ] Admin can view pending courses list
- [ ] Admin can filter courses by status
- [ ] Admin can preview full course details
- [ ] Admin can view all lessons in course
- [ ] Admin can watch lesson videos
- [ ] Admin can view transcripts if available
- [ ] Publish button only shows for PENDING courses
- [ ] Rejection requires minimum 10 char feedback
- [ ] Success/error messages display correctly
- [ ] Status badges show correct colors
- [ ] Mobile responsive layout works

---

## Summary

**YES - Admins CAN fully preview courses before approval!**

The preview includes:
- ✅ All course metadata
- ✅ Complete lesson list with videos
- ✅ Transcripts (if generated)
- ✅ Creator information
- ✅ Course stats

Admins can:
- ✅ Watch all videos
- ✅ Review all content
- ✅ Approve (publish)
- ✅ Reject with feedback

**Everything is already built in the backend!** Just implement the frontend UI following this guide. 🚀
