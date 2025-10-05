"use client";

import React, { useEffect, useState } from 'react';
import { progressAPI, Certificate } from '@/lib/api';
import { CertificateCard } from '@/components/progress/CertificateCard';
import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { Loader2 } from 'lucide-react';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
  const response = await progressAPI.getUserCertificates();
  setCertificates(response.data?.certificates || []);
      } catch (err: any) {
        console.error('Failed to load certificates', err);
        setError(err.response?.data?.message || 'Failed to load certificates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">My Certificates</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : certificates.length === 0 ? (
          <p className="text-gray-600">You have not earned any certificates yet. Complete a course to receive one.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {certificates.map((c) => (
              <CertificateCard key={c.id} certificate={c} />
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
