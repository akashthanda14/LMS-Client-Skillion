'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { creatorAPI } from '@/lib/api';

interface ThumbnailUploaderProps {
  courseId: string;
  currentThumbnail?: string;
  onUploadComplete: (url: string) => void;
}

export function ThumbnailUploader({ courseId, currentThumbnail, onUploadComplete }: ThumbnailUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentThumbnail || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    try {
      setIsUploading(true);
      setError(null);

      // Get signed credentials
      const credentials = await creatorAPI.getThumbnailUploadCredentials(courseId);

      // Upload file
      const url = await creatorAPI.uploadThumbnail(credentials.data, file);

      // Notify parent
      onUploadComplete(url);
      setPreview(url);
    } catch (err: any) {
      console.error('Thumbnail upload failed:', err);
      setError(err.message || 'Failed to upload thumbnail');
      setPreview(currentThumbnail || null);
    } finally {
      setIsUploading(false);
    }
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

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {preview ? (
          <div className="relative aspect-video">
            <img
              src={preview}
              alt="Course thumbnail"
              className="w-full h-full object-cover rounded-lg"
            />
            {!isUploading && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video flex flex-col items-center justify-center cursor-pointer p-8"
          >
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center"
            >
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <Image className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Drop thumbnail image here
              </p>
              <p className="text-xs text-gray-500">
                or click to browse (max 5MB)
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Recommended: 1200 x 675px (16:9 aspect ratio)
              </p>
            </motion.div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
