"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  Plus,
  Settings
} from "lucide-react";
import gsap from "gsap";

const UserAvatar = ({ user }: { user: any }) => (
  <div className="w-9 h-9 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center text-[10px] font-black text-white shadow-lg overflow-hidden group">
    {user.avatarUrl ? (
      <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover transition-transform group-hover:scale-125" />
    ) : (
      <span>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
    )}
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || !stats) return;

    const ctx = gsap.context(() => {
      gsap.from(".stat-card", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      });
      
      gsap.from(".chart-bar", {
        height: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)",
        delay: 0.8
      });
    }, dashboardRef);
    return () => ctx.revert();
  }, [loading, stats]);


  if (loading || !stats) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 reveal-content opacity-100 translate-y-0">
        <div>
          <h2 className="text-3xl font-black text-gradient uppercase tracking-tight">
            Consola de Mando
          </h2>
          <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-1">
            Resumen Operativo Aura Edition
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="aura-glass-light px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-all border border-white/5 hover:border-white/20">
            Exportar Datos
          </button>
          <button className="bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-[0_10px_20px_rgba(0,210,255,0.2)] hover:shadow-[0_15px_30px_rgba(0,210,255,0.4)] transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva Academia
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Tenants Card */}
        <div className="stat-card group relative aura-glass p-8 aura-border-glow rounded-[32px] overflow-hidden transition-all duration-500 hover:-translate-y-2">
          <div className="absolute top-8 right-8 w-14 h-14 aura-glass-light rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all border border-white/10 shadow-[0_0_20px_rgba(0,210,255,0.1)]">
            <Building2 className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Academias Activas</span>
          <div className="mt-4 flex items-baseline gap-3">
            <h3 className="text-6xl font-black text-white tracking-tighter text-glow-primary">{stats?.tenants?.total}</h3>
            <div className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <TrendingUp className="w-3 h-3" />
              +{stats?.tenants?.growth}%
            </div>
          </div>
          
          <div className="mt-10 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
               <span className="text-white/20">Nuevas (7d)</span>
               <span className="text-white/60">{stats?.tenants?.newThisWeek}</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
               <div className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full shadow-[0_0_10px_var(--primary)]" style={{ width: '65%' }}></div>
            </div>
          </div>
          <Link href="/tenants" className="absolute inset-0 z-0"></Link>
        </div>

        {/* Users Card */}
        <div className="stat-card group relative aura-glass p-8 aura-border-glow rounded-[32px] overflow-hidden transition-all duration-500 hover:-translate-y-2">
          <div className="absolute top-8 right-8 w-14 h-14 aura-glass-light rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 group-hover:-rotate-6 transition-all border border-white/10 shadow-[0_0_20px_rgba(157,80,187,0.1)]">
            <Users className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Comunidad Mentee</span>
          <div className="mt-4 flex items-baseline gap-3">
            <h3 className="text-6xl font-black text-white tracking-tighter" style={{ textShadow: "0 0 15px rgba(157, 80, 187, 0.3)" }}>{stats?.users?.total}</h3>
            <div className="flex items-center gap-1 text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
               <TrendingUp className="w-3 h-3" />
               +{stats?.users?.growth}%
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between">
            <div className="flex -space-x-3">
               {stats?.users?.latest?.map((user: any) => (
                 <UserAvatar key={user.id} user={user} />
               ))}
               <div className="w-9 h-9 rounded-full border-2 border-white/10 bg-black flex items-center justify-center text-[10px] font-black text-white/50 backdrop-blur-xl">
                 +1.5k
               </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Online</span>
            </div>
          </div>
          <Link href="/users" className="absolute inset-0 z-0"></Link>
        </div>

        {/* Business Efficiency Card */}
        <div className="stat-card group relative aura-glass p-8 aura-border-glow rounded-[32px] overflow-hidden transition-all duration-500 hover:-translate-y-2">
          <div className="absolute top-8 right-8 w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-all border border-white/10 shadow-2xl">
            <CreditCard className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Eficiencia Comercial</span>
          <div className="mt-4 flex items-baseline gap-3">
            <h3 className="text-6xl font-black text-white tracking-tighter">${(stats?.subscriptions?.totalMrr / 1000).toFixed(1)}k</h3>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">MRR</span>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4">
             <div className="p-4 aura-glass-light rounded-2xl border border-white/5">
               <span className="block text-[8px] font-black text-white/20 uppercase mb-1 tracking-widest">Retención</span>
               <span className="text-lg font-black text-primary text-glow-primary">98.2%</span>
             </div>
             <div className="p-4 aura-glass-light rounded-2xl border border-white/5">
               <span className="block text-[8px] font-black text-white/20 uppercase mb-1 tracking-widest">LTV Promedio</span>
               <span className="text-lg font-black text-white">$2.4k</span>
             </div>
          </div>
          <Link href="/subscriptions" className="absolute inset-0 z-0"></Link>
        </div>
      </div>

      {/* Grid for more detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        
        {/* Revenue Distribution Chart */}
        <div className="stat-card aura-glass rounded-[32px] border border-white/5 p-10 relative overflow-hidden group">
           <div className="flex items-center justify-between mb-12">
             <div>
               <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.3em] flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-primary" /> Ingresos por Plan
               </h3>
               <p className="text-[10px] text-white/20 font-bold uppercase mt-1">Distribución mensual de suscripciones</p>
             </div>
             <Link href="/subscriptions" className="text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl border border-primary/20 transition-all uppercase tracking-widest">Detalles</Link>
           </div>
           
           <div className="h-64 flex items-end justify-between gap-6 px-4">
              {stats?.subscriptions?.plans.map((p: any, i: number) => {
                const max = Math.max(...stats.subscriptions.plans.map((pl: any) => pl.total), 1);
                const height = (p.total / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                    <div className="w-full bg-white/5 rounded-2xl relative h-full border border-white/5 overflow-hidden p-[2px]">
                       <div 
                          className="chart-bar absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-primary rounded-xl transition-all duration-500 shadow-[0_0_20px_var(--primary-glow)]" 
                          style={{ height: `${height}%` }}
                       >
                         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                       </div>
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] font-black text-white uppercase tracking-tighter">{p.planName}</span>
                      <span className="block text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">${p.total}</span>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
        
        {/* System Activity Feed */}
        <div className="stat-card aura-glass rounded-[32px] border border-white/5 p-10 relative group">
           <div className="flex items-center justify-between mb-10">
             <div>
               <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.3em] flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-secondary" /> Actividad del Sistema
               </h3>
               <p className="text-[10px] text-white/20 font-bold uppercase mt-1">Monitoreo de eventos en tiempo real</p>
             </div>
             <button className="aura-glass-light p-2 rounded-xl text-white/30 hover:text-white transition-all">
                <Settings className="w-4 h-4" />
             </button>
           </div>
           
           <div className="space-y-4">
              {[
                { label: 'Sincronización de Academias', val: stats?.tenants?.total, status: 'Active', color: 'text-primary' },
                { label: 'Procesamiento de Facturas', val: stats?.subscriptions?.activeCount, status: 'Billed', color: 'text-secondary' },
                { label: 'Sesiones de Usuario Activas', val: stats?.users?.total, status: 'Secure', color: 'text-green-500' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 aura-glass-light rounded-2xl border border-white/5 group/item hover:border-white/10 transition-all">
                   <div className="flex items-center gap-4">
                     <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_10px_currentColor]`} />
                     <span className="text-xs font-bold text-white/60 tracking-tight">{item.label}</span>
                   </div>
                   <div className="flex items-center gap-6">
                     <span className="text-sm font-black text-white">{item.val}</span>
                     <div className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                        <ChevronRight className="w-3 h-3 text-white/20" />
                     </div>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-10 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Todo el sistema operando correctamente</p>
              </div>
              <span className="text-[8px] font-black text-primary uppercase underline cursor-pointer">Ver Logs</span>
           </div>
        </div>
      </div>
    </div>
  );
}
