'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

interface ProgressTrackerProps {
  progress: number;
  completedLessons: number;
  totalLessons: number;
  className?: string;
}

export function ProgressTracker({
  progress,
  completedLessons,
  totalLessons,
  className = '',
}: ProgressTrackerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-lg shadow-md p-4 ${className}`}
    >
      <div className="space-y-3">
        {/* Progress Text */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Course Progress</span>
          <span className="text-gray-600">
            {completedLessons} of {totalLessons} lessons
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          />
        </div>

        {/* Percentage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {progress === 100 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-blue-500" />
            )}
            <span className="text-sm font-semibold text-gray-900">{progress}% Complete</span>
          </div>
          
          {progress === 100 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full"
            >
              🎉 Completed!
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
