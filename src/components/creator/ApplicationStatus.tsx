'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { creatorAPI, CreatorStatusResponse } from '@/lib/api';
import { CheckCircle, Clock, XCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function ApplicationStatus() {
  const [statusData, setStatusData] = useState<CreatorStatusResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const response = await creatorAPI.getStatus();
        setStatusData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load application status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading application status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Status</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/creator/apply">Submit Application</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!statusData) {
    return null;
  }

  // If user can apply (no application exists)
  if (statusData.canApply && !statusData.hasApplication) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Application Found</h3>
            <p className="text-gray-600 mb-4">You haven't submitted a creator application yet.</p>
            <Button asChild>
              <Link href="/creator/apply">Apply Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const application = statusData.application;
  if (!application) {
    return null;
  }

  const getStatusIcon = () => {
    switch (application.status) {
      case 'APPROVED':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'PENDING':
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (application.status) {
      case 'APPROVED':
        return 'bg-green-50 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 border-red-200';
      case 'PENDING':
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusTitle = () => {
    switch (application.status) {
      case 'APPROVED':
        return 'Application Approved!';
      case 'REJECTED':
        return 'Application Not Approved';
      case 'PENDING':
      default:
        return 'Application Under Review';
    }
  };

  const getStatusMessage = () => {
    switch (application.status) {
      case 'APPROVED':
        return 'Congratulations! Your creator application has been approved. You can now start creating courses.';
      case 'REJECTED':
        return 'Unfortunately, your application was not approved at this time. Please review the feedback below.';
      case 'PENDING':
      default:
        return 'Your application is currently being reviewed by our team. We\'ll notify you once a decision has been made.';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card className={getStatusColor()}>
        <CardHeader>
          <CardTitle className="text-center">Creator Application Status</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {getStatusIcon()}
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStatusTitle()}</h2>
            <p className="text-gray-600">{getStatusMessage()}</p>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
            <span className="text-sm font-medium">Status:</span>
            <span
              className={`text-sm font-semibold ${
                application.status === 'APPROVED'
                  ? 'text-green-600'
                  : application.status === 'REJECTED'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              {application.status}
            </span>
          </div>

          {/* Application Details */}
          <div className="bg-white p-4 rounded-lg text-left text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Application ID:</span>
              <span className="font-mono text-gray-900">{application.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Submitted:</span>
              <span className="text-gray-900">{new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
            {application.reviewedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Reviewed:</span>
                <span className="text-gray-900">{new Date(application.reviewedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Rejection Reason */}
          {application.rejectionReason && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-4 rounded-lg text-left border-l-4 border-red-500"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Rejection Reason:</h3>
              <p className="text-gray-700">{application.rejectionReason}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            {application.status === 'APPROVED' && (
              <Button asChild size="lg">
                <Link href="/creator/dashboard">Go to Dashboard</Link>
              </Button>
            )}
            {application.status === 'REJECTED' && (
              <Button asChild variant="outline">
                <Link href="/support">Contact Support</Link>
              </Button>
            )}
            {application.status === 'PENDING' && (
              <Button asChild variant="outline">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
