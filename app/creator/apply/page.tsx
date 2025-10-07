import { AuthenticatedLayout } from '@/components/auth/AuthenticatedLayout';
import { CreatorApplicationForm } from '@/components/creator/CreatorApplicationForm';

export default function CreatorApplyPage() {
  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto py-12">
        <CreatorApplicationForm />
      </div>
    </AuthenticatedLayout>
  );
}
