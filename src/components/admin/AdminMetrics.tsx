'use client';

import { AdminMetricsWithProgress } from './AdminMetricsWithProgress';
import { AdminMetrics as AdminMetricsType } from '@/lib/api';

interface AdminMetricsProps {
  metrics: AdminMetricsType;
}

export function AdminMetrics({ metrics }: AdminMetricsProps) {
  // Delegate to the progress-enabled component. This preserves the original
  // export name so other modules (like the admin dashboard) don't need to change imports.
  return <AdminMetricsWithProgress metrics={metrics} />;
}
