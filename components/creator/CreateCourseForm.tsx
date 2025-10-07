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

interface CreateCourseFormProps { onCreated?: (courseId: string) => void }

export function CreateCourseForm({ onCreated }: CreateCourseFormProps) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CourseFormData>({ resolver: zodResolver(courseSchema) });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { setThumbnailFile(null); setThumbnailPreview(null); return; }
    const valid = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
    if (!valid.includes(file.type)) { toast.error('Invalid file type'); e.target.value=''; return; }
    if (file.size > 5*1024*1024) { toast.error('File too large (max 5MB)'); e.target.value=''; return; }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setThumbnailFile(null); setThumbnailPreview(null);
    const input = document.getElementById('thumbnail') as HTMLInputElement | null;
    if (input) input.value='';
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      console.log('[CreateCourseForm] submit start', data);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.category) formData.append('category', data.category);
      if (data.level) formData.append('level', data.level);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      let base: string;
      try {
        base = getApiBase();
      } catch (e:any) {
        toast.error(e.message || 'API base not configured');
        setIsSubmitting(false);
        return;
      }
      const token = localStorage.getItem('token')||'';
      if (!token) {
        console.warn('[CreateCourseForm] No auth token found in localStorage. Request will likely 401.');
      }
      console.log('[CreateCourseForm] POST', `${base}/api/courses`);
      const res = await fetch(`${base}/api/courses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({message:'Failed'}));
        throw new Error(err.message || 'Failed to create course');
      }
      const json = await res.json();
      // Support both legacy { data: {...} } and new { course: {...} }
      const courseObj = json.course || json.data || json;
      const courseId = courseObj?.id;
      if (!courseId) {
        console.warn('[CreateCourseForm] Unexpected response shape', json);
        throw new Error('Missing course id in response');
      }
      toast.success(json.message || 'Course created');
      console.log('[CreateCourseForm] success', courseObj);
      onCreated?.(courseId);
      reset(); removeImage();
    } catch (e:any) { toast.error(e.message || 'Error creating course'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Course Title *</Label>
        <Input id="title" placeholder="Intro to React" {...register('title')} className={errors.title? 'border-red-500':''} />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" rows={4} placeholder="Describe the course..." {...register('description')} className={errors.description? 'border-red-500':''} />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" placeholder="Programming" {...register('category')} />
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
        <Label htmlFor="thumbnail">Course Thumbnail</Label>
        {!thumbnailPreview && (
          <label htmlFor="thumbnail" className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 mt-2">
            <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag & drop</p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP, GIF (max 5MB)</p>
            <input id="thumbnail" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
        {thumbnailPreview && (
          <div className="mt-3">
            <div className="relative w-full h-52 rounded-lg overflow-hidden border">
              <Image src={thumbnailPreview} alt="Preview" fill className="object-cover" />
            </div>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="destructive" size="sm" onClick={removeImage}>Remove</Button>
              <label htmlFor="thumbnail" className="px-3 py-2 text-sm border rounded-md cursor-pointer bg-white hover:bg-gray-50">Change</label>
              <input id="thumbnail" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Optional. Recommended 1280x720 (16:9).</p>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting? 'Creating...' : 'Create Course'}</Button>
      {process.env.NEXT_PUBLIC_API_URL ? null : (
        <p className="text-xs text-amber-600">Warning: NEXT_PUBLIC_API_URL not set – using current origin. Set it in .env.local for production.</p>
      )}
    </form>
  );
}
