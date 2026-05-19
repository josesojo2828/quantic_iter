'use client';

import React from 'react';
import { Logo } from '@/shared/components/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
  title?: string;
}

export const AuthLayout = ({ children, subtitle, title }: AuthLayoutProps) => {

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F8F9FD] font-sans antialiased text-[#1A1C1E] p-4 [perspective:1000px]"
    >
      {/* Dynamic Aura Background Elements with Parallax */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#8A94F4]/15 rounded-full blur-[100px] bg-glow-1 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-[#B1B8F9]/15 rounded-full blur-[120px] bg-glow-2 pointer-events-none" />

      {/* Additional depth layers */}
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-[#8A94F4]/5 rounded-full blur-[80px] bg-glow-1 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-[#B1B8F9]/8 rounded-full blur-[90px] bg-glow-2 pointer-events-none" />

      <div
        className="mq-glass-card mq-noise-overlay w-full max-w-[580px] p-8 md:p-12 relative z-10 flex flex-col items-center shadow-[0_32px_64px_-16px_rgba(138,148,244,0.15)] will-change-transform"
      >
        <div className="flex flex-col items-center gap-4 mb-10 text-center relative z-20">
          <div className="w-16 h-16 bg-[#8A94F4] rounded-2xl flex items-center justify-center shadow-lg shadow-[#8A94F4]/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Logo size={40} className="text-white relative z-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1C1E]">
              Iter
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8A94F4] mt-1 opacity-80">
              power by: <a href="https://quanticarch.com" className="text-[#8A94F4] font-bold">QuanticArch</a>
            </p>
          </div>
        </div>

        <div className="w-full relative z-20">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-[#1A1C1E] tracking-tight leading-tight">
              {title}
            </h2>
            <p className="mt-2 text-[#6C757D] font-medium text-sm">
              {subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
