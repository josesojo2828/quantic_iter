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
  Package
} from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';

const menuItems = [
  { icon: BarChart2, label: 'Resumen', href: '/dashboard' },
  { icon: Building2, label: 'Talleres', href: '/tenants' },
  { icon: CreditCard, label: 'Suscripciones', href: '/subscriptions' },
  { icon: Package, label: 'Planes', href: '/plans' },
  { icon: Users, label: 'Usuarios', href: '/users' },
  { icon: Settings, label: 'Ajustes', href: '/settings' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0 z-50">
      {/* Brand Logo */}
      <div className="px-6 py-6 border-b border-neutral-100/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-neutral uppercase tracking-wider">
              Quantic
            </h1>
            <p className="text-[10px] font-medium text-neutral/40 -mt-0.5">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-neutral-100 text-neutral shadow-sm' 
                  : 'text-neutral/50 hover:bg-neutral-50 hover:text-neutral/80'}
              `}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Support & Profile */}
      <div className="px-3 pb-6 border-t border-neutral-100 pt-6">
        <div className="space-y-1 mb-6">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral/50 hover:bg-neutral-50 hover:text-neutral/80 transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span>Soporte</span>
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500/60 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Technical User Profile */}
        {user && (
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-neutral truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[9px] text-neutral/40 font-medium truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
