import React, { Suspense } from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  return (
    <AuthLayout subtitle="Crear nueva cuenta" title='Registro'>
      <Suspense fallback={
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-[#8A94F4] animate-spin" />
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
