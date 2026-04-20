import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { RecoverPasswordForm } from '@/features/auth/components/RecoverPasswordForm';

export default function RecoverPasswordPage() {
  return (
    <AuthLayout subtitle="Reset your access">
      <RecoverPasswordForm />
    </AuthLayout>
  );
}
