'use client';

import React from 'react';
import {
  GraduationCap,
  ClipboardList,
  Users,
  TrendingUp,
  Settings,
  CreditCard,
  LogOut,
  LayoutDashboard,
  Box,
  LayoutGrid,
  Map,
  Calendar,
  Layers,
  Zap,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, ModuleItem } from '@/core/contexts/AuthContext';

const iconMap: Record<string, any> = {
  LayoutDashboard: LayoutDashboard,
  Users: Users,
  GraduationCap: GraduationCap,
  Box: Box,
  CreditCard: CreditCard,
  Settings: Settings,
  ClipboardList: ClipboardList,
  TrendingUp: TrendingUp,
  Map: Map,
  Calendar: Calendar,
  Layers: Layers,
  Target: Target,
  Zap: Zap
};

const GROUP_CONFIG: Record<string, { label: string; order: number }> = {
  dashboard: { label: 'ACADEMIA', order: 1 },
  mentor: { label: 'ACADEMIA', order: 1 },
  inventory: { label: 'ACADEMIA', order: 1 },
  branches: { label: 'ACADEMIA', order: 1 },
  agenda: { label: 'ACADEMIA', order: 1 },
  staff: { label: 'EQUIPO', order: 2 },
  crm: { label: 'SISTEMA', order: 3 },
  subscriptions: { label: 'SISTEMA', order: 3 },
  settings: { label: 'SISTEMA', order: 3 },
};

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  if (loading) return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col py-10 z-50 h-screen sticky top-0 animate-pulse">
      <div className="px-8 mb-12">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl"></div>
      </div>
      <div className="flex-1 px-6 space-y-8">
        {[1, 2, 3].map(g => (
          <div key={g} className="space-y-4">
            <div className="h-3 w-20 bg-slate-50 rounded ml-2"></div>
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-12 bg-slate-50 rounded-2xl w-full"></div>)}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );

  const modules = user?.modules?.filter(m => {
    if (user.role === 'mentor_owner' || user.role === 'admin') {
      if (m.module === 'staff') return false;
      if (m.key === 'gamification') return false;
      return true;
    }
    if (m.permission && !user.permissions.includes(m.permission)) {
      return false;
    }
    return true;
  }) || [];

  const groupedModules = modules.reduce((acc: Record<string, ModuleItem[]>, item) => {
    const groupName = GROUP_CONFIG[item.module]?.label || GROUP_CONFIG[item.key]?.label || 'OTROS';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(item);
    return acc;
  }, {});

  // Force modules for development
  if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'agenda')) {
    groupedModules['ACADEMIA'].push({ key: 'agenda', label: 'Agenda maestro', icon: 'Calendar', path: '/dashboard/agenda', module: 'agenda' });
  }
  if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'templates')) {
    groupedModules['ACADEMIA'].push({ key: 'templates', label: 'Plantillas', icon: 'Layers', path: '/dashboard/templates', module: 'mentor' });
  }
  if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'groups')) {
    groupedModules['ACADEMIA'].push({ key: 'groups', label: 'Grupos', icon: 'Users', path: '/dashboard/groups', module: 'mentor' });
  }
  if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'tasks')) {
    groupedModules['ACADEMIA'].push({ key: 'tasks', label: 'Tareas', icon: 'ClipboardList', path: '/dashboard/tasks', module: 'mentor' });
  }
  if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'habits')) {
    groupedModules['ACADEMIA'].push({ key: 'habits', label: 'Hábitos', icon: 'TrendingUp', path: '/dashboard/habits', module: 'mentor' });
  }
  if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'gamification')) {
    if (user?.role !== 'mentor_owner' && user?.role !== 'admin') {
      groupedModules['ACADEMIA'].push({ key: 'gamification', label: 'Gamificación', icon: 'Zap', path: '/dashboard/gamification', module: 'mentor' });
    }
  }

  const sortedGroupNames = Object.keys(groupedModules).sort((a, b) => {
    const orderA = Object.values(GROUP_CONFIG).find(c => c.label === a)?.order || 99;
    const orderB = Object.values(GROUP_CONFIG).find(c => c.label === b)?.order || 99;
    return orderA - orderB;
  });

  return (
    <aside className="w-72 bg-white/80 backdrop-blur-3xl border-r border-white/60 flex flex-col py-10 z-50 h-screen sticky top-0 overflow-y-auto mentor-scroll shadow-2xl shadow-slate-200/50">

      {/* Brand Unit */}
      <Link href="/dashboard" className="px-8 mb-8 flex items-center gap-4 group cursor-pointer">
        <div className="w-12 h-12 relative flex items-center justify-center transition-all duration-500 group-hover:scale-110">
          <img
            src="/assets/logo_iter_vector.svg"
            alt="ITER Logo"
            className="w-full h-full drop-shadow-[0_10px_20px_rgba(99,102,241,0.06)]"
          />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic bg-gradient-to-r from-[#818CF8] to-[#6366F1] bg-clip-text text-transparent pr-3">
            ITER
          </h2>
        </div>
      </Link>

      {/* Navigation Groups */}
      <nav className="flex flex-col gap-10 flex-1 w-full px-5 font-sans">
        {sortedGroupNames.map((groupName) => (
          <div key={groupName} className="space-y-4">
            <div className="flex items-center gap-3 px-4 mb-6">
              <div className="w-1 h-3 bg-slate-200 rounded-full" />
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">
                {groupName}
              </h3>
            </div>
            <div className="space-y-1.5">
              {groupedModules[groupName].map((item) => {
                const Icon = iconMap[item.icon] || LayoutGrid;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    className={`relative flex items-center gap-4 px-5 py-3.5 rounded-[20px] transition-all duration-500 group overflow-hidden ${isActive
                      ? 'bg-indigo-50/60 text-indigo-600'
                      : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/30'
                      }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'} transition-all`} />
                    <span className={`text-[11px] font-black uppercase tracking-[0.15em] italic ${isActive ? 'text-indigo-600' : 'group-hover:text-indigo-600'}`}>
                      {item.label}
                    </span>

                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-indigo-500 rounded-l-full" />
                    )}

                    <div className="absolute inset-0 bg-indigo-500/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Operator Unit */}
      <div className="mt-auto px-5 pt-8 border-t border-slate-100/50 space-y-6">
        <div className="flex items-center gap-4 px-4 py-4 bg-slate-50/50 border border-slate-100/50 rounded-[28px] group hover:bg-white transition-all duration-500 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center overflow-hidden shadow-xl border border-white/10 group-hover:rotate-6 transition-transform">
            {user?.avatarUrl ? (
              <img
                src={`/avatars/${user.avatarUrl}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[12px] font-black text-white uppercase italic">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight italic">{user?.firstName} {user?.lastName}</p>
            <p className="text-[9px] text-slate-400 truncate font-black uppercase tracking-[0.2em] italic opacity-60">OPERADOR {user?.role?.split('_')[0]}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-red-500 transition-all rounded-[20px] hover:bg-red-50/50 group italic"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Desconectar</span>
        </button>
      </div>
    </aside>
  );
};
