'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

function getAvatarUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // If it already has the prefix from legacy data
  if (url.startsWith('/avatars/')) return `/assets${url}`;
  // Standard case: just filename
  return `/assets/avatars/${url}`;
}

function UserAvatar({ user }: { user: any }) {
  const [imageError, setImageError] = useState(false);
  const resolvedUrl = getAvatarUrl(user.avatarUrl);
  
  return (
    <div className="w-9 h-9 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center overflow-hidden">
      {resolvedUrl && !imageError ? (
        <img 
          src={resolvedUrl} 
          alt={user.firstName} 
          className="w-full h-full object-cover" 
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-[10px] font-bold text-neutral/40">{user.firstName?.charAt(0) || 'U'}</span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
              Live Ecosystem Control
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-tight bg-green-50 px-2 py-1 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Sistema Operativo
            </div>
          </div>
          <h1 className="text-5xl font-black text-neutral tracking-tighter leading-tight">
            Consola Operativa <br /> <span className="text-neutral/20 italic">Administrativa</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-xl p-3 rounded-[24px] border border-neutral-100 shadow-2xl shadow-neutral-200/40">
          <div className="p-4 bg-neutral-900 rounded-2xl text-white shadow-xl shadow-black/10">
            <span className="block text-[9px] font-bold opacity-40 uppercase tracking-[0.2em] mb-1">MRR Acumulado</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">${stats?.subscriptions?.totalMrr?.toFixed(2)}</span>
              <span className="text-xs font-bold text-green-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                12%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tenants Card */}
        <div className="group relative bg-white rounded-[32px] p-8 border border-neutral-100 shadow-xl shadow-neutral-200/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-8 right-8 w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:rotate-6 transition-all">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em]">Talleres en Ecosistema</span>
          <div className="mt-4 flex items-baseline gap-3">
            <h3 className="text-5xl font-black text-neutral">{stats?.tenants?.total}</h3>
            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3" />
              {stats?.tenants?.growth}%
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
               <span className="text-neutral/40">Nuevos (7d)</span>
               <span className="text-neutral">{stats?.tenants?.newThisWeek}</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-50 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(stats?.tenants?.total / 100) * 100}%` }}></div>
            </div>
          </div>
          <Link href="/tenants" className="absolute inset-0 z-0"></Link>
        </div>

        {/* Users Card */}
        <div className="group relative bg-white rounded-[32px] p-8 border border-neutral-100 shadow-xl shadow-neutral-200/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-8 right-8 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:-rotate-6 transition-all">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em]">Cuentas de Usuarios</span>
          <div className="mt-4 flex items-baseline gap-3">
            <h3 className="text-5xl font-black text-neutral">{stats?.users?.total}</h3>
            <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
               <TrendingUp className="w-3 h-3" />
               {stats?.users?.growth || 0}%
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex -space-x-3">
               {stats?.users?.latest?.map((user: any) => (
                 <UserAvatar key={user.id} user={user} />
               ))}
               {(stats?.users?.total || 0) > (stats?.users?.latest?.length || 0) && (
                 <div className="w-9 h-9 rounded-full border-2 border-white bg-neutral-900 flex items-center justify-center text-[10px] font-black text-white">
                   +{Math.max(0, (stats?.users?.total || 0) - (stats?.users?.latest?.length || 0))}
                 </div>
               )}
            </div>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-pulse">Online</span>
          </div>
          <Link href="/users" className="absolute inset-0 z-0"></Link>
        </div>

        {/* Subscriptions Status */}
        <div className="group relative bg-white rounded-[32px] p-8 border border-neutral-100 shadow-xl shadow-neutral-200/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-8 right-8 w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-all shadow-xl shadow-black/10">
            <CreditCard className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em]">Eficiencia Comercial</span>
          <div className="mt-4 flex items-baseline gap-3">
            <h3 className="text-5xl font-black text-neutral">{stats?.subscriptions?.activeCount}</h3>
            <span className="text-[10px] font-bold text-neutral/40 uppercase">Activas</span>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="p-3 bg-neutral-50 rounded-2xl">
               <span className="block text-[8px] font-black text-neutral/30 uppercase mb-1">Mora</span>
               <span className="text-sm font-black text-red-500">0%</span>
             </div>
             <div className="p-3 bg-neutral-50 rounded-2xl">
               <span className="block text-[8px] font-black text-neutral/30 uppercase mb-1">Avg Ticket</span>
               <span className="text-sm font-black text-neutral">${stats?.subscriptions?.activeCount > 0 ? (stats?.subscriptions?.totalMrr / stats?.subscriptions?.activeCount).toFixed(0) : '0'}</span>
             </div>
          </div>
          <Link href="/subscriptions" className="absolute inset-0 z-0"></Link>
        </div>
      </div>


      {/* Grid for more detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-lg p-8">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-neutral/30 uppercase tracking-widest flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> Distribución de Ingresos
             </h3>
             <Link href="/subscriptions" className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">Detalles</Link>
           </div>
           <div className="h-48 flex items-end justify-between gap-4">
              {stats?.subscriptions?.plans.map((p: any, i: number) => {
                const max = Math.max(...stats.subscriptions.plans.map((pl: any) => pl.total), 1);
                const height = (p.total / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-full bg-neutral-50 rounded-t-xl relative group h-full">
                       <div 
                          className="absolute bottom-0 w-full bg-indigo-500 rounded-t-xl transition-all duration-500 group-hover:bg-indigo-600" 
                          style={{ height: `${height}%` }}
                       ></div>
                       <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] px-2 py-1 rounded">
                         ${p.total}
                       </div>
                    </div>
                    <span className="text-[8px] font-black text-neutral/30 uppercase truncate w-full text-center">{p.planName}</span>
                  </div>
                );
              })}
           </div>
        </div>
        
        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-lg p-8">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-neutral/30 uppercase tracking-widest flex items-center gap-2">
               <ShieldCheck className="w-4 h-4" /> Actividad del Sistema
             </h3>
             <span className="text-[10px] font-bold text-neutral/40 italic tracking-tighter">Eventos Activos</span>
           </div>
           <div className="space-y-4">
              {[
                { label: 'Talleres en Red', val: stats?.tenants?.total, status: 'Active' },
                { label: 'Suscripciones', val: stats?.subscriptions?.activeCount, status: 'Billed' },
                { label: 'Usuarios Totales', val: stats?.users?.total, status: 'Sync' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl group hover:bg-neutral-100 transition-colors">
                   <span className="text-xs font-bold text-neutral/60">{item.label}</span>
                   <div className="flex items-center gap-4">
                     <span className="text-sm font-black text-neutral">{item.val}</span>
                     <span className="text-[9px] font-black uppercase bg-white px-2 py-0.5 rounded border border-neutral-200 text-green-500">{item.status}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
