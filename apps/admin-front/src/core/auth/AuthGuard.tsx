'use client';

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-neutral-50/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral/30">
            Verificando sesión...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
