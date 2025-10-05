'use client';
import CourseReviewClient from '@/components/admin/CourseReviewClient';

export default function CourseReviewPage({ params }: { params: { id: string } }) {
  return <CourseReviewClient courseId={params.id} />;
}
