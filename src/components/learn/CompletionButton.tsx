'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

interface CompletionButtonProps {
  lessonId: string;
  isCompleted: boolean;
  onComplete: () => Promise<void>;
  className?: string;
}

export function CompletionButton({
  lessonId,
  isCompleted,
  onComplete,
  className = '',
}: CompletionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleComplete = async () => {
    if (!confirm('Mark this lesson as complete?')) {
      return;
    }

    setIsLoading(true);

    try {
      await onComplete();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Button
        disabled
        variant="outline"
        className={`flex items-center gap-2 ${className}`}
      >
        <CheckCircle className="w-4 h-4 text-green-500" />
        Completed
      </Button>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md ${className}`}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Lesson Completed!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSuccess && (
        <Button
          onClick={handleComplete}
          disabled={isLoading}
          className={`flex items-center gap-2 ${className}`}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Marking Complete...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Mark as Complete
            </>
          )}
        </Button>
      )}
    </>
  );
}
