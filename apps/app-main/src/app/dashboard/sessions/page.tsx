'use client';

import React, { useRef } from 'react';
import { 
  Activity, 
  Clock, 
  ChevronRight, 
  Search, 
  Plus,
  Play,
  CheckCircle2,
  Users,
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function SessionsPage() {
  const headerRef = useRef<HTMLDivElement>(null);

  const mockSessions = [
    { 
      id: 1, 
      title: 'Optimización de Flujo de Trabajo', 
      client: 'Master Academy', 
      facilitator: 'Carlos Gomez', 
      status: 'In Progress', 
      time: '14:30',
      type: 'ESTRATÉGICA'
    },
    { 
      id: 2, 
      title: 'Auditoría de Procesos Críticos', 
      client: 'Nexus Corp', 
      facilitator: 'Sofia Ross', 
      status: 'Scheduled', 
      time: '16:00',
      type: 'TÉCNICA'
    },
    { 
      id: 3, 
      title: 'Análisis de Escalabilidad V1', 
      client: 'Quantic Labs', 
      facilitator: 'Carlos Gomez', 
      status: 'Completed', 
      time: '10:00',
      type: 'REVISIÓN'
    },
  ];

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster />
      
      {/* Header Section */}
      <header ref={headerRef} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Central de Operaciones Estratégicas</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            Sesiones <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">Activas</span>
          </h1>
          <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.25em] opacity-60 italic leading-relaxed">
            Monitorea el flujo operativo de tu mentoría en tiempo real. Coordina despliegues y garantiza la excelencia táctica.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-[18px] text-[8px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-indigo-100 hover:bg-indigo-600 active:scale-95 group italic border border-white/10">
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-500" /> 
          Agendar Sesión
        </button>
      </header>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'SESIONES HOY', value: '12', unit: 'OPERATIVAS', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
          { label: 'HORAS ACTIVAS', value: '45.8', unit: 'HORAS', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { label: 'FACILITADORES', value: '08', unit: 'ACTIVOS', icon: Users, color: 'text-amber-500', bg: 'bg-amber-50/50' },
        ].map((stat, i) => (
          <div key={i} className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-soft group hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-700 relative overflow-hidden">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500 shadow-inner border border-white relative z-10`}>
              <stat.icon className="w-4.5 h-4.5" />
            </div>
            <div className="relative z-10">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1.5 opacity-60 italic">{stat.label}</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{stat.value}</p>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest italic">{stat.unit}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deployment Monitoring Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-4">
          <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3 italic">
            <div className="w-1.5 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
            Control de Mando Operativo
          </h3>
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="RASTREAR SESIÓN..." 
              className="w-full md:w-64 bg-white/50 backdrop-blur-md border border-slate-100 rounded-[14px] pl-11 pr-4 py-2.5 text-[8.5px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm italic" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {mockSessions.map((session) => (
            <div 
              key={session.id} 
              className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-soft hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 group flex flex-col xl:flex-row items-center justify-between gap-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-5 w-full xl:w-auto">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 ${
                  session.status === 'In Progress' ? 'bg-indigo-600 text-white shadow-indigo-200' : 
                  session.status === 'Completed' ? 'bg-emerald-500 text-white shadow-emerald-200' :
                  'bg-slate-100 text-slate-400 shadow-slate-100'
                }`}>
                  {session.status === 'In Progress' ? <Play className="w-5 h-5 fill-current" /> : 
                   session.status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> :
                   <Calendar className="w-5 h-5" />}
                </div>
                
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[7px] font-black uppercase tracking-widest italic">{session.type}</span>
                    <span className="text-[8.5px] font-black text-indigo-500 uppercase tracking-widest italic">{session.time} HRS</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic leading-none group-hover:text-indigo-600 transition-colors">{session.title}</h4>
                  <div className="flex items-center gap-2.5 opacity-60">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3 h-3 text-slate-400" />
                      <span className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest">{session.client}</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest">{session.facilitator}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className={`px-3.5 py-1.5 rounded-full text-[7.5px] font-black uppercase tracking-[0.2em] italic border ${
                  session.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse' : 
                  session.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                  {session.status === 'In Progress' ? 'TRANSMITIENDO' : 
                   session.status === 'Completed' ? 'FINALIZADA' : 'PROGRAMADA'}
                </div>
                <button className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-500 hover:shadow-xl transition-all active:scale-90 group/btn">
                  <ChevronRight className="w-4.5 h-4.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
