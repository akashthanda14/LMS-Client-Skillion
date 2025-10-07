'use client';

import { motion } from 'framer-motion';
import { User, Mail, Link as LinkIcon, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PendingApplication } from '@/lib/api';

interface CreatorApplicationCardProps {
  application: PendingApplication;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

export function CreatorApplicationCard({
  application,
  onApprove,
  onReject,
  isProcessing = false,
}: CreatorApplicationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{application.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{application.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Bio</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {application.bio}
            </p>
          </div>

          {/* Portfolio & Experience */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <div className="flex items-start gap-2">
              <LinkIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700">Portfolio</p>
                <a
                  href={application.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate block"
                >
                  {application.portfolioUrl}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-700">Experience</p>
                <p className="text-sm text-gray-600">
                  {application.experienceYears} {application.experienceYears === 1 ? 'year' : 'years'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => onApprove(application.id)}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button
            onClick={() => onReject(application.id)}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>

        {/* Timestamp */}
        {application.createdAt && (
          <p className="text-xs text-gray-400 mt-3 text-center">
            Applied {new Date(application.createdAt).toLocaleDateString()}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
