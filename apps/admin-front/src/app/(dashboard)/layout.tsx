'use client';

import { Sidebar } from '@/shared/ui/Sidebar';
import { AuthGuard } from '@/core/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
