'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Building2,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  HelpCircle,
  CreditCard,
  Package,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';

const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3003';

const menuItems = [
  { icon: BarChart2, label: 'Resumen', href: '/dashboard' },
  { icon: Building2, label: 'Academias', href: '/tenants' },
  { icon: CreditCard, label: 'Suscripciones', href: '/subscriptions' },
  { icon: Package, label: 'Planes', href: '/plans' },
  { icon: Users, label: 'Usuarios', href: '/users' },
  { icon: ShieldAlert, label: 'Auditoría', href: '/audit' },
  { icon: Settings, label: 'Ajustes', href: '/settings' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-72 flex flex-col h-[calc(100vh-2rem)] sticky top-4 z-50 m-4 aura-glass rounded-[32px] overflow-hidden">
      {/* Brand Logo */}
      <div className="px-8 py-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 relative flex items-center justify-center transition-all duration-500 hover:scale-105">
            <img
              src="/assets/logo_iter_vector.svg"
              alt="ITER Logo"
              className="w-full h-full drop-shadow-[0_4px_12px_rgba(99,102,241,0.15)]"
            />
          </div>
          <div>
            <h1 className="text-sm font-black text-gradient uppercase tracking-widest leading-none">
              ITER
            </h1>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300
                ${isActive
                  ? 'text-white bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10'
                  : 'text-white/40 hover:bg-white/5 hover:text-white/70'}
              `}
            >
              <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-primary text-glow-primary' : ''}`} />
              <span className={isActive ? 'text-glow-primary' : ''}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Support & Profile */}
      <div className="px-4 pb-8 border-t border-white/5 pt-8 space-y-6">
        <div className="space-y-2">
          <a
            href={LANDING_URL}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-white/40 hover:bg-white/5 hover:text-white/70 transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>Sitio Oficial</span>
          </a>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-white/40 hover:bg-white/5 hover:text-white/70 transition-all">
            <HelpCircle className="w-4 h-4" />
            <span>Soporte</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Technical User Profile */}
        {user && (
          <div className="p-4 aura-glass-light rounded-2xl border border-white/5 group cursor-pointer hover:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center text-xs font-black text-white">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-white/30 font-bold truncate uppercase tracking-tighter">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
