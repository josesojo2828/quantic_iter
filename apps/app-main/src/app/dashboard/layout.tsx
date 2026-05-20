'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { useAuth } from '@/core/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Handle redirects in useEffect to prevent rendering-time state updates in Next.js Router
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'mentee' && pathname !== '/dashboard') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  // If loading, show professional loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 border-[6px] border-indigo-50 border-t-indigo-600 rounded-full animate-spin shadow-2xl" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse italic">Iniciando Sistemas de Comando...</p>
        </div>
      </div>
    );
  }

  // Prevent rendering if user not authenticated
  if (!user) {
    return null;
  }

  // If the user is a mentee/client, we bypass the sidebar layout.
  // They will be handled by the MenteeLayout inside the main pages to allow tab/nav state sync.
  if (user.role === 'mentee') {
    if (pathname !== '/dashboard') {
      return null;
    }
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F8F9FD] to-[#F1F4FF]">
      <Sidebar />
      <main className="flex-1 transition-all duration-500 min-h-screen relative z-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

