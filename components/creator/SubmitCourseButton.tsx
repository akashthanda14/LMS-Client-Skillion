'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { courseAPI } from '@/lib/api';

interface SubmitCourseButtonProps {
  courseId: string;
  courseTitle: string;
  lessonCount: number;
  onSubmitted: () => void;
}

export function SubmitCourseButton({
  courseId,
  courseTitle,
  lessonCount,
  onSubmitted,
}: SubmitCourseButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    // Validation
    if (lessonCount === 0) {
      setError('You must add at least one lesson before submitting');
      setShowConfirm(false);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await courseAPI.submitCourse(courseId);
      setShowConfirm(false);
      onSubmitted();
    } catch (err: any) {
      console.error('Failed to submit course:', err);
      const errorMessage =
        err.response?.data?.message ||
        'Failed to submit course. Please try again.';
      setError(errorMessage);
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Button
        onClick={() => setShowConfirm(true)}
        disabled={isSubmitting || lessonCount === 0}
        size="lg"
        className="bg-green-600 hover:bg-green-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Submit for Review
          </>
        )}
      </Button>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Course for Review?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to submit <strong>&quot;{courseTitle}&quot;</strong> for
              admin review. The course includes <strong>{lessonCount}</strong>{' '}
              {lessonCount === 1 ? 'lesson' : 'lessons'}.
              <br />
              <br />
              Once submitted:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>You cannot edit the course until it&apos;s reviewed</li>
                <li>An admin will review and approve or reject it</li>
                <li>You&apos;ll be notified of the review decision</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
