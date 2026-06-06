'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Plus,
  Layers,
  BookOpen,
  Trophy,
  Edit3,
  Trash2,
  Clock,
  Target,
  FileText,
  Zap,
  Users,
  Check,
  Calendar,
  Camera,
  X,
  Flame,
  ListTodo
} from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PhaseForm, MilestoneForm } from './components/CurriculumForms';
import { EvidenceModal } from './components/EvidenceModal';
import { contactsService, Contact } from '@/features/crm/services/contacts.service';

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<any>(null);
  const [mentee, setMentee] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
   const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
   const [evidenceTarget, setEvidenceTarget] = useState<any>(null);

   const toggleSubTask = async (milestoneId: string, title: string, index?: number) => {
     let isCurrentlyCompleted = false;
     
     // 1. Optimistic UI update on program object
     setProgram((prev: any) => {
       if (!prev) return prev;
       return {
         ...prev,
         phases: prev.phases?.map((ph: any) => ({
           ...ph,
           milestones: ph.milestones?.map((m: any) => {
             if (m.id !== milestoneId) return m;
             return {
               ...m,
               subTasks: m.subTasks?.map((st: any, i: number) => {
                 if (index !== undefined ? i === index : st.title === title) {
                   isCurrentlyCompleted = st.isCompleted || false;
                   return { ...st, isCompleted: !isCurrentlyCompleted };
                 }
                 return st;
               })
             };
           })
         }))
       };
     });

     try {
       await apiClient.post(`/mentor/programs/${params.id}/milestones/${milestoneId}/subtasks/toggle`, {
         title,
         index,
         isCompleted: !isCurrentlyCompleted,
       });
     } catch (error) {
       toast.error('Error al actualizar el ejercicio');
       // Revert Optimistic UI update
       setProgram((prev: any) => {
         if (!prev) return prev;
         return {
           ...prev,
           phases: prev.phases?.map((ph: any) => ({
             ...ph,
             milestones: ph.milestones?.map((m: any) => {
               if (m.id !== milestoneId) return m;
               return {
                 ...m,
                 subTasks: m.subTasks?.map((st: any, i: number) => {
                   if (index !== undefined ? i === index : st.title === title) {
                     return { ...st, isCompleted: isCurrentlyCompleted };
                   }
                   return st;
                 })
               };
             })
           }))
         };
       });
     }
   };

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/mentor/programs/${params.id}`);
      setProgram(response);

      if (response.menteeId) {
        try {
          const menteeData = await contactsService.getContactById(response.menteeId);
          setMentee(menteeData);
        } catch (err) {
          console.error('Error fetching mentee details:', err);
        }
      }
    } catch (error) {
      toast.error('Error al cargar el programa');
      router.push('/dashboard/programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, [params.id]);

  const handleAddPhase = async (data: any) => {
    try {
      await apiClient.post(`/mentor/programs/${params.id}/phases`, { ...data, order: program.phases?.length || 0 });
      toast.success('Fase añadida');
      setIsPhaseModalOpen(false);
      fetchProgram();
    } catch (error) {
      toast.error('Error al añadir la fase');
    }
  };

  const handleQuickInitializePhase = async () => {
    const isRoutine = program?.type === 'ROUTINE';
    try {
      await apiClient.post(`/mentor/programs/${params.id}/phases`, {
        name: isRoutine ? 'Pasos de la Rutina' : 'Hábitos del Protocolo',
        description: isRoutine ? 'Lista de pasos semanales asignados a esta rutina.' : 'Lista de hábitos diarios y semanales asignados a este protocolo.',
        order: 0
      });
      toast.success(isRoutine ? '¡Lista de pasos inicializada!' : '¡Lista de hábitos inicializada!');
      fetchProgram();
    } catch (error) {
      toast.error(isRoutine ? 'Error al inicializar los pasos' : 'Error al inicializar los hábitos');
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta fase? Todos sus hitos se perderán.')) return;
    try {
      await apiClient.get(`/mentor/programs/${params.id}/phases/${phaseId}/delete`);
      toast.success('Fase eliminada');
      fetchProgram();
    } catch (error) {
      toast.error('Error al eliminar la fase');
    }
  };

  const handleAddMilestone = async (data: any) => {
    try {
      await apiClient.post(`/mentor/programs/${params.id}/phases/${selectedPhaseId}/milestones`, data);
      toast.success('Hito añadido');
      setIsMilestoneModalOpen(false);
      fetchProgram();
    } catch (error) {
      toast.error('Error al añadir el hito');
    }
  };

  const handleDeleteMilestone = async (phaseId: string, milestoneId: string) => {
    try {
      await apiClient.get(`/mentor/programs/${params.id}/phases/${phaseId}/milestones/${milestoneId}/delete`);
      toast.success('Hito eliminado');
      fetchProgram();
    } catch (error) {
      toast.error('Error al eliminar el hito');
    }
  };

  // --- HABIT TRACKER UTILITIES ---
  const isMilestoneLockedForDate = (milestone: any, date: Date) => {
    if (!milestone.completions) return false;
    const frequency = milestone.frequency;
    const localTargetString = date.toLocaleDateString('en-CA');
    
    if (frequency === 'DAILY') {
      return milestone.completions.some((c: any) => {
        const utcDateStr = new Date(c.date).toISOString().split('T')[0];
        return utcDateStr === localTargetString;
      });
    }
    
    if (frequency === 'WEEKLY') {
      const getStartOfWeekUTC = (d: Date) => {
        const temp = new Date(d);
        const day = temp.getUTCDay();
        const diff = temp.getUTCDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(temp.setUTCDate(diff));
        weekStart.setUTCHours(0, 0, 0, 0);
        return weekStart;
      };
      
      const localTargetAsUTCDate = new Date(`${localTargetString}T00:00:00.000Z`);
      const targetWeekStart = getStartOfWeekUTC(localTargetAsUTCDate);
      
      return milestone.completions.some((c: any) => {
        const cWeekStart = getStartOfWeekUTC(new Date(c.date));
        return cWeekStart.getTime() === targetWeekStart.getTime();
      });
    }

    if (frequency === 'ONCE') {
      return milestone.completions.length > 0;
    }
    
    return false;
  };

  const getLast14Days = () => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const isDayCompleted = (milestone: any, day: Date) => {
    if (!milestone.completions) return false;
    const localTargetString = day.toLocaleDateString('en-CA');
    return milestone.completions.some((c: any) => {
      const utcDateStr = new Date(c.date).toISOString().split('T')[0];
      return utcDateStr === localTargetString;
    });
  };

  const calculateStreak = (completions: any[]) => {
    if (!completions || completions.length === 0) return 0;
    
    const sortedDates = Array.from(
      new Set(completions.map(c => new Date(c.date).toISOString().split('T')[0]))
    ).map(dStr => new Date(`${dStr}T00:00:00.000Z`)).sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    
    const localTodayStr = new Date().toLocaleDateString('en-CA');
    const today = new Date(`${localTodayStr}T00:00:00.000Z`);
    
    const localYesterday = new Date();
    localYesterday.setDate(localYesterday.getDate() - 1);
    const localYesterdayStr = localYesterday.toLocaleDateString('en-CA');
    const yesterday = new Date(`${localYesterdayStr}T00:00:00.000Z`);

    const hasToday = sortedDates.some(d => d.getTime() === today.getTime());
    const hasYesterday = sortedDates.some(d => d.getTime() === yesterday.getTime());

    if (!hasToday && !hasYesterday) return 0;

    let expected = hasToday ? today : yesterday;

    for (let i = 0; i < sortedDates.length; i++) {
      if (sortedDates[i].getTime() === expected.getTime()) {
        streak++;
        expected.setUTCDate(expected.getUTCDate() - 1);
        expected.setUTCHours(0, 0, 0, 0);
      } else if (sortedDates[i].getTime() < expected.getTime()) {
        break;
      }
    }
    return streak;
  };

  const handleToggleMilestoneForDate = async (milestone: any, date: Date) => {
    if (program.isTemplate) return;
    
    const localTargetString = date.toLocaleDateString('en-CA');
    const apiDateStr = `${localTargetString}T12:00:00.000Z`;
    
    const isCompletedOnDate = milestone.completions?.some((c: any) => {
      const utcDateStr = new Date(c.date).toISOString().split('T')[0];
      return utcDateStr === localTargetString;
    });

    if (milestone.requiredEvidence !== 'NONE' && !isCompletedOnDate) {
      setEvidenceTarget({ ...milestone, customDate: new Date(apiDateStr) });
      setIsEvidenceModalOpen(true);
      return;
    }

    try {
      await apiClient.post(`/mentor/programs/${params.id}/milestones/${milestone.id}/toggle`, {
        date: apiDateStr
      });
      toast.success(isCompletedOnDate ? 'Día desmarcado' : '¡Día marcado como completado!');
      fetchProgram();
    } catch (error) {
      toast.error('Error al actualizar el progreso');
    }
  };

  const handleToggleMilestone = async (milestone: any, evidence?: string) => {
    if (program.isTemplate) return;

    const targetDate = milestone.customDate || new Date();
    const localTargetString = targetDate.toLocaleDateString('en-CA');
    const apiDateStr = `${localTargetString}T12:00:00.000Z`;
    
    const isCompleted = milestone.completions && milestone.completions.some((c: any) => {
      const utcDateStr = new Date(c.date).toISOString().split('T')[0];
      return utcDateStr === localTargetString;
    });

    if (milestone.requiredEvidence !== 'NONE' && !isCompleted && !evidence) {
      setEvidenceTarget(milestone);
      setIsEvidenceModalOpen(true);
      return;
    }

    try {
      await apiClient.post(`/mentor/programs/${params.id}/milestones/${milestone.id}/toggle`, {
        date: apiDateStr,
        evidence
      });
      fetchProgram();
      if (evidence) toast.success('¡Evidencia subida y hito marcado! +500 XP');
      else toast.success('¡Progreso actualizado!');
    } catch (error) {
      toast.error('Error al actualizar el progreso');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50/50 backdrop-blur-xl">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <Zap className="w-4 h-4 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!program) return null;

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const from = searchParams ? searchParams.get('from') : null;
  const isHabits = program.type === 'HABITS' || program.type === 'ROUTINE' || from === 'habits';
  const isRoutine = program.type === 'ROUTINE';

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Modals */}
      <PhaseForm
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        onSubmit={handleAddPhase}
      />
      <MilestoneForm
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onSubmit={handleAddMilestone}
        isHabitOnly={isHabits}
        programType={program?.type}
      />
      <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        milestone={evidenceTarget}
        onSubmit={(evidence) => handleToggleMilestone(evidenceTarget, evidence)}
      />

      {/* Header Navigation & Actions */}
      <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              if (isHabits) {
                router.push('/dashboard/habits');
              } else {
                router.push('/dashboard/programs');
              }
            }}
            className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all font-black text-[8.5px] uppercase tracking-[0.25em] italic"
          >
            <div className="w-8 h-8 bg-white border border-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            {isHabits ? (isRoutine ? 'Regresar a Rutinas' : 'Regresar a Hábitos') : 'Regresar a Programas'}
          </button>

          <div className="tactical-header">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1.5 bg-indigo-500 text-white rounded-full text-[8px] font-black uppercase tracking-[0.25em] shadow-lg shadow-indigo-100 italic">
                {program.isTemplate ? 'Protocolo Maestro' : 'Despliegue Activo'}
              </span>
              {mentee && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-full text-[8px] font-black uppercase tracking-[0.25em] shadow-xl shadow-slate-200 italic border border-white/10">
                  <Users className="w-3 h-3 text-indigo-400" />
                  Activo: {mentee.name}
                </div>
              )}
              <div className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.25em] italic border shadow-sm ${
                program.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {program.status || 'BORRADOR'}
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
              {program.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto">
          <button className="flex-1 xl:flex-none px-5 py-3 bg-white border border-slate-200 rounded-[16px] font-black text-[8.5px] uppercase tracking-[0.25em] hover:bg-slate-50 transition-all shadow-sm italic active:scale-95">
            Configuración
          </button>
          <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-[16px] font-black text-[8.5px] uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100 active:scale-95 italic border border-white/10 group">
            <Zap className="w-4 h-4 group-hover:scale-125 transition-transform animate-pulse" />
            Sincronizar
          </button>
        </div>
      </header>

      {/* Program Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Arquitectura', val: program.phases?.length || 0, unit: 'Fases', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Objetivos', val: program.phases?.reduce((acc: number, p: any) => acc + (p.milestones?.length || 0), 0) || 0, unit: isRoutine ? 'Pasos' : (isHabits ? 'Hábitos' : 'Hitos'), icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Potencial XP', val: program.phases?.reduce((acc: number, p: any) => acc + (p.milestones?.reduce((mAcc: number, m: any) => mAcc + (m.xpReward || 0), 0) || 0), 0) || 0, unit: 'Puntos', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Cronograma', val: program.duration || '--', unit: 'Tiempo', icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((stat, i) => (
          <div key={i} className="glass-card bg-white/70 backdrop-blur-xl p-4 rounded-[20px] border border-white shadow-soft group hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
            <div className={`w-10 h-10 rounded-[12px] ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner relative z-10 transition-transform group-hover:scale-110 duration-500 border border-white`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="mt-4 relative z-10">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 italic opacity-60">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{stat.val}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{stat.unit}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Curriculum Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Phases & Milestones */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                {isHabits ? (
                  <>
                    <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                    Panel de Consistencia de {isRoutine ? 'Pasos' : 'Hábitos'}
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Estructura del Currículum
                  </>
                )}
              </h2>
              {isHabits && (
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.25em] italic opacity-60 mt-1">
                  {isRoutine 
                    ? 'Registrá y gestioná los pasos y rutinas semanales de este protocolo.'
                    : 'Registrá y gestioná las rutinas diarias y semanales de este protocolo.'}
                </p>
              )}
            </div>
            {!isHabits ? (
              <button
                onClick={() => setIsPhaseModalOpen(true)}
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-[9px] uppercase tracking-widest group"
              >
                <Plus className="w-3.5 h-3.5 p-0.5 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all" />
                Añadir Fase
              </button>
            ) : (
              program.phases && program.phases.length > 0 ? (
                <button
                  onClick={() => {
                    setSelectedPhaseId(program.phases[0].id);
                    setIsMilestoneModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-[9px] uppercase tracking-widest group"
                >
                  <Plus className="w-3.5 h-3.5 p-0.5 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all animate-pulse" />
                  Añadir {isRoutine ? 'Paso' : 'Hábito'}
                </button>
              ) : (
                <button
                  onClick={handleQuickInitializePhase}
                  className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-[9px] uppercase tracking-widest group"
                >
                  <Plus className="w-3.5 h-3.5 p-0.5 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all" />
                  Inicializar {isRoutine ? 'Pasos' : 'Hábitos'}
                </button>
              )
            )}
          </div>
             {/* Habits / Routines Unified Layout */}
          {isHabits ? (
            <div className="space-y-8">
              {/* List phases and their habits */}
              {(!program.phases || program.phases.length === 0) ? (
                <div className="glass-card bg-white/50 border-2 border-dashed border-slate-200 p-10 rounded-[24px] text-center space-y-4">
                  <Flame className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tighter italic leading-none">Sin Consistencia Inicial</h3>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] italic">Para poder incorporar {isRoutine ? 'pasos' : 'hábitos y rutinas'}, inicializá la lista de consistencia.</p>
                  </div>
                  <button
                    onClick={handleQuickInitializePhase}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-[16px] font-black text-[8px] uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-lg active:scale-95 italic"
                  >
                    Inicializar {isRoutine ? 'Pasos de la Rutina' : 'Hábitos del Protocolo'}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {program.phases.map((phase: any, index: number) => (
                    <div key={phase.id} className={isHabits ? "space-y-4" : "space-y-4 bg-slate-50/40 p-5 rounded-[28px] border border-slate-100/50"}>
                      {/* Phase Header */}
                      {!isHabits && (
                          <div className="flex items-center justify-between px-1">
                            <div className="space-y-1">
                              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic leading-none flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-indigo-500" />
                                FASE {String(index + 1).padStart(2, '0')}: {phase.name}
                              </h3>
                              {phase.description && (
                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.25em] italic opacity-60">
                                  {phase.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedPhaseId(phase.id);
                                  setIsMilestoneModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors font-bold text-[9px] uppercase tracking-widest group"
                              >
                                <Plus className="w-3.5 h-3.5 p-0.5 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all" />
                                Añadir Hábito / Rutina
                              </button>
                              <button
                                onClick={() => handleDeletePhase(phase.id)}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 text-slate-300 hover:text-red-500 hover:shadow-xl rounded-xl transition-all active:scale-90"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Habits inside this specific phase */}
                        {(!phase.milestones || phase.milestones.length === 0) ? (
                          <div className="glass-card bg-white border border-dashed border-slate-200 p-8 rounded-[24px] text-center space-y-3 shadow-sm">
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] italic">
                              {isHabits 
                                ? (isRoutine ? 'No hay pasos definidos en esta rutina.' : 'No hay hábitos definidos en este protocolo.') 
                                : 'Sin hitos asignados en esta categoría.'}
                            </p>
                            <button
                              onClick={() => {
                                setSelectedPhaseId(phase.id);
                                setIsMilestoneModalOpen(true);
                              }}
                              className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-[12px] font-black text-[8px] uppercase tracking-[0.3em] transition-all active:scale-95 italic"
                            >
                              {isHabits ? (isRoutine ? 'Crear primer Paso' : 'Crear primer Hábito') : 'Crear Hito'}
                            </button>
                          </div>
                        ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {phase.milestones.map((milestone: any) => {
                            const isCompletedToday = isMilestoneLockedForDate(milestone, new Date());
                            const currentStreak = calculateStreak(milestone.completions || []);
                            const streakColor = currentStreak > 0 ? 'text-orange-500 bg-orange-50 border-orange-100' : 'text-slate-400 bg-slate-50 border-slate-100';
                            
                            const hasSubTasks = milestone.subTasks && milestone.subTasks.length > 0;
                            const completedSubTasks = hasSubTasks ? milestone.subTasks.filter((st: any) => st.isCompleted) : [];
                            const allSubTasksChecked = hasSubTasks ? milestone.subTasks.every((st: any) => st.isCompleted) : true;

                            return (
                              <div key={milestone.id} className="glass-card bg-white border border-white hover:border-slate-100/50 rounded-[28px] p-6 shadow-soft hover:shadow-2xl transition-all duration-500 space-y-6 relative overflow-hidden">
                                {/* Streak fire background effect */}
                                {currentStreak > 0 && (
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/[0.02] to-transparent rounded-bl-full pointer-events-none" />
                                )}

                                <div className="flex justify-between items-start gap-4">
                                  <div className="space-y-1">
                                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight italic leading-tight">
                                      {milestone.title}
                                    </h4>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <div className="px-2 py-0.5 bg-indigo-50 rounded text-[7px] font-black text-indigo-500 uppercase tracking-widest italic border border-indigo-100 shadow-sm">+{milestone.xpReward} XP</div>
                                      <div className="px-2 py-0.5 bg-emerald-50 rounded text-[7px] font-black text-emerald-600 uppercase tracking-widest italic border border-emerald-100 shadow-sm">
                                        {milestone.frequency === 'DAILY' ? 'DIARIO' : milestone.frequency === 'WEEKLY' ? 'SEMANAL' : 'ÚNICO'}
                                      </div>
                                      {milestone.requiredEvidence !== 'NONE' && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded text-[7px] font-black text-amber-600 uppercase tracking-widest italic border border-amber-100 shadow-sm">
                                          <Zap className="w-2.5 h-2.5 animate-pulse" />
                                          EVIDENCIA
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[7.5px] font-black uppercase tracking-widest italic shadow-sm shrink-0 ${streakColor}`}>
                                      <Flame className={`w-3.5 h-3.5 fill-current ${currentStreak > 0 ? 'animate-pulse' : ''}`} />
                                      RACHA: {currentStreak}D
                                    </div>
                                    <button
                                      onClick={() => handleDeleteMilestone(phase.id, milestone.id)}
                                      className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-slate-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-slate-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Exercise/Habit Subtasks (Checklist) */}
                                {hasSubTasks && (
                                  <div className="space-y-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                                      <span className="text-[7.5px] font-black text-indigo-500 uppercase tracking-widest italic leading-none">
                                        Ejercicios completados ({isCompletedToday ? milestone.subTasks.length : completedSubTasks.length}/{milestone.subTasks.length})
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-1.5">
                                      {milestone.subTasks.map((task: any, idx: number) => {
                                        const isSubChecked = isCompletedToday || task.isCompleted;
                                        const isBtnDisabled = program.isTemplate || isCompletedToday;

                                        return (
                                          <button
                                            key={idx}
                                            disabled={isBtnDisabled}
                                            type="button"
                                            onClick={() => toggleSubTask(milestone.id, task.title, idx)}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all duration-300 active:scale-[0.98] ${
                                              isSubChecked
                                                ? 'bg-emerald-50/30 border-emerald-100/50 text-emerald-800'
                                                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                            }`}
                                          >
                                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                              isSubChecked 
                                                ? 'bg-emerald-600 border-emerald-500 text-white' 
                                                : 'border-slate-300 bg-white group-hover:border-indigo-400'
                                            }`}>
                                              {isSubChecked && <Check size={10} strokeWidth={4} />}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tight italic leading-tight ${isSubChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                              {task.title}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Quick Check-in Button */}
                                <div className="pt-2">
                                  {isCompletedToday ? (
                                    <div className="w-full py-4 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-[18px] text-[8px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 shadow-sm italic">
                                      <Check className="w-4 h-4 stroke-[3] animate-bounce" />
                                      {isRoutine ? 'Paso' : 'Hábito'} Registrado (Límite Alcanzado)
                                    </div>
                                  ) : (
                                    <button
                                      disabled={program.isTemplate || !allSubTasksChecked}
                                      onClick={() => handleToggleMilestone(milestone)}
                                      className={`w-full py-4 rounded-[18px] text-[8px] font-black uppercase tracking-[0.25em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group italic border border-white/5 ${
                                        allSubTasksChecked
                                          ? 'bg-slate-900 hover:bg-indigo-600 text-white cursor-pointer'
                                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border-none opacity-60'
                                      }`}
                                    >
                                      {allSubTasksChecked ? (
                                        <>
                                          <Check className="w-4 h-4 group-hover:scale-125 transition-transform" />
                                          Registrar Check-in Hoy
                                        </>
                                      ) : (
                                        <>
                                          <ListTodo className="w-4 h-4" />
                                          Completá los ejercicios primero
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {/* Consistency Grid */}
                                <div className="bg-slate-50/60 border border-slate-100 rounded-[20px] p-4 space-y-3">
                                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-[0.25em] block italic">Registro de Consistencia (Últimos 14 días)</span>
                                  <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 justify-items-center">
                                    {getLast14Days().map((day, idx) => {
                                      const completed = isDayCompleted(milestone, day);
                                      const isToday = new Date().toDateString() === day.toDateString();
                                      const dayLetter = format(day, 'EEEEEE', { locale: es }).toUpperCase();
                                      const dayNumber = format(day, 'd');
                                      
                                      return (
                                        <div key={idx} className="flex flex-col items-center gap-1">
                                          <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-wider">{dayLetter}</span>
                                          <button
                                            disabled={program.isTemplate}
                                            onClick={() => handleToggleMilestoneForDate(milestone, day)}
                                            title={`${format(day, "d 'de' MMMM", { locale: es })} - ${completed ? 'Completado' : 'Pendiente'}`}
                                            className={`w-6 h-6 rounded-[8px] flex items-center justify-center transition-all ${
                                              completed
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-500'
                                                : isToday
                                                  ? 'bg-white border-2 border-dashed border-indigo-500 text-indigo-600 animate-pulse hover:border-indigo-600'
                                                  : 'bg-white border border-slate-200 text-slate-300 hover:border-indigo-400 hover:text-indigo-500'
                                            }`}
                                          >
                                            {completed ? (
                                              <Check className="w-3 h-3 stroke-[3]" />
                                            ) : (
                                              <span className="text-[7px] font-bold">{dayNumber}</span>
                                            )}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Phases List */}
              {(!program.phases || program.phases.length === 0) ? (
                <div className="glass-card bg-white/50 border-2 border-dashed border-slate-200 p-10 rounded-[24px] text-center space-y-4">
                  <div className="w-14 h-14 bg-white rounded-[16px] flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-700 border border-slate-50">
                    <Layers className="w-6 h-6 text-slate-200" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic leading-none">Arquitectura en Blanco</h3>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.25em] leading-relaxed italic opacity-60">Empezá diseñando la primera fase de transformación táctica.</p>
                  </div>
                  <button
                    onClick={() => setIsPhaseModalOpen(true)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-[16px] font-black text-[8px] uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 italic"
                  >
                    Configurar Fase Alpha
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {program.phases.map((phase: any, index: number) => (
                    <div key={phase.id} className="phase-module glass-card bg-white/70 backdrop-blur-xl border border-white p-5 rounded-[20px] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 overflow-hidden relative">
                      {/* Phase Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-900 text-white rounded-[10px] flex items-center justify-center font-black text-sm italic shadow-2xl shadow-slate-200 group-hover:bg-indigo-600 transition-all duration-500">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1 group-hover:text-indigo-600 transition-colors">{phase.name}</h4>
                            <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.25em] italic opacity-60">
                              Módulos Tácticos: {phase.milestones?.length || 0} • {phase.description || 'SIN ESPECIFICACIONES'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeletePhase(phase.id)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 text-slate-300 hover:text-red-500 hover:shadow-xl rounded-xl transition-all active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Milestones in this Phase */}
                      <div className="space-y-2.5 pl-6 border-l-4 border-slate-100/50 ml-4 py-2 relative z-10">
                        {phase.milestones?.map((milestone: any) => {
                          const isHabitMode = program.type === 'HABITS' || program.type === 'ROUTINE' || milestone.frequency !== 'ONCE';
                          const isCompleted = milestone.completions && milestone.completions.length > 0;
                          const currentStreak = calculateStreak(milestone.completions || []);
                          const streakColor = currentStreak > 0 ? 'text-orange-500 bg-orange-50 border-orange-100' : 'text-slate-400 bg-slate-50 border-slate-100';

                          if (isHabitMode) {
                            return (
                              <div key={milestone.id} className="glass-card bg-white/50 border border-transparent hover:border-slate-100 hover:bg-white rounded-[24px] p-5 transition-all duration-500 group/item shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 space-y-4">
                                
                                {/* Habit Top Info */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[14px] flex items-center justify-center font-bold shadow-inner shrink-0 border border-indigo-100">
                                      <Flame className={`w-5 h-5 ${currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-indigo-400'}`} />
                                    </div>
                                    <div>
                                      <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight italic leading-none mb-1 group-hover/item:text-indigo-600 transition-colors">
                                        {milestone.title}
                                      </h5>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <div className="px-2 py-0.5 bg-indigo-50 rounded text-[7px] font-black text-indigo-500 uppercase tracking-widest italic border border-indigo-100 shadow-sm">+{milestone.xpReward} XP</div>
                                        <div className="px-2 py-0.5 bg-emerald-50 rounded text-[7px] font-black text-emerald-600 uppercase tracking-widest italic border border-emerald-100 shadow-sm">
                                          {milestone.frequency}
                                        </div>
                                        {milestone.requiredEvidence !== 'NONE' && (
                                          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded text-[7px] font-black text-amber-600 uppercase tracking-widest italic border border-amber-100 shadow-sm">
                                            <Zap className="w-2.5 h-2.5 animate-pulse" />
                                            EVIDENCIA
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[7.5px] font-black uppercase tracking-widest italic shadow-sm shrink-0 ${streakColor}`}>
                                      <Flame className="w-3.5 h-3.5 fill-current" />
                                      Racha: {currentStreak}D
                                    </div>
                                    <button
                                      onClick={() => handleDeleteMilestone(phase.id, milestone.id)}
                                      className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Habit Subtasks (Checklist) */}
                                {milestone.subTasks && milestone.subTasks.length > 0 && (
                                  <div className="bg-indigo-50/20 border border-indigo-100/30 rounded-[20px] p-4 space-y-2">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                                      <p className="text-[7.5px] font-black text-indigo-500 uppercase tracking-[0.25em] italic leading-none">Ejercicios de la Rutina ({milestone.subTasks.length})</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {milestone.subTasks.map((task: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-indigo-100/10 shadow-sm">
                                          <div className="w-4 h-4 rounded border border-indigo-200 flex items-center justify-center bg-indigo-50/50 text-[9px] text-indigo-600 font-bold shrink-0">
                                            {idx + 1}
                                          </div>
                                          <span className="text-[9.5px] font-black text-slate-700 uppercase tracking-tight italic">{task.title}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Habit Calendar Grid (Last 14 Days) */}
                                <div className="bg-slate-50/50 border border-slate-100/50 rounded-[20px] p-4">
                                  <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 italic">Registro de Consistencia (Últimos 14 días)</p>
                                  
                                  <div className="grid grid-cols-7 sm:grid-cols-14 gap-2.5 justify-items-center">
                                    {getLast14Days().map((day, idx) => {
                                      const completed = isDayCompleted(milestone, day);
                                      const isToday = new Date().toDateString() === day.toDateString();
                                      const dayLetter = format(day, 'EEEEEE', { locale: es }).toUpperCase();
                                      const dayNumber = format(day, 'd');
                                      
                                      return (
                                        <div key={idx} className="flex flex-col items-center gap-1.5">
                                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider">{dayLetter}</span>
                                          
                                          <button
                                            disabled={program.isTemplate}
                                            onClick={() => handleToggleMilestoneForDate(milestone, day)}
                                            title={`${format(day, "d 'de' MMMM", { locale: es })} - ${completed ? 'Completado' : 'Pendiente'}`}
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                              completed
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-105 hover:bg-emerald-500'
                                                : isToday
                                                  ? 'bg-white border-2 border-dashed border-indigo-500 text-indigo-600 animate-pulse hover:border-indigo-600'
                                                  : 'bg-white border border-slate-200 text-slate-300 hover:border-indigo-400 hover:text-indigo-500'
                                            }`}
                                          >
                                            {completed ? (
                                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                                            ) : (
                                              <span className="text-[8px] font-bold">{dayNumber}</span>
                                            )}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                              </div>
                            );
                          }

                          return (
                            <div key={milestone.id} className="flex items-center justify-between p-3 bg-white/50 hover:bg-white border border-transparent hover:border-slate-100 rounded-[16px] transition-all group/item shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
                              <div className="flex items-center gap-3">
                                <button
                                  disabled={program.isTemplate}
                                  onClick={() => handleToggleMilestone(milestone)}
                                  className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all shadow-inner border-2 ${isCompleted
                                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-200 scale-110'
                                      : 'bg-white border-slate-100 text-slate-300 hover:border-indigo-500 hover:text-indigo-600'
                                    }`}
                                >
                                  {isCompleted ? <Check className="w-4 h-4" /> : (
                                    milestone.requiredEvidence !== 'NONE' ? <Camera className="w-4 h-4" /> : <FileText className="w-4 h-4" />
                                  )}
                                </button>
                                <div>
                                  <div className={`text-xs font-black uppercase tracking-tight transition-all italic ${isCompleted ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
                                    {milestone.title}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <div className="px-2 py-0.5 bg-indigo-50 rounded text-[7px] font-black text-indigo-500 uppercase tracking-widest italic border border-indigo-100 shadow-sm">+{milestone.xpReward} XP</div>
                                    {milestone.frequency !== 'ONCE' && (
                                      <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded text-[7px] font-black text-emerald-600 uppercase tracking-widest italic border border-emerald-100 shadow-sm">
                                        <Clock className="w-2.5 h-2.5" />
                                        {milestone.frequency}
                                      </div>
                                    )}
                                    {milestone.requiredEvidence !== 'NONE' && (
                                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded text-[7px] font-black text-amber-600 uppercase tracking-widest italic border border-amber-100 shadow-sm">
                                        <Zap className="w-2.5 h-2.5 animate-pulse" />
                                        EVIDENCIA
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteMilestone(phase.id, milestone.id)}
                                className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-red-500 transition-all active:scale-90"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}

                        <button
                          onClick={() => {
                            setSelectedPhaseId(phase.id);
                            setIsMilestoneModalOpen(true);
                          }}
                          className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all font-black text-[8.5px] uppercase tracking-[0.25em] mt-4 group/add italic"
                        >
                          <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center group-hover/add:bg-indigo-600 group-hover/add:text-white transition-all shadow-sm">
                            <Plus className="w-4 h-4" />
                          </div>
                          Expandir Protocolo de {phase.name}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
               )}
            </>
          )}
        </div>

        {/* Right Column: Tips & Sidebar info */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card bg-slate-900 p-5 rounded-[20px] text-white relative overflow-hidden shadow-2xl shadow-slate-300 group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
               <Zap className="w-20 h-20 text-indigo-400" />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-[10px] flex items-center justify-center mb-5 border border-white/10 group-hover:scale-110 transition-all duration-500">
                {(program.type === 'HABITS' || program.type === 'ROUTINE') ? (
                  <Flame className="w-5 h-5 text-orange-400" />
                ) : (
                  <Edit3 className="w-5 h-5 text-indigo-400" />
                )}
              </div>
              <h3 className="text-base font-black uppercase tracking-tighter italic leading-none mb-3">
                {(program.type === 'HABITS' || program.type === 'ROUTINE') ? (isRoutine ? 'Diseño de Rutinas' : 'Diseño de Hábitos') : 'Diseño Curricular'}
              </h3>
              <p className="text-slate-400 text-[8px] leading-relaxed font-black uppercase tracking-widest mb-5 italic opacity-80">
                {(program.type === 'HABITS' || program.type === 'ROUTINE') ? (
                  <>
                    Diseñá protocolos de consistencia simples con metas de <span className="text-white">5 a 15 XP</span>. Un {isRoutine ? 'paso' : 'hábito'} diario claro y bien delimitado estimula el streak de tus mentoreados.
                  </>
                ) : (
                  <>
                    Estructurá tu programa en fases de <span className="text-white">4 a 6 hitos</span>. Mantener etapas cortas y claras mejora la tasa de finalización táctica de tus activos.
                  </>
                )}
              </p>
              <div className="p-3 bg-white/5 rounded-[16px] border border-white/10 text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                {(program.type === 'HABITS' || program.type === 'ROUTINE') ? 'Rachas Boosters: Activo' : 'Motor XP: Activo'}
              </div>
            </div>
          </div>

          <div className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[20px] border border-white shadow-soft">
            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em] mb-5 italic border-b border-slate-100 pb-3">
              {(program.type === 'HABITS' || program.type === 'ROUTINE') ? (isRoutine ? 'Protocolos de Rutinas' : 'Protocolos de Consistencia') : 'Protocolos de Despliegue'}
            </h3>
            <div className="space-y-4">
              {((program.type === 'HABITS' || program.type === 'ROUTINE') ? (
                [
                  { step: '01', title: 'Diseño Táctico', desc: 'Definí metas de consistencia claras y rápidas.' },
                  { step: '02', title: 'Rachas Activas', desc: 'Mantené el streak dando el check cada día.' },
                  { step: '03', title: 'Gamificación', desc: 'Suma XP y sube de nivel de forma interactiva.' }
                ]
              ) : (
                [
                  { step: '01', title: 'Arquitectura Base', desc: 'Define las fases principales de transformación táctica.' },
                  { step: '02', title: 'Incentivos Tácticos', desc: 'Asigna XP para motivar el progreso de tus activos.' },
                  { step: '03', title: 'Sincronización', desc: 'Publica los cambios para la visualización del mentee.' }
                ]
              )).map((item, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-7 h-7 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0 text-[8px] font-black text-indigo-600 shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 italic">
                    {item.step}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight italic">{item.title}</p>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-relaxed italic opacity-60">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
