'use client';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout subtitle="Bienvenido de nuevo." title='Iniciar Sesión'>
      <LoginForm />
    </AuthLayout>
  );
}
