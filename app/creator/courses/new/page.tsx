"use client";
import { useRouter } from 'next/navigation';
import { CreateCourseForm } from '@/components/creator/CreateCourseForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function NewCoursePage() {
  const router = useRouter();
  const [createdId, setCreatedId] = useState<string | null>(null);

  const handleCreated = (id: string) => {
    setCreatedId(id);
    // Redirect to edit page after short delay for any UI toast to show
    setTimeout(() => router.replace(`/creator/courses/${id}/edit`), 400);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Create New Course</h1>
        </div>
      </div>
      {!createdId && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <CreateCourseForm onCreated={handleCreated} />
        </div>
      )}
      {createdId && (
        <div className="p-4 rounded-md border border-green-300 bg-green-50 text-sm text-green-800">
          Course created. Redirecting to editor...
        </div>
      )}
    </div>
  );
}
