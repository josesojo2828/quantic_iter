'use client';

import React, { useEffect, useState } from 'react';
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
  Target,
  Globe
} from 'lucide-react';
import Link from 'next/link';

const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3003';
import { usePathname } from 'next/navigation';
import { useAuth, ModuleItem } from '@/core/contexts/AuthContext';
import { apiClient } from '@/core/api/api.client';

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

export const Sidebar = ({ disabled }: { disabled?: boolean }) => {
  const pathname = usePathname();
  const { user, loading, logout, refreshProfile } = useAuth();

  const handleSwitchTenant = async (tenantId: string) => {
    try {
      await apiClient.post('/auth/switch-context', { tenantId });
      await refreshProfile();
    } catch (err) {
      console.error('Error al cambiar de sede:', err);
    }
  };

  const handleActivateIndependent = async () => {
    try {
      await apiClient.post('/auth/activate-independent', {});
      await refreshProfile();
    } catch (err) {
      console.error('Error al activar perfil independiente:', err);
    }
  };

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

  const hasIndependentProfile = user?.roles?.some(
    (r: any) => r.roleSlug === 'mentor_owner' && r.tenantName?.startsWith('Coach ')
  );

  const hasGymRoles = user?.roles?.some(
    (r: any) => !r.tenantName?.startsWith('Coach ')
  );

  const showTenantSelector = !hasIndependentProfile || hasGymRoles;

  const activeRole = user?.roles?.find((r: any) => r.tenantId === user.tenantId);
  const isOwner = activeRole?.roleSlug === 'mentor_owner';
  const isIndependentCoach = isOwner && activeRole?.tenantName?.startsWith('Coach ');
  const isCoach = (!isOwner && user?.role !== 'admin') || isIndependentCoach;

  const [hasPendingInvites, setHasPendingInvites] = useState(false);

  useEffect(() => {
    if (user && isCoach) {
      apiClient.get<any[]>('/invitation/my/pending')
        .then((data) => {
          if (data && data.length > 0) {
            setHasPendingInvites(true);
          } else {
            setHasPendingInvites(false);
          }
        })
        .catch((err) => console.error('Error al obtener solicitudes pendientes para sidebar:', err));
    }
  }, [user, isCoach]);

  const modules = user?.modules?.filter(m => {
    if (m.key === 'staff') {
      if (isIndependentCoach) return false;
      if (!isOwner && user?.role !== 'admin') return false;
    }
    if (m.key === 'settings' || m.key === 'crm' || m.key === 'subscriptions') {
      if (!isOwner && user?.role !== 'admin') return false;
    }
    if (isOwner || user?.role === 'admin') {
      if (m.key === 'gamification') return false;
      return true;
    }
    if (m.permission && !user?.permissions.includes(m.permission)) {
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

  // Force modules for development (only for coaches who train students, e.g. Independent or Staff)
  if (isCoach) {
    // if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'agenda')) {
    //   groupedModules['ACADEMIA'].push({ key: 'agenda', label: 'Agenda maestro', icon: 'Calendar', path: '/dashboard/agenda', module: 'agenda' });
    // }
    if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'templates')) {
      groupedModules['ACADEMIA'].push({ key: 'templates', label: 'Plantillas', icon: 'Layers', path: '/dashboard/templates', module: 'mentor' });
    }
    // if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'groups')) {
    //   groupedModules['ACADEMIA'].push({ key: 'groups', label: 'Grupos', icon: 'Users', path: '/dashboard/groups', module: 'mentor' });
    // }
    // if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'tasks')) {
    //   groupedModules['ACADEMIA'].push({ key: 'tasks', label: 'Tareas', icon: 'ClipboardList', path: '/dashboard/tasks', module: 'mentor' });
    // }
    if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'habits')) {
      groupedModules['ACADEMIA'].push({ key: 'habits', label: 'Hábitos', icon: 'TrendingUp', path: '/dashboard/habits', module: 'mentor' });
    }
    // [TEMPORAL] Gamificación oculta para todos
    // if (groupedModules['ACADEMIA'] && !groupedModules['ACADEMIA'].find(m => m.key === 'gamification')) {
    //   groupedModules['ACADEMIA'].push({ key: 'gamification', label: 'Gamificación', icon: 'Zap', path: '/dashboard/gamification', module: 'mentor' });
    // }
  } else {
    // If they are Gym Owner, ensure they don't have these coach-specific modules but DO allow templates
    if (groupedModules['ACADEMIA']) {
      groupedModules['ACADEMIA'] = groupedModules['ACADEMIA'].filter(m =>
        m.key !== 'groups' && m.key !== 'tasks' && m.key !== 'habits' && m.key !== 'gamification' && m.key !== 'agenda'
      );
      if (!groupedModules['ACADEMIA'].find(m => m.key === 'templates')) {
        groupedModules['ACADEMIA'].push({ key: 'templates', label: 'Plantillas', icon: 'Layers', path: '/dashboard/templates', module: 'mentor' });
      }
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
      {disabled ? (
        <div className="px-8 mb-8 flex items-center gap-4 select-none">
          <div className="w-12 h-12 relative flex items-center justify-center transition-all duration-500 hover:scale-105">
            <img
              src="/assets/logo_iter_vector.svg"
              alt="ITER Logo"
              className="w-full h-full drop-shadow-[0_10px_20px_rgba(138,148,244,0.15)]"
            />
          </div>
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-[#8A94F4] to-[#B1B8F9] bg-clip-text text-transparent uppercase italic tracking-wider pr-3">
              ITER
            </h2>
          </div>
        </div>
      ) : (
        <Link href="/dashboard" className="px-8 mb-8 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 relative flex items-center justify-center transition-all duration-500 group-hover:scale-110">
            <img
              src="/assets/logo_iter_vector.svg"
              alt="ITER Logo"
              className="w-full h-full drop-shadow-[0_10px_20px_rgba(138,148,244,0.15)]"
            />
          </div>
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-[#8A94F4] to-[#B1B8F9] bg-clip-text text-transparent uppercase italic pr-3">
              ITER
            </h2>
          </div>
        </Link>
      )}

      {/* Navigation Groups */}
      <nav className="flex flex-col gap-10 flex-1 w-full px-5 font-sans">
        {sortedGroupNames.map((groupName) => {
          if (groupName === 'EQUIPO') {
            if (isIndependentCoach) return null;
            if (!isOwner && user?.role !== 'admin') return null;
          }
          if (groupName === 'SISTEMA') {
            if (!isOwner && user?.role !== 'admin') return null;
          }
          return (
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

                  if (disabled) {
                    return (
                      <div
                        key={item.key}
                        className="relative flex items-center gap-4 px-5 py-3.5 rounded-[20px] opacity-30 cursor-not-allowed select-none text-slate-300"
                      >
                        <Icon className="w-4.5 h-4.5 text-slate-300" />
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] italic text-slate-300">
                          {item.label}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.key}
                      href={item.path}
                      className={`relative flex items-center gap-4 px-5 py-3.5 rounded-[20px] transition-all duration-500 group overflow-hidden ${isActive
                        ? 'bg-[#8A94F4]/10 text-[#8A94F4]'
                        : 'text-slate-400 hover:text-[#8A94F4] hover:bg-[#8A94F4]/5'
                        }`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#8A94F4]' : 'text-slate-400 group-hover:text-[#8A94F4]'} transition-all`} />
                      <span className={`text-[11px] font-black uppercase tracking-[0.15em] italic ${isActive ? 'text-[#8A94F4]' : 'group-hover:text-[#8A94F4]'}`}>
                        {item.label}
                      </span>

                      {item.key === 'settings' && hasPendingInvites && (
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8A94F4]/50 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8A94F4] animate-pulse shadow-[0_0_8px_rgba(138,148,244,0.7)]"></span>
                        </span>
                      )}

                      {isActive && (
                        <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#8A94F4] rounded-l-full" />
                      )}

                      <div className="absolute inset-0 bg-[#8A94F4]/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Operator Unit */}
      <div className="mt-auto px-5 pt-6 border-t border-slate-100/50 space-y-4">
        {/* Selector de Perfil/Sede */}
        {showTenantSelector && (
          <div className="space-y-2 px-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">SEDE / PERFIL ACTIVO</h4>
            </div>

            <select
              value={user?.tenantId}
              onChange={(e) => handleSwitchTenant(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] focus:outline-none transition-all shadow-sm italic cursor-pointer"
            >
              {user?.roles?.map((r: any) => (
                <option key={r.tenantId} value={r.tenantId}>
                  {r.tenantName ? r.tenantName.toUpperCase() : 'GIMNASIO ITER'} ({r.roleSlug === 'mentor_owner' ? 'PROPIETARIO' : 'STAFF / COACH'})
                </option>
              ))}
            </select>

            {!hasIndependentProfile && (
              <button
                onClick={handleActivateIndependent}
                className="w-full mt-2.5 py-2.5 px-3 border border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/20 hover:bg-indigo-50/50 text-indigo-600 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 italic flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-indigo-500 animate-bounce" />
                Activar mi Marca Personal
              </button>
            )}
          </div>
        )}

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

        <a
          href={LANDING_URL}
          className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-[#8A94F4] transition-all rounded-[20px] hover:bg-[#8A94F4]/5 group italic"
        >
          <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500 text-slate-400 group-hover:text-[#8A94F4]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sitio Oficial</span>
        </a>

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
