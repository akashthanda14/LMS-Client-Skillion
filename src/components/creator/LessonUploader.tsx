'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadProgress } from './UploadProgress';
import { courseAPI } from '@/lib/api';

interface LessonUploaderProps {
  courseId: string;
  lessonOrder: number;
  onUploadComplete: () => void;
}

interface UploadState {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
}

export function LessonUploader({ courseId, lessonOrder, onUploadComplete }: LessonUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 500MB');
      return;
    }

    setSelectedFile(file);
    // Auto-populate title from filename
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setLessonTitle(fileNameWithoutExt);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const uploadToCloudinary = async (
    file: File,
    credentials: any
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', credentials.apiKey);
      formData.append('timestamp', credentials.timestamp.toString());
      formData.append('signature', credentials.signature);
      formData.append('public_id', credentials.publicId);
      formData.append('folder', credentials.folder);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadState((prev) => prev ? { ...prev, progress: percentComplete } : null);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          console.error('Cloudinary upload failed:', xhr.status, xhr.responseText);
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', credentials.uploadUrl);
      xhr.send(formData);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !lessonTitle.trim()) {
      alert('Please select a video and enter a title');
      return;
    }

    try {
      // Set initial upload state
      setUploadState({
        fileName: selectedFile.name,
        progress: 0,
        status: 'uploading',
      });

      // 1. Get upload credentials
      const credResponse = await courseAPI.getUploadCredentials(courseId);
      const credentials = credResponse.data;

      // 2. Upload to Cloudinary
      const videoUrl = await uploadToCloudinary(selectedFile, credentials);

      // 3. Set processing state
      setUploadState((prev) => prev ? { ...prev, status: 'processing', progress: 100 } : null);

      // 4. Create lesson in our system
      await courseAPI.createLesson(courseId, {
        title: lessonTitle.trim(),
        videoUrl,
        order: lessonOrder,
      });

      // 5. Set success state
      setUploadState((prev) => prev ? { ...prev, status: 'success' } : null);

      // 6. Reset form and notify parent
      setTimeout(() => {
        setSelectedFile(null);
        setLessonTitle('');
        setUploadState(null);
        onUploadComplete();
      }, 2000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadState((prev) =>
        prev
          ? {
              ...prev,
              status: 'error',
              error: error.response?.data?.message || 'Upload failed. Please try again.',
            }
          : null
      );
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setLessonTitle('');
    setUploadState(null);
  };

  return (
    <div className="space-y-4">
      {/* File Drop Zone */}
      {!selectedFile && !uploadState && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Drop video file here or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                MP4, MOV, AVI up to 500MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !uploadState && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-50 border rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
              <Video className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lesson Title Input */}
          <div className="mt-4 space-y-2">
            <Label htmlFor="lesson-title">Lesson Title</Label>
            <Input
              id="lesson-title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Enter lesson title"
              maxLength={200}
            />
            <p className="text-xs text-gray-500">
              {lessonTitle.length}/200 characters
            </p>
          </div>

          {/* Upload Button */}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!lessonTitle.trim()}
              className="flex-1"
            >
              Upload Lesson
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadState && (
          <UploadProgress
            fileName={uploadState.fileName}
            progress={uploadState.progress}
            status={uploadState.status}
            error={uploadState.error}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
