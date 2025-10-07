'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { courseAPI, CourseDetail } from '@/lib/api';

const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseEditorProps {
  course: CourseDetail;
  onSaved: () => void;
}

export function CourseEditor({ course, onSaved }: CourseEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course.title || '',
      description: course.description || '',
      thumbnailUrl: course.thumbnailUrl || course.thumbnail || '',
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await courseAPI.updateCourse(course.id, {
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl || undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onSaved();
    } catch (error: any) {
      console.error('Failed to update course:', error);
      alert(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-lg p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">Course Details</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Introduction to Web Development"
                    maxLength={100}
                  />
                </FormControl>
                <FormDescription>
                  {field.value.length}/100 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe what students will learn in this course..."
                    rows={6}
                    maxLength={1000}
                  />
                </FormControl>
                <FormDescription>
                  {field.value.length}/1000 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail URL */}
          <FormField
            control={form.control}
            name="thumbnailUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                </FormControl>
                <FormDescription>
                  Enter a URL to an image for your course thumbnail
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail Preview */}
          {form.watch('thumbnailUrl') && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Preview</p>
              <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={form.watch('thumbnailUrl')}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>

            {saveSuccess && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-green-600 font-medium"
              >
                ✓ Changes saved successfully
              </motion.p>
            )}
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
