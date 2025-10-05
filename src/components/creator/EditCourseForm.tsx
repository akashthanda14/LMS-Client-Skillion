"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { toast } from 'sonner';
import { getApiBase } from '@/lib/apiBase';

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface EditCourseFormProps {
  courseId: string;
  initial: {
    title: string; description: string; category?: string; level?: string; thumbnail?: string;
  };
  onUpdated?: () => void;
}

export function EditCourseForm({ courseId, initial, onUpdated }: EditCourseFormProps) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initial.thumbnail || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { title: initial.title, description: initial.description, category: initial.category, level: initial.level as any }
  });

  const validateFile = (file: File) => {
    const valid = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
    if (!valid.includes(file.type)) { toast.error('Invalid file type'); return false; }
    if (file.size > 5*1024*1024) { toast.error('File too large (max 5MB)'); return false; }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) { e.target.value=''; return; }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const cancelNewImage = () => {
    setThumbnailFile(null);
    setThumbnailPreview(initial.thumbnail || null);
    const input = document.getElementById('edit-thumbnail') as HTMLInputElement | null;
    if (input) input.value='';
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (data.title !== initial.title) formData.append('title', data.title);
      if (data.description !== initial.description) formData.append('description', data.description);
      if (data.category && data.category !== initial.category) formData.append('category', data.category);
      if (data.level && data.level !== initial.level) formData.append('level', data.level);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      let base: string;
      try {
        base = getApiBase();
      } catch (e:any) {
        toast.error(e.message || 'API base not configured');
        setIsSubmitting(false);
        return;
      }
  const res = await fetch(`${base}/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')||''}` },
        body: formData,
      });
  if (!res.ok) { const err = await res.json().catch(()=>({message:'Failed'})); throw new Error(err.message || 'Failed to update'); }
  const json = await res.json();
  const courseObj = json.course || json.data || json;
  toast.success(json.message || 'Course updated');
  if (courseObj.thumbnail) setThumbnailPreview(courseObj.thumbnail);
      onUpdated?.();
    } catch(e:any) { toast.error(e.message || 'Update failed'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Course Title *</Label>
        <Input id="title" {...register('title')} className={errors.title? 'border-red-500':''} />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" rows={4} {...register('description')} className={errors.description? 'border-red-500':''} />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" {...register('category')} />
      </div>
      <div>
        <Label htmlFor="level">Difficulty Level</Label>
        <select id="level" {...register('level')} className="w-full px-3 py-2 border rounded-md">
          <option value="">Select level</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>
      <div>
        <Label htmlFor="edit-thumbnail">Course Thumbnail</Label>
        {!thumbnailPreview && (
          <label htmlFor="edit-thumbnail" className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 mt-2">
            <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag & drop</p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP, GIF (max 5MB)</p>
            <input id="edit-thumbnail" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
        {thumbnailPreview && (
          <div className="mt-3">
            <div className="relative w-full h-52 rounded-lg overflow-hidden border">
              {thumbnailPreview && <Image src={thumbnailPreview} alt="Preview" fill className="object-cover" />}
            </div>
            <div className="flex gap-2 mt-2">
              {thumbnailFile && <Button type="button" variant="outline" size="sm" onClick={cancelNewImage}>Cancel New</Button>}
              <label htmlFor="edit-thumbnail" className="px-3 py-2 text-sm border rounded-md cursor-pointer bg-white hover:bg-gray-50">{thumbnailFile? 'Change Again':'Change Thumbnail'}</label>
              <input id="edit-thumbnail" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Uploading a new file replaces the existing thumbnail.</p>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting? 'Updating...' : 'Update Course'}</Button>
    </form>
  );
}
