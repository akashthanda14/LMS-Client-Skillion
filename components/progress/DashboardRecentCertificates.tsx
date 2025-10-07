"use client";

import React, { useEffect, useState } from 'react';
import { progressAPI, Certificate } from '@/lib/api';
import { CertificateCard } from './CertificateCard';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function DashboardRecentCertificates() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await progressAPI.getUserCertificates();
  const list: Certificate[] = resp.data?.certificates || [];
        // show most recent 2
        setCerts(list.slice(0, 2));
      } catch (err: unknown) {
        console.error('Failed to fetch recent certificates', err);
        // safe extraction
        if (typeof err === 'object' && err !== null) {
          const e = err as Record<string, unknown>;
          const response = e['response'] as Record<string, unknown> | undefined;
          const data = response && (response['data'] as Record<string, unknown> | undefined);
          const message = data && typeof data['message'] === 'string' ? (data['message'] as string) : undefined;
          setError(message || 'Failed to load certificates');
        } else {
          setError('Failed to load certificates');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Card className="p-4 h-full">
      <h3 className="text-lg font-semibold mb-3">Recent Certificates</h3>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : certs.length === 0 ? (
        <p className="text-sm text-gray-600">No recent certificates</p>
      ) : (
        <div className="space-y-3">
          {certs.map((c) => (
            <CertificateCard key={c.id} certificate={c} />
          ))}
        </div>
      )}
    </Card>
  );
}

export default DashboardRecentCertificates;
