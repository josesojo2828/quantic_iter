'use client';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout subtitle="Crear nueva cuenta" title='Registro'>
      <RegisterForm />
    </AuthLayout>
  );
}
