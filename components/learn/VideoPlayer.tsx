'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import config from '@/lib/config'

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onVideoEnd?: () => void;
}

export function VideoPlayer({ videoUrl, title, onVideoEnd }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (onVideoEnd) {
        onVideoEnd();
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [onVideoEnd]);

  // Extract Cloudinary video ID from URL if needed
  const getVideoSrc = (url: string) => {
    // If it's already a full URL, use it directly
    if (url.startsWith('http')) {
      return url;
    }
    // Otherwise, construct Cloudinary URL using config
    const cloudName = config.cloudinaryCloudName || 'demo'
    return `https://res.cloudinary.com/${cloudName}/video/upload/${url}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg"
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        controlsList="nodownload"
        preload="metadata"
        aria-label={title}
      >
        <source src={getVideoSrc(videoUrl)} type="video/mp4" />
        <p className="text-white p-4">
          Your browser doesn't support HTML5 video. Here is a{' '}
          <a href={getVideoSrc(videoUrl)} className="underline">
            link to the video
          </a>{' '}
          instead.
        </p>
      </video>
    </motion.div>
  );
}
