"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Certificate } from '@/lib/api';
import { CertificateDownload } from './CertificateDownload';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <div className="border rounded-lg p-4 flex flex-col sm:flex-row items-start gap-4">
      <div className="w-full sm:w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
        {/* Placeholder image area */}
        {certificate.enrollment?.course?.thumbnail ? (
          <Image
            src={certificate.enrollment.course.thumbnail}
            alt={certificate.enrollment.course.title}
            width={160}
            height={90}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-sm text-gray-500">No image</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold truncate">{certificate.enrollment?.course?.title || 'Certificate'}</h3>
        <p className="text-sm text-gray-600">Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</p>
        <p className="text-sm text-gray-500 mt-2 break-all">Serial: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{certificate.serialHash}</code></p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {certificate.enrollment?.id ? (
            <CertificateDownload enrollmentId={certificate.enrollment.id} courseTitle={certificate.enrollment.course?.title || 'course'} />
          ) : certificate.imageUrl || (certificate as any).certificateUrl ? (
            // If enrollment id is missing but an image/certificate URL exists, allow viewing it
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = (certificate as any).certificateUrl || certificate.imageUrl;
                if (url) window.open(url, '_blank');
              }}
            >
              View Certificate
            </Button>
          ) : (
            <Button disabled variant="outline" size="sm">No certificate available</Button>
          )}

          <Button asChild variant="ghost" size="sm">
            <a href={`/api/certificates/verify/${certificate.serialHash}`} target="_blank" rel="noreferrer">Verify</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CertificateCard;
