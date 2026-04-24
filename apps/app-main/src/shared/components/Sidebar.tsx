'use client';

import React from 'react';
import { 
  Wrench, 
  Car, 
  ClipboardList, 
  Users, 
  TrendingUp, 
  Settings,
  CreditCard,
  History,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Box,
  LayoutGrid,
  Map
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/core/contexts/AuthContext';

const iconMap: Record<string, any> = {
  LayoutDashboard: LayoutDashboard,
  Users: Users,
  Wrench: Wrench,
  Box: Box,
  CreditCard: CreditCard,
  Settings: Settings,
  ClipboardList: ClipboardList,
  TrendingUp: TrendingUp,
  Map: Map,
};



export const Sidebar = () => {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  if (loading) return (
    <aside className="fixed left-0 top-0 bottom-0 w-28 bg-[var(--quantic-dark)] flex flex-col items-center py-8 z-50 animate-pulse">
      <div className="w-12 h-12 bg-white/5 rounded-xl mb-12"></div>
      <div className="flex-1 space-y-4 w-full px-4 text-center">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-white/5 rounded-lg"></div>)}
      </div>
    </aside>
  );

  const modules = user?.modules || [];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-28 bg-[var(--quantic-dark)] flex flex-col items-center py-8 z-50 shadow-2xl border-r border-white/[0.03] overflow-y-auto admin-scroll">
      {/* Brand Icon */}
      <Link href="/dashboard" className="w-12 h-12 bg-[var(--quantic-primary)] rounded-xl flex items-center justify-center mb-12 shadow-lg shadow-[var(--quantic-glow)] hover:scale-105 transition-transform group flex-shrink-0">
        <Wrench className="text-white w-6 h-6 group-hover:rotate-45 transition-transform" />
      </Link>

      {/* Main Nav */}
      <nav className="flex flex-col gap-6 flex-1 w-full px-3">
        {modules.map((item, index) => {
          const Icon = iconMap[item.icon] || LayoutGrid;
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.key} 
              href={item.path}
              className={`relative flex flex-col items-center justify-center py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-[var(--quantic-primary)]/10 text-[var(--quantic-primary)]' 
                  : 'text-gray-500 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[var(--quantic-primary)] rounded-r-full shadow-[0_0_12px_var(--quantic-glow)]"></div>
              )}
              <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              <span className={`text-[8px] font-black uppercase tracking-tighter text-center whitespace-nowrap px-1 ${isActive ? 'text-[var(--quantic-primary)]' : 'text-gray-600 group-hover:text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>


      {/* Footer Nav */}
      <div className="flex flex-col gap-4 w-full px-3 pt-6 border-t border-white/5 flex-shrink-0">
        <button 
          onClick={logout}
          className="flex flex-col items-center justify-center py-3 text-red-500/40 hover:text-red-500 transition-all rounded-xl hover:bg-red-500/5 group"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Salir</span>
        </button>
      </div>
    </aside>
  );
};


