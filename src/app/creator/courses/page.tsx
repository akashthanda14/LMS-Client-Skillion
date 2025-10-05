"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { CreateCourseForm } from '@/components/creator/CreateCourseForm';
import { LessonUploader } from '@/components/creator/LessonUploader';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { courseAPI } from '@/lib/api';
import { Loader2, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CreatedCourseMeta { id: string }

export default function CreatorCoursesPage() {
  const [createdCourse, setCreatedCourse] = useState<CreatedCourseMeta | null>(null);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const { data: rawCourses, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['creator-courses'],
    queryFn: () => courseAPI.getCourses(),
  });

  // After a course is created, refetch list
  useEffect(() => {
    if (createdCourse) {
      refetch();
    }
  }, [createdCourse, refetch]);

  // Filter courses to only those belonging to current creator
  const filteredCourses = useMemo(() => {
    if (!rawCourses || !user) return [];
    return rawCourses.filter((c: any) => c.creator?.id === user.id);
  }, [rawCourses, user]);

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {createdCourse && !showForm && (
        <div className="relative rounded-md border border-green-300 bg-green-50 p-4 flex flex-col gap-2">
          <button
            aria-label="Dismiss"
            onClick={() => setCreatedCourse(null)}
            className="absolute top-2 right-2 text-green-700 hover:text-green-900"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm text-green-800 font-medium">Course created successfully.</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href={`/creator/courses/${createdCourse.id}/edit`} className="text-green-700 underline hover:text-green-900">
              Go to editor
            </Link>
            <button
              onClick={() => { setShowForm(true); setCreatedCourse(null); }}
              className="text-green-700 underline hover:text-green-900"
            >
              Create another
            </button>
            <a href="#first-lesson" className="text-green-700 underline hover:text-green-900">
              Scroll to lesson uploader
            </a>
          </div>
        </div>
      )}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-gray-600 text-sm mt-1">Manage, draft and publish your content.</p>
        </div>
        <div className="flex items-center gap-3">
          {createdCourse && (
            <Link href={`/creator/courses/${createdCourse.id}/edit`} className="text-sm text-blue-600 hover:underline">
              Edit latest draft →
            </Link>
          )}
          <Button size="sm" variant={showForm? 'outline':'default'} onClick={() => setShowForm(s=>!s)}>
            {showForm? 'Cancel':'New Course'}
          </Button>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 rounded-lg border bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Your Courses</h2>
              {isFetching && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            {isLoading && (
              <div className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading courses...</div>
            )}
            {isError && (
              <div className="text-sm text-red-600">Failed to load courses. <button onClick={()=>refetch()} className="underline">Retry</button></div>
            )}
            {!isLoading && !isError && filteredCourses && filteredCourses.length === 0 && user && (
              <div className="text-sm text-gray-500">You have no courses yet. Click New Course to start.</div>
            )}
            {!isLoading && !isError && filteredCourses && filteredCourses.length > 0 && (
              <ul className="divide-y border rounded-md mt-2">
                {filteredCourses.map(c => (
                  <li key={c.id} className="p-3 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{c.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{c.level || '—'}</span>
                        <span className="inline-block w-1 h-1 rounded-full bg-gray-300" />
                        <span className="capitalize">{c.status?.toLowerCase?.() || 'draft'}</span>
                        {typeof c.lessonCount === 'number' && (
                          <>
                            <span className="inline-block w-1 h-1 rounded-full bg-gray-300" />
                            <span>{c.lessonCount} lesson{c.lessonCount===1?'':'s'}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <Link href={`/creator/courses/${c.id}/edit`} className="text-xs text-blue-600 hover:underline whitespace-nowrap">Edit</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
      {createdCourse && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-green-300 bg-green-50 text-sm">
                Course created successfully. You can now <Link href={`/creator/courses/${createdCourse.id}/edit`} className="font-medium underline">add lessons & publish</Link> or upload the first lesson below.
              </div>
        <div id="first-lesson" className="p-6 rounded-lg border bg-white shadow-sm">
                <h3 className="text-md font-semibold mb-3">Add First Lesson</h3>
                <LessonUploader courseId={createdCourse.id} lessonOrder={1} onUploadComplete={()=>{ /* noop here - user can navigate to edit page for full management */ }} />
                <p className="text-xs text-gray-500 mt-3">For advanced lesson management (reorder, metadata) visit the full editor.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-lg shadow-lg border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Course</h2>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Close</Button>
            </div>
            <CreateCourseForm onCreated={(id)=> { setCreatedCourse({ id }); setShowForm(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}
