"use client";

import React, { useEffect, useState } from 'react';
import { Certificate } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { progressAPI } from '@/lib/api';
import { CertificateDownload } from './CertificateDownload';

interface Props {
  enrollmentId?: string | null;
  progress?: number | null;
  courseTitle?: string;
  isPolling?: boolean;
  remoteCertificate?: Certificate | null;
  remoteError?: string | null;
}

export function CoursePageCertificateBanner({ enrollmentId, progress, courseTitle, isPolling = false, remoteCertificate = null, remoteError = null }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  const extractCertUrl = (c: Certificate | null | undefined): string | undefined => {
    if (!c) return undefined;
    const asObj = c as unknown as Record<string, unknown> | null;
    if (!asObj) return undefined;
    const certUrl = asObj['certificateUrl'];
    const imageUrl = asObj['imageUrl'];
    if (typeof certUrl === 'string' && certUrl.length) return certUrl;
    if (typeof imageUrl === 'string' && imageUrl.length) return imageUrl;
    return undefined;
  };

  const handleGenerate = async () => {
    if (!enrollmentId) return;
    setIsLoading(true);
    setError('');
    try {
      // Request backend to enqueue generation (idempotent) if supported
      try {
        await progressAPI.generateCertificate(String(enrollmentId));
      } catch (genErr) {
        // ignore if backend doesn't support generate endpoint; we'll still poll
      }

      // waitForCertificate will poll until certificate exists or timeout
      const resp = await progressAPI.waitForCertificate(String(enrollmentId));
      if (resp?.data?.certificate) setCertificate(resp.data.certificate as Certificate);
    } catch (err: unknown) {
      // derive message safely
      if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>;
        const response = e['response'] as Record<string, unknown> | undefined;
        const data = response && (response['data'] as Record<string, unknown> | undefined);
        const message = data && typeof data['message'] === 'string' ? (data['message'] as string) : undefined;

        if (message) {
          setError(message);
          return;
        }
      }

      setError('Failed to generate certificate. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if remoteCertificate isn't provided and we have an enrollment/progress
    const fetchCert = async () => {
      if (remoteCertificate || !enrollmentId || (progress ?? 0) < 100) return;

      setIsLoading(true);
      setError('');
      try {
        const resp = await progressAPI.getCertificate(enrollmentId);
        if (resp?.data?.certificate) setCertificate(resp.data.certificate as Certificate);
      } catch (err: unknown) {
        // Safely derive message from unknown error
        if (typeof err === 'object' && err !== null) {
          const e = err as Record<string, unknown>;
          const response = e['response'] as Record<string, unknown> | undefined;
          const status = response && typeof response['status'] === 'number' ? response['status'] as number : undefined;
          const data = response && (response['data'] as Record<string, unknown> | undefined);
          const message = data && typeof data['message'] === 'string' ? (data['message'] as string) : undefined;

          if (status === 404) {
            setError('Certificate is still being processed. Please check back later.');
            return;
          }

          if (message) {
            setError(message);
            return;
          }
        }

        setError('Failed to load certificate');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCert();
  }, [enrollmentId, progress, remoteCertificate]);

  if (!enrollmentId) return null;

  return (
    <div className="mt-6">
      {isLoading && (
        <div className="p-4 rounded-md bg-blue-50 border border-blue-100 flex items-center gap-3">
          <div className="text-sm text-blue-700">Checking for certificate...</div>
        </div>
      )}

      {!isLoading && (remoteError || error) && (
        <div className="p-4 rounded-md bg-yellow-50 border border-yellow-100">
          <p className="text-sm text-yellow-800">{remoteError || error}</p>
        </div>
      )}

      {!isLoading && (remoteCertificate || certificate) && (
        <div className="p-4 rounded-md bg-white border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="text-sm font-medium">Certificate available</h4>
            <p className="text-xs text-gray-600">Issued {new Date((remoteCertificate || certificate)!.issuedAt).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Serial: <code className="text-xs">{(remoteCertificate || certificate)!.serialHash}</code></p>
          </div>

          <div className="flex items-center gap-2">
            {/* Prefer download when enrollmentId is present */}
            {enrollmentId ? (
              <CertificateDownload enrollmentId={String(enrollmentId)} courseTitle={courseTitle || 'course'} />
            ) : (
              // If enrollment missing but cert URL exists, allow viewing
              (() => {
                const url = extractCertUrl(remoteCertificate || certificate);
                if (url) {
                  return (
                    <Button
                      variant="outline"
                      onClick={() => window.open(url, '_blank')}
                    >
                      View Certificate
                    </Button>
                  );
                }
                return <Button disabled variant="outline">No certificate file</Button>;
              })()
            )}

            <Button variant="ghost" asChild>
              <a href={`/api/certificates/verify/${(remoteCertificate || certificate)!.serialHash}`} target="_blank" rel="noreferrer">Verify</a>
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !(remoteCertificate || certificate) && !(remoteError || error) && (isPolling || (progress ?? 0) >= 100) && (
        <div className="p-4 rounded-md bg-yellow-50 border border-yellow-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-yellow-800">Certificate is being generated. Please check back shortly.</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleGenerate}>Try Generate Now</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoursePageCertificateBanner;
