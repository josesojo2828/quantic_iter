'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Check, 
  Zap, 
  Clock, 
  Calendar, 
  Camera, 
  Trophy,
  ChevronRight,
  Flame,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import toast from 'react-hot-toast';
import { EvidenceModal } from '../programs/[id]/components/EvidenceModal';

export default function DailyDashboardPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceTarget, setEvidenceTarget] = useState<any>(null);

  const fetchDailyTasks = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<any[]>('/mentor/programs');
      // Filtramos solo los programas que no son plantillas
      setPrograms(data.filter(p => !p.isTemplate));
    } catch (error) {
      toast.error('Error al cargar tu rutina');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyTasks();
  }, []);

  const today = new Date();
  const dayIndex = today.getDay(); // 0 (Dom) - 6 (Sab)
  // Convertir a nuestro sistema: 0 (Lun), 1 (Mar), ..., 6 (Dom)
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  
  // Logic to filter milestones that apply today
  const dailyTasks = programs.flatMap(program => 
    (program.phases || []).flatMap((phase: any) => 
      (phase.milestones || []).filter((milestone: any) => {
        if (milestone.frequency === 'DAILY') return true;
        if (milestone.frequency === 'WEEKLY') {
          return (milestone.daysOfWeek || []).includes(adjustedIndex);
        }
        if (milestone.frequency === 'ONCE' && milestone.dueDate) {
          return new Date(milestone.dueDate).toDateString() === today.toDateString();
        }
        return false;
      }).map((m: any) => ({ 
        ...m, 
        programName: program.name, 
        programId: program.id 
      }))
    )
  );

  const isTaskCompletedToday = (task: any) => {
    return task.completions && task.completions.some((c: any) => 
      new Date(c.date).toDateString() === today.toDateString()
    );
  };

  const completedCount = dailyTasks.filter(isTaskCompletedToday).length;
  const progress = dailyTasks.length > 0 ? Math.round((completedCount / dailyTasks.length) * 100) : 0;

  const handleToggle = async (task: any, evidence?: string) => {
    const isCompleted = isTaskCompletedToday(task);
    
    if (task.requiredEvidence !== 'NONE' && !isCompleted && !evidence) {
      setEvidenceTarget(task);
      setIsEvidenceModalOpen(true);
      return;
    }

    try {
      await apiClient.post(`/mentor/programs/${task.programId}/milestones/${task.id}/toggle`, {
        date: today.toISOString(),
        evidence
      });
      fetchDailyTasks();
      if (evidence) toast.success('¡Hábito completado con evidencia!');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
           <Zap className="w-4 h-4 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster />
      
      <EvidenceModal 
         isOpen={isEvidenceModalOpen}
         onClose={() => setIsEvidenceModalOpen(false)}
         milestone={evidenceTarget}
         onSubmit={(evidence) => handleToggle(evidenceTarget, evidence)}
      />

      {/* Header Section */}
      <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Operational Pulse</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            Rendimiento <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-emerald-700">Diario</span>
          </h1>
          <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.25em] opacity-60 italic leading-relaxed">
            Métricas de actividad en tiempo real. Monitorea el progreso de tus alumnos y la eficiencia operativa hoy.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-3.5 rounded-[18px] border border-white shadow-soft">
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">Tu Racha Actual</p>
              <p className="text-lg font-black text-slate-900 uppercase italic">15 Días 🔥</p>
           </div>
           <div className="w-px h-6 bg-slate-200" />
           <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                  {i}
                </div>
              ))}
           </div>
        </div>
      </header>

      {/* KPI Stats & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
         <div className="md:col-span-1 glass-card bg-white/70 backdrop-blur-xl p-4.5 rounded-[20px] border border-white shadow-soft flex items-center gap-4 group hover:scale-[1.02] transition-transform duration-500">
            <div className="relative w-11 h-11 flex-shrink-0">
               <svg className="w-full h-full -rotate-90">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#F1F5F9" strokeWidth="4.5" />
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#10B981" strokeWidth="4.5" strokeDasharray={113} strokeDashoffset={113 - (113 * progress) / 100} strokeLinecap="round" className="transition-all duration-1000" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-slate-900 italic">{progress}%</div>
            </div>
            <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">Progreso</p>
               <p className="text-lg font-black text-slate-900 uppercase italic">{completedCount} / {dailyTasks.length}</p>
            </div>
         </div>

         {[
            { label: 'Puntos Aura', value: '1.2k', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Rango: Elite' },
            { label: 'Participación', value: '92%', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Récord Semanal' },
            { label: 'XP Ganada', value: '+450', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Hoy' },
         ].map((kpi, i) => (
            <div key={i} className="glass-card bg-white/70 backdrop-blur-xl p-4.5 rounded-[20px] border border-white shadow-soft group hover:scale-[1.02] transition-transform duration-500 flex items-center gap-4">
               <div className={`w-9 h-9 ${kpi.bg} ${kpi.color} rounded-lg flex-shrink-0 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform`}>
                  <kpi.icon className="w-4 h-4" />
               </div>
               <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">{kpi.label}</p>
                  <p className="text-lg font-black text-slate-900 uppercase italic">{kpi.value}</p>
               </div>
            </div>
         ))}
      </div>

      {/* Main Content: Tasks & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
         {/* Tasks List */}
         <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                  <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                  Rutina de Hoy
               </h3>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{dailyTasks.length} Tareas Programadas</span>
            </div>

            {dailyTasks.length === 0 ? (
               <div className="glass-card bg-white/70 backdrop-blur-xl p-10 rounded-[24px] border border-white shadow-soft text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                     <Zap className="w-6 h-6 text-slate-200" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic">Sin tareas para hoy</h3>
                  <p className="text-[8.5px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 max-w-[240px] mx-auto italic">
                     ¡Disfruta tu día libre o añade nuevos hábitos desde tus programas!
                  </p>
               </div>
            ) : (
               <div className="space-y-3">
                  {dailyTasks.map((task) => {
                     const isCompleted = isTaskCompletedToday(task);
                     return (
                        <div key={task.id} className={`glass-card p-4.5 rounded-[20px] border transition-all duration-500 flex items-center justify-between group ${
                           isCompleted 
                              ? 'bg-emerald-50/30 border-emerald-100/50' 
                              : 'bg-white/70 backdrop-blur-xl border-white shadow-soft hover:shadow-xl hover:shadow-indigo-100/30 hover:-translate-y-1'
                        }`}>
                           <div className="flex items-center gap-4">
                              <button 
                                 onClick={() => handleToggle(task)}
                                 className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                    isCompleted 
                                       ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                                       : 'bg-white border border-slate-100 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 shadow-sm'
                                 }`}
                              >
                                 {isCompleted ? <Check className="w-4.5 h-4.5 stroke-[4.5]" /> : (
                                    task.requiredEvidence !== 'NONE' ? <Camera className="w-4 h-4" /> : <Zap className="w-4 h-4" />
                                 )}
                              </button>
                              <div>
                                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest block mb-0.5 italic">{task.programName}</span>
                                 <h4 className={`text-base font-black uppercase tracking-tight transition-all italic ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                    {task.title}
                                 </h4>
                                 <div className="flex items-center gap-3 mt-1.5">
                                    <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
                                       <Clock className="w-3.5 h-3.5" />
                                       {task.frequency === 'DAILY' ? 'Diario' : `Cada ${task.frequency}`}
                                    </div>
                                    {task.requiredEvidence !== 'NONE' && (
                                       <div className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[7px] font-black uppercase tracking-widest rounded border border-amber-100 flex items-center gap-1">
                                          <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Evidencia Requerida
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex flex-col items-end gap-2">
                              <div className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-indigo-100 group-hover:scale-110 transition-transform italic">
                                 +{task.xpReward} XP
                              </div>
                              {isCompleted && (
                                 <div className="text-[7.5px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 animate-in slide-in-from-right-4 italic">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                    Completado
                                 </div>
                              )}
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 p-5 rounded-[24px] text-white overflow-hidden relative group shadow-2xl shadow-slate-200">
               <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
               <Trophy className="w-7 h-7 text-indigo-400 mb-4" />
               <h3 className="text-lg font-black uppercase tracking-tight mb-1 italic">Desafío del Día</h3>
               <p className="text-white/60 text-[8.5px] font-black leading-relaxed uppercase tracking-wider mb-4">Completá todos tus hábitos de hoy para obtener un multiplicador de XP x1.5</p>
               <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] hover:bg-indigo-400 hover:text-white transition-all active:scale-95 italic">
                  Ver Recompensas
               </button>
            </div>

            <div className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-soft">
               <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 italic">
                  <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                  Rendimiento Semanal
               </h3>
               <div className="flex justify-between items-end gap-1 h-20">
                  {[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
                     <div key={i} className="flex-1 space-y-1.5 flex flex-col items-center group/bar">
                        <div 
                           className={`w-full rounded-md transition-all duration-700 ${i === 6 ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-100 group-hover/bar:bg-indigo-200'}`} 
                           style={{ height: `${h}%` }}
                        />
                        <span className="text-[7px] font-black text-slate-300 uppercase">{['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}</span>
                     </div>
                  ))}
               </div>
               <div className="mt-4 pt-3 border-t border-slate-100/50 flex items-center justify-center gap-2">
                  <div className="p-1.5 bg-indigo-50 rounded-xl">
                     <Zap className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-[8.5px] font-black text-slate-900 uppercase tracking-widest italic">Nivel 42 Alcanzado</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
