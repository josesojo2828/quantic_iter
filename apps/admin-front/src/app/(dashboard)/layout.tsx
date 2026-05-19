'use client';

import React, { useEffect, useRef } from 'react';
import { Sidebar } from '@/shared/ui/Sidebar';
import { AuthGuard } from '@/core/auth/AuthGuard';
import gsap from 'gsap';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Aura Page Transition
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [children]); // Trigger on route change

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-transparent">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 h-screen overflow-hidden flex flex-col">
          <div 
            ref={contentRef}
            className="flex-1 aura-glass rounded-[32px] border border-white/5 overflow-y-auto p-6 lg:p-10 shadow-2xl relative"
          >
            {/* Subtle inner glow for the main panel */}
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
