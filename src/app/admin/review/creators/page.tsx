'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, UserCheck } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { CreatorApplicationCard } from '@/components/admin/CreatorApplicationCard';
import { ApprovalModal } from '@/components/admin/ApprovalModal';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePendingApplications } from '@/hooks/usePendingApplications';
import { PendingApplication } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ReviewCreatorsPage() {
  const router = useRouter();
  const { applications, isLoading, error, approveApplication, rejectApplication } = usePendingApplications();
  const [selectedApp, setSelectedApp] = useState<PendingApplication | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = (id: string) => {
    const app = applications.find((a) => a.id === id);
    if (app) {
      setSelectedApp(app);
      setModalType('approve');
      setShowModal(true);
    }
  };

  const handleReject = (id: string) => {
    const app = applications.find((a) => a.id === id);
    if (app) {
      setSelectedApp(app);
      setModalType('reject');
      setShowModal(true);
    }
  };

  const handleConfirm = async (comments: string) => {
    if (!selectedApp) return;

    try {
      setActionLoading(true);
      if (modalType === 'approve') {
        await approveApplication(selectedApp.id);
        setSuccessMessage(`✓ Approved ${selectedApp.name}'s application`);
      } else {
        await rejectApplication(selectedApp.id, comments);
        setSuccessMessage(`✓ Rejected ${selectedApp.name}'s application`);
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Action failed:', err);
      alert(err.response?.data?.message || 'Action failed. Please try again.');
      throw err; // Re-throw to keep modal open
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600">Loading applications...</p>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creator Applications</h1>
              <p className="text-gray-600 mt-1">
                Review and approve pending creator applications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              {applications.length} Pending
            </span>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Empty State */}
        {!error && applications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed"
          >
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600">
              No pending creator applications at the moment.
            </p>
          </motion.div>
        )}

        {/* Applications Grid */}
        {!error && applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application) => (
              <CreatorApplicationCard
                key={application.id}
                application={application}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}

        {/* Approval Modal */}
        <AnimatePresence>
          {showModal && selectedApp && (
            <ApprovalModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title={
                modalType === 'approve'
                  ? 'Approve Application'
                  : 'Reject Application'
              }
              description={
                modalType === 'approve'
                  ? `You are about to approve ${selectedApp.name}'s application. They will be granted CREATOR role and can start creating courses.`
                  : `You are about to reject ${selectedApp.name}'s application. Please provide a reason to help them improve.`
              }
              type={modalType}
              onConfirm={handleConfirm}
              itemType="application"
            />
          )}
        </AnimatePresence>
      </div>
    </AuthenticatedLayout>
  );
}
