'use client';

import React from 'react';
import { useAuth } from '@/core/contexts/AuthContext';
import { LogOut, Users, LayoutDashboard, User, Lock } from 'lucide-react';

interface MenteeLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCoach?: { id: string; name: string; specialty: string; avatarUrl?: string } | null;
}

export const MenteeLayout: React.FC<MenteeLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  selectedCoach,
}) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { key: 'coach', label: 'ENTRENADORES', icon: Users },
    { key: 'panel', label: 'MI PANEL', icon: LayoutDashboard, prominent: true },
    { key: 'profile', label: 'MI PERFIL', icon: User },
  ];

  const hasCoach = !!selectedCoach;

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F6FA] pb-24 md:pb-0 text-[#2C3A50]">
      
      {/* 1. TOP GLASSMORPHIC NAV */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-[#EAF0F6] px-4 py-3 md:px-8 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-3">
          {/* Logo Monogram */}
          <div className="w-9 h-9 rounded-xl bg-[#7B91EB] flex items-center justify-center shadow-lg shadow-[#7B91EB]/20">
            <span className="text-[14px] font-black text-white italic tracking-tighter">I</span>
          </div>
          <div>
            <h1 className="text-[14px] font-black text-[#2C3A50] tracking-tighter uppercase italic leading-none">
              ITER
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
              Portal del Alumno
            </p>
          </div>
        </div>

        {/* User profile & controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-black text-[#2C3A50] uppercase tracking-tight italic">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-[8px] font-extrabold text-[#7B91EB] uppercase tracking-widest bg-[#7B91EB]/10 px-2 py-0.5 rounded-full mt-0.5 border border-[#7B91EB]/20">
              ESTUDIANTE
            </span>
          </div>

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/80 bg-slate-200 shadow-md">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl.startsWith('/') || user.avatarUrl.startsWith('http') ? user.avatarUrl : `/avatars/${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-[12px] font-black uppercase">
                {user?.firstName?.charAt(0) || 'E'}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-9 h-9 rounded-xl bg-white/80 border border-slate-200/50 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all duration-300 shadow-sm"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-8 gap-6">
        
        {/* DESKTOP SIDE NAVIGATION */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 gap-2">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-soft space-y-4">
            <div className="pb-4 border-b border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">NAVEGACIÓN</p>
            </div>
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                const isDisabled = item.key === 'panel' && !hasCoach;

                return (
                  <button
                    key={item.key}
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      setActiveTab(item.key);
                    }}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 relative overflow-hidden group ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100/50'
                        : isActive
                        ? 'bg-[#7B91EB] text-white shadow-lg shadow-[#7B91EB]/20 scale-[1.02]'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-[#7B91EB]'
                    } ${item.prominent ? 'border-2 border-dashed border-[#7B91EB]/40' : ''}`}
                    title={isDisabled ? 'Seleccioná un Coach primero para habilitar tu panel' : item.label}
                  >
                    <Icon size={16} className={isActive ? 'animate-pulse' : ''} />
                    {item.label}
                    {isDisabled && (
                      <Lock size={12} className="ml-auto text-slate-400 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* PAGE CONTENT */}
        <main className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>

      {/* 3. STICKY BOTTOM NAVIGATION FOR MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#EAF0F6] flex items-center justify-around py-3 px-4 shadow-2xl rounded-t-[32px]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          const isDisabled = item.key === 'panel' && !hasCoach;

          if (item.prominent) {
            return (
              <button
                key={item.key}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  setActiveTab(item.key);
                }}
                className={`relative -top-5 w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl border-4 border-white ${
                  isDisabled
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : isActive
                    ? 'bg-gradient-to-tr from-[#7B91EB] to-[#99A7EE] text-white scale-110 shadow-[#7B91EB]/30'
                    : 'bg-[#7B91EB] text-white hover:scale-105 shadow-[#7B91EB]/20 animate-pulse'
                }`}
                title={isDisabled ? 'Seleccioná un Coach primero para habilitar tu panel' : item.label}
              >
                <Icon size={22} className={isActive ? 'animate-pulse' : ''} />
                <span className="text-[7px] font-black uppercase tracking-widest mt-0.5">{item.label}</span>
                {isDisabled && (
                  <div className="absolute -top-1 -right-1 bg-slate-400 text-white rounded-full p-0.5 border border-white shadow-md">
                    <Lock size={8} />
                  </div>
                )}
              </button>
            );
          }

          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 ${
                isActive ? 'text-[#7B91EB] scale-110 font-bold bg-[#7B91EB]/10' : 'text-slate-400 hover:text-[#7B91EB]'
              }`}
            >
              <Icon size={18} className={isActive ? 'stroke-[2.5px] animate-pulse' : 'stroke-[2px]'} />
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
