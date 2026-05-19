'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Layers,
  Trophy,
  ChevronRight,
  Sparkles,
  Clock,
  Users,
  Layout
} from 'lucide-react';

import { ProgramForm } from './components/ProgramForm';
import { AssignStudentModal } from './components/AssignStudentModal';
import { apiClient } from '@/core/api/api.client';
import { toast } from 'react-hot-toast';
import { contactsService } from '@/features/crm/services/contacts.service';

const MenteeName = ({ id }: { id: string }) => {
  const [name, setName] = useState<string>('...');
  useEffect(() => {
    contactsService.getContactById(id)
      .then(c => setName(c.name))
      .catch(() => setName('N/A'));
  }, [id]);
  return <>{name}</>;
};

export default function ProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any[]>('/mentor/programs');
      // Solo programas EN EJECUCIÓN (con menteeId)
      const executionOnly = Array.isArray(response)
        ? response.filter(p => !p.isTemplate && p.menteeId)
        : [];
      setPrograms(executionOnly);
    } catch (error) {
      toast.error('Error al cargar programas activos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Central de Despliegue Quántico</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            Programas <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">En Curso</span>
          </h1>
          <p className="text-slate-500 font-black mt-3 max-w-xl text-[9px] uppercase tracking-[0.2em] opacity-60 italic leading-relaxed">
            Supervisión táctica de hitos, hábitos y protocolos de progreso en mentorías personalizadas.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button
            onClick={() => router.push('/dashboard/templates')}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-[18px] text-[8px] font-black uppercase tracking-[0.25em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 border border-white/10 italic group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
            Nueva Asignación
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'En Ejecución', value: programs.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', accent: 'indigo' },
          { label: 'Alumnos Activos', value: programs.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'emerald' },
          { label: 'Impacto XP', value: '2.4K', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50', accent: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-soft flex items-center gap-4 group overflow-hidden relative transition-all hover:shadow-2xl hover:shadow-indigo-500/5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner relative z-10 transition-transform group-hover:scale-110 duration-500`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter italic leading-none">{stat.value}</p>
            </div>
            <div className={`absolute -right-3 -bottom-3 opacity-[0.03] group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 text-${stat.accent}-600`}>
              <stat.icon className="w-20 h-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-lg" />
          <p className="text-[9px] text-slate-400 font-black tracking-[0.25em] uppercase animate-pulse">Analizando Red Quántica...</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="glass-card bg-white/50 backdrop-blur-xl rounded-[24px] border border-white/50 p-12 shadow-soft text-center space-y-6 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

          <div className="relative inline-block group">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center shadow-soft group-hover:scale-110 transition-all duration-700 relative z-10 border border-slate-50">
              <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Sector Silencioso</h3>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed opacity-70">
              No se detectan mentorías en ejecución. Es momento de desplegar conocimiento sobre tus activos.
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard/templates')}
            className="px-8 py-4 bg-slate-900 text-white rounded-[18px] text-[8px] font-black uppercase tracking-[0.25em] hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 italic"
          >
            Explorar Biblioteca de Plantillas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div
              key={program.id}
              className="glass-card bg-white/70 backdrop-blur-xl border border-white p-6 rounded-[24px] shadow-soft hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity duration-1000">
                 <BookOpen className="w-24 h-24 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              </div>

              {/* Status Header */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:bg-indigo-600 transition-all duration-500">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="px-3 py-1.5 bg-white border border-slate-100 text-slate-900 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 italic">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                    <MenteeName id={program.menteeId} />
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] italic border ${
                    program.status === 'PUBLISHED' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {program.status === 'PUBLISHED' ? 'OPERATIVO' : 'EN ESPERA'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6 relative z-10">
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none line-clamp-2 group-hover:text-indigo-600 transition-colors">{program.name}</h4>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] line-clamp-2 leading-relaxed opacity-60 h-8 italic">
                  {program.description || 'SIN ESPECIFICACIONES TÉCNICAS ADICIONALES.'}
                </p>
              </div>

              {/* Tactical Metrics */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100/50 mb-6 relative z-10 bg-slate-50/30 -mx-6 px-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.25em] italic">Duración Est.</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight italic">{program.duration || 'DINÁMICA'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.25em] italic">Despliegue</span>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight italic">{program.phases?.length || 0} BLOQUES</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(`/dashboard/programs/${program.id}`)}
                className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-[18px] text-[8px] font-black uppercase tracking-[0.25em] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-soft italic group/btn"
              >
                Supervisar Activo
                <ChevronRight className="w-3.5 h-3.5 inline-block ml-1.5 group-hover/btn:translate-x-1.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer Feature Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pt-4">
        {[
          { icon: Layers, label: 'Arquitectura por Bloques', desc: 'Sistemas secuenciales para aprendizaje progresivo.', accent: 'indigo' },
          { icon: Trophy, label: 'Desafíos Dinámicos', desc: 'Recompensas automáticas de XP basadas en hitos.', accent: 'amber' },
          { icon: Clock, label: 'Control de Entrega', desc: 'Contenido goteado según el ritmo del estudiante.', accent: 'emerald' },
        ].map((feature, i) => (
          <div key={i} className="flex items-start gap-4 group">
            <div className={`p-3 bg-white rounded-xl shadow-soft border border-slate-50 group-hover:scale-110 transition-transform duration-500 text-${feature.accent}-500`}>
              <feature.icon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">{feature.label}</p>
              <p className="text-[8px] font-medium leading-relaxed text-slate-400 uppercase tracking-tight">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
