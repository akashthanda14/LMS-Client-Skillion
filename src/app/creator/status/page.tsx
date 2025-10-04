import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { ApplicationStatus } from '@/components/creator/ApplicationStatus';

export default function CreatorStatusPage() {
  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto py-12">
        <ApplicationStatus />
      </div>
    </AuthenticatedLayout>
  );
}
