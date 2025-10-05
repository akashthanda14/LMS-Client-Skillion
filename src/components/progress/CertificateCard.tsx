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
    <div className="border rounded-lg p-4 flex items-start gap-4">
      <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
        {/* Placeholder image area */}
        {certificate.enrollment?.course?.thumbnail ? (
          <Image
            src={certificate.enrollment.course.thumbnail}
            alt={certificate.enrollment.course.title}
            width={160}
            height={90}
            className="object-cover"
          />
        ) : (
          <div className="text-sm text-gray-500">No image</div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold">{certificate.enrollment?.course?.title || 'Certificate'}</h3>
        <p className="text-sm text-gray-600">Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</p>
        <p className="text-sm text-gray-500 mt-2">Serial: <code className="text-xs">{certificate.serialHash}</code></p>

        <div className="mt-4 flex items-center gap-3">
          {certificate.enrollment?.id ? (
            <CertificateDownload enrollmentId={certificate.enrollment.id} courseTitle={certificate.enrollment.course?.title || 'course'} />
          ) : (
            <Button disabled variant="outline">No enrollment</Button>
          )}

          <Button asChild variant="ghost">
            <a href={`/api/certificates/verify/${certificate.serialHash}`} target="_blank" rel="noreferrer">Verify</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CertificateCard;
