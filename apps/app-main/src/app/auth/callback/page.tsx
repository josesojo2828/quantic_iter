'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/core/api/api.client';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      handleImpersonation(token);
    } else {
      router.push('/login');
    }
  }, [token]);

  const handleImpersonation = async (impersonationToken: string) => {
    try {
      // Call the endpoint that sets the HttpOnly cookie
      await apiClient.get(`/auth/impersonate?token=${impersonationToken}`);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Impersonation failed:', error);
      router.push('/login?error=impersonation_failed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8" />
      <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-4">
        Validando <span className="text-primary text-3xl italic">Credenciales</span>
      </h1>
      <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-[0.3em] animate-pulse">
        Accediendo al taller como administrador...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CallbackContent />
    </Suspense>
  );
}
