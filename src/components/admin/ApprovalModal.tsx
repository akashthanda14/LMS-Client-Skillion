'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: 'approve' | 'reject';
  onConfirm: (comments: string) => Promise<void>;
  itemType: 'application' | 'course';
}

export function ApprovalModal({
  isOpen,
  onClose,
  title,
  description,
  type,
  onConfirm,
  itemType,
}: ApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(comments);
      setComments('');
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setComments('');
      onClose();
    }
  };

  const isApprove = type === 'approve';
  const buttonColor = isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
  const iconColor = isApprove ? 'text-green-600' : 'text-red-600';
  const bgColor = isApprove ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className={`${bgColor} px-6 py-4 border-b flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {isApprove ? (
              <CheckCircle className={`w-6 h-6 ${iconColor}`} />
            ) : (
              <XCircle className={`w-6 h-6 ${iconColor}`} />
            )}
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-gray-700">{description}</p>

          {/* Comments Input */}
          <div className="space-y-2">
            <Label htmlFor="comments">
              {isApprove ? 'Approval Message (Optional)' : 'Rejection Reason (Optional)'}
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                isApprove
                  ? 'Welcome message or additional notes...'
                  : 'Explain why this is being rejected...'
              }
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">{comments.length}/500 characters</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={buttonColor}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {isApprove ? 'Approve' : 'Reject'}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
