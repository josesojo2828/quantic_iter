'use client';

import React, { useState, useEffect } from 'react';
import {
   Check,
   Zap,
   Clock,
   Camera,
   Trophy,
   Sparkles,
   ListTodo,
   Video,
   FileText,
   AlertCircle
} from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import { useAuth } from '@/core/contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { EvidenceModal } from '../programs/[id]/components/EvidenceModal';

export default function DailyDashboardPage() {
   const { user } = useAuth();
   const [programs, setPrograms] = useState<any[]>([]);
   const [habits, setHabits] = useState<any[]>([]);
   const [tasks, setTasks] = useState<any[]>([]);
   const [sessions, setSessions] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   // Checklist of subtasks (local state for habits)
   const [checkedSubTasks, setCheckedSubTasks] = useState<Record<string, string[]>>({});

   // Modals / Toggling states
   const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
   const [evidenceTarget, setEvidenceTarget] = useState<any>(null);
   const [togglingMilestoneId, setTogglingMilestoneId] = useState<string | null>(null);
   const [checkingHabitId, setCheckingHabitId] = useState<string | null>(null);

   const getStartOfWeekUTC = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(d.setDate(diff));
      start.setHours(0, 0, 0, 0);
      return start;
   };

   const fetchDailyData = async () => {
      if (!user?.id) return;
      try {
         setLoading(true);
         const [programsData, habitsData, tasksData, sessionsData] = await Promise.all([
            apiClient.get<any[]>('/mentor/programs').catch(() => []),
            apiClient.get<any[]>('/mentor/habits').catch(() => []),
            apiClient.get<any[]>(`/mentor/tasks/mentee/${user.id}`).catch(() =>
               apiClient.get<any[]>('/mentor/tasks').catch(() => [])
            ),
            apiClient.get<any[]>(`/mentor/sessions/mentee/${user.id}`).catch(() => [])
         ]);

         setPrograms(programsData.filter(p => !p.isTemplate));
         setHabits(habitsData);
         setTasks(tasksData);
         setSessions(sessionsData);
      } catch (error) {
         toast.error('Error al cargar la rutina diaria');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchDailyData();
   }, [user?.id]);

   const today = new Date();
   const dayIndex = today.getDay(); // 0 (Dom) - 6 (Sab)
   const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // 0 (Lun) - 6 (Dom)
   const crmMenteeId = programs.find(p => p.menteeId)?.menteeId || user?.id || '';

   // Milestone completion helper
   const checkMilestoneCompleted = (milestone: any, menteeId: string) => {
      if (!milestone || !milestone.completions) return false;

      if (milestone.frequency === 'DAILY') {
         const todayStr = new Date().toDateString();
         return milestone.completions.some((c: any) =>
            c.menteeId === menteeId && new Date(c.date).toDateString() === todayStr
         );
      }

      if (milestone.frequency === 'WEEKLY') {
         const currentWeekStart = getStartOfWeekUTC(new Date());
         return milestone.completions.some((c: any) => {
            if (c.menteeId !== menteeId) return false;
            const cWeekStart = getStartOfWeekUTC(new Date(c.date));
            return cWeekStart.getTime() === currentWeekStart.getTime();
         });
      }

      return milestone.completions.some((c: any) => c.menteeId === menteeId);
   };

   // 1. Filter Program Milestones (Pasos) that apply today
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

   // 2. Filter Today's Habits
   const todayHabits = habits.filter(habit => {
      if (habit.frequency === 'DAILY' || !habit.frequency) {
         return true;
      }
      if (habit.frequency === 'WEEKLY') {
         if (habit.daysOfWeek && habit.daysOfWeek.length > 0) {
            return habit.daysOfWeek.includes(adjustedIndex);
         }
         const hasCheckinThisWeek = habit.checkins?.some((c: any) => {
            const checkinDate = c.date || c.createdAt;
            if (!checkinDate) return false;
            const d = new Date(checkinDate);
            const todayWeekStart = getStartOfWeekUTC(new Date());
            const checkinWeekStart = getStartOfWeekUTC(d);
            return todayWeekStart.getTime() === checkinWeekStart.getTime();
         });
         return !hasCheckinThisWeek;
      }
      return true;
   });

   // 3. Filter Today's/Pending Tasks
   const todayTasks = tasks.filter((task: any) => {
      if (task.status !== 'COMPLETED' && task.status !== 'APPROVED') return true;
      if (task.updatedAt) {
         return new Date(task.updatedAt).toDateString() === today.toDateString();
      }
      return false;
   });

   // 4. Filter Today's Sessions
   const todaySessions = sessions.filter((session: any) => {
      if (!session.date) return false;
      return new Date(session.date).toDateString() === today.toDateString();
   });

   // Unified metrics
   const completedTasksCount = dailyTasks.filter(t => checkMilestoneCompleted(t, crmMenteeId)).length;
   const completedHabitsCount = todayHabits.filter(h => h.checkedToday).length;
   const completedAssignedTasksCount = todayTasks.filter(t => t.status === 'SUBMITTED' || t.status === 'COMPLETED' || t.status === 'APPROVED').length;

   const totalItemsCount = dailyTasks.length + todayHabits.length + todayTasks.length;
   const completedItemsCount = completedTasksCount + completedHabitsCount + completedAssignedTasksCount;

   const dailyProgress = totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

   // Interaction Handlers
   const handleToggleMilestone = async (programId: string, milestoneId: string) => {
      if (togglingMilestoneId) return;

      const milestone = dailyTasks.find(t => t.id === milestoneId);
      if (milestone && milestone.daysOfWeek && milestone.daysOfWeek.length > 0) {
         const todayIndex = new Date().getDay();
         const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
         if (!milestone.daysOfWeek.includes(adjustedTodayIndex)) {
            const daysMap = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            const allowedDaysStr = milestone.daysOfWeek.map((d: number) => daysMap[d]).join(', ');
            toast.error(`Este paso solo se puede completar los días: ${allowedDaysStr}`);
            return;
         }
      }

      setTogglingMilestoneId(milestoneId);
      try {
         const localTodayStr = new Date().toLocaleDateString('en-CA');
         const apiDateStr = `${localTodayStr}T12:00:00.000Z`;

         await apiClient.post(`/mentor/programs/${programId}/milestones/${milestoneId}/toggle`, {
            date: apiDateStr
         });

         toast.success('¡Registro actualizado!');
         fetchDailyData();
      } catch (error) {
         toast.error('Error al actualizar el registro');
      } finally {
         setTogglingMilestoneId(null);
      }
   };

   const handleToggleMilestoneClick = (task: any) => {
      const isCompleted = checkMilestoneCompleted(task, crmMenteeId);

      if (task.requiredEvidence !== 'NONE' && !isCompleted) {
         setEvidenceTarget(task);
         setIsEvidenceModalOpen(true);
         return;
      }

      handleToggleMilestone(task.programId, task.id);
   };

   const handleEvidenceSubmit = async (evidence: string) => {
      if (!evidenceTarget) return;
      setIsEvidenceModalOpen(false);

      try {
         const localTodayStr = new Date().toLocaleDateString('en-CA');
         const apiDateStr = `${localTodayStr}T12:00:00.000Z`;
         await apiClient.post(`/mentor/programs/${evidenceTarget.programId}/milestones/${evidenceTarget.id}/toggle`, {
            date: apiDateStr,
            evidence
         });
         toast.success('¡Registro con evidencia completado!');
         fetchDailyData();
      } catch (error) {
         toast.error('Error al subir evidencia');
      }
   };

   const toggleProgramSubTask = async (programId: string, milestoneId: string, title: string) => {
      const milestone = dailyTasks.find(t => t.id === milestoneId);
      if (milestone && milestone.daysOfWeek && milestone.daysOfWeek.length > 0) {
         const todayIndex = new Date().getDay();
         const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
         if (!milestone.daysOfWeek.includes(adjustedTodayIndex)) {
            const daysMap = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            const allowedDaysStr = milestone.daysOfWeek.map((d: number) => daysMap[d]).join(', ');
            toast.error(`Los ejercicios de este paso solo se pueden modificar los días: ${allowedDaysStr}`);
            return;
         }
      }

      if (!milestone) return;
      const subTask = (milestone.subTasks || []).find((st: any) => st.title === title);
      if (!subTask) return;
      const isCompleted = subTask.isCompleted || false;

      try {
         await apiClient.post(`/mentor/programs/${programId}/milestones/${milestoneId}/subtasks/toggle`, {
            title,
            isCompleted: !isCompleted,
         });
         toast.success('Ejercicio actualizado');
         fetchDailyData();
      } catch (error) {
         toast.error('Error al actualizar el ejercicio');
      }
   };

   const handleHabitCheckin = async (habitId: string) => {
      setCheckingHabitId(habitId);
      try {
         await apiClient.post(`/mentor/habits/${habitId}/checkin`, { date: new Date().toISOString() });
         toast.success('Hábito registrado');
         fetchDailyData();
      } catch (error) {
         toast.error('Error al registrar hábito');
      } finally {
         setCheckingHabitId(null);
      }
   };

   const toggleHabitSubTask = (habitId: string, title: string) => {
      const current = checkedSubTasks[habitId] || [];
      const index = current.indexOf(title);
      const updated = [...current];
      if (index > -1) {
         updated.splice(index, 1);
      } else {
         updated.push(title);
      }
      setCheckedSubTasks({
         ...checkedSubTasks,
         [habitId]: updated,
      });
   };

   const handleTaskClick = async (task: any) => {
      if (task.status === 'SUBMITTED' || task.status === 'APPROVED' || task.status === 'COMPLETED') {
         toast.success('Esta tarea ya fue entregada');
         return;
      }

      const notes = prompt('Escribe una nota o comentario sobre tu entrega (opcional):');
      if (notes === null) return;

      try {
         await apiClient.put(`/mentor/tasks/${task.id}/status`, {
            status: 'SUBMITTED',
            evidenceNotes: notes || 'Entregado desde el Diario'
         });
         toast.success('¡Tarea entregada con éxito!');
         fetchDailyData();
      } catch (error) {
         toast.error('Error al entregar la tarea');
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center h-screen bg-slate-50/50">
            <div className="relative">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7B91EB]"></div>
               <Zap className="w-4 h-4 text-[#7B91EB] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
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
            onSubmit={handleEvidenceSubmit}
         />

         {/* Header Section */}
         <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div>
               <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-1.5 h-1.5 bg-[#7B91EB] rounded-full animate-pulse" />
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Bitácora Diaria</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
                  Tu Diario <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#7B91EB] to-indigo-600">Personal</span>
               </h1>
               <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.25em] opacity-60 italic leading-relaxed">
                  Pasos, hábitos, tareas y mentorías unificadas para hoy. Mantén el foco y suma XP en cada paso.
               </p>
            </div>

            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-3.5 rounded-[18px] border border-white shadow-soft">
               <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">Racha de Hoy</p>
                  <p className="text-lg font-black text-slate-900 uppercase italic">15 Días 🔥</p>
               </div>
               <div className="w-px h-6 bg-slate-200" />
               <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                     <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                        {i}
                     </div>
                  ))}
               </div>
            </div>
         </header>

         {/* KPI Stats & Unified Progress */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="md:col-span-1 glass-card bg-white/70 backdrop-blur-xl p-4.5 rounded-[20px] border border-white shadow-soft flex items-center gap-4 group hover:scale-[1.02] transition-transform duration-500">
               <div className="relative w-11 h-11 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90">
                     <circle cx="22" cy="22" r="18" fill="none" stroke="#F1F5F9" strokeWidth="4.5" />
                     <circle cx="22" cy="22" r="18" fill="none" stroke="#7B91EB" strokeWidth="4.5" strokeDasharray={113} strokeDashoffset={113 - (113 * dailyProgress) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-slate-900 italic">{dailyProgress}%</div>
               </div>
               <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">Progreso Diario</p>
                  <p className="text-lg font-black text-slate-900 uppercase italic">{completedItemsCount} / {totalItemsCount}</p>
               </div>
            </div>

            {[
               { label: 'Pasos Activos', value: `${completedTasksCount} / ${dailyTasks.length}`, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'Programas' },
               { label: 'Hábitos Diario', value: `${completedHabitsCount} / ${todayHabits.length}`, icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Consistencia' },
               { label: 'Tareas Pendientes', value: `${completedAssignedTasksCount} / ${todayTasks.length}`, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Entregables' },
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

         {/* Main Content Area */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT COLUMN: Routine, Habits, Tasks */}
            <div className="lg:col-span-8 space-y-6">

               {/* 1. Pasos / Program Milestones */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                     <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        <div className="w-1.5 h-3 bg-[#7B91EB] rounded-full" />
                        Pasos del Día
                     </h3>
                     <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest italic">{dailyTasks.length} programados</span>
                  </div>

                  {dailyTasks.length === 0 ? (
                     <div className="glass-card bg-white/70 backdrop-blur-xl p-8 rounded-[24px] border border-white shadow-soft text-center">
                        <ListTodo className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-xs font-black text-slate-600 uppercase italic">Sin pasos programados para hoy</h4>
                        <p className="text-[8px] text-slate-400 uppercase mt-1">
                           No tenés rutinas ni ejercicios asignados para este día de la semana.
                        </p>
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dailyTasks.map((milestone) => {
                           const isCompleted = checkMilestoneCompleted(milestone, crmMenteeId);
                           const isToggling = togglingMilestoneId === milestone.id;

                           const hasSubTasks = milestone.subTasks && milestone.subTasks.length > 0;
                           const completedSubTasks = hasSubTasks ? milestone.subTasks.filter((st: any) => st.isCompleted) : [];
                           const allSubTasksChecked = hasSubTasks ? milestone.subTasks.every((st: any) => st.isCompleted) : true;

                           const todayIndex = new Date().getDay();
                           const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
                           const isDayAllowed = !milestone.daysOfWeek || milestone.daysOfWeek.length === 0 || milestone.daysOfWeek.includes(adjustedTodayIndex);

                           return (
                              <div key={milestone.id} className="bg-white border border-[#EAF0F6] rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 relative overflow-hidden flex flex-col justify-between">
                                 <div>
                                    <div className="flex justify-between items-start gap-4">
                                       <div className="space-y-1">
                                          <span className="text-[7px] font-black text-[#7B91EB] uppercase tracking-widest block italic leading-none">{milestone.programName}</span>
                                          <h4 className="text-[10px] font-black text-[#2C3A50] uppercase tracking-tight italic leading-tight mt-1">
                                             {milestone.title}
                                          </h4>
                                          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                             {milestone.xpReward && (
                                                <div className="px-1.5 py-0.5 bg-amber-50 rounded text-[6.5px] font-black text-amber-500 uppercase tracking-widest italic border border-amber-100 shadow-sm">+{milestone.xpReward} XP</div>
                                             )}
                                             <div className="px-1.5 py-0.5 bg-indigo-50 rounded text-[6.5px] font-black text-[#7B91EB] uppercase tracking-widest italic border border-indigo-50 shadow-sm">
                                                {milestone.frequency === 'DAILY' ? 'DIARIO' : milestone.frequency === 'WEEKLY' ? 'SEMANAL' : 'ÚNICO'}
                                             </div>
                                             {milestone.daysOfWeek && milestone.daysOfWeek.length > 0 && (
                                                <div className={`px-1.5 py-0.5 rounded text-[6.5px] font-black uppercase tracking-widest italic border shadow-sm ${isDayAllowed ? 'bg-emerald-50 text-[#2CD79A] border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                                   }`}>
                                                   Días: {milestone.daysOfWeek.map((d: number) => ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][d]).join(', ')}
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    </div>

                                    {/* Checklist of subtasks */}
                                    {hasSubTasks && (
                                       <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-xl p-2.5 mt-3">
                                          <div className="flex items-center gap-1 mb-0.5">
                                             <ListTodo className="w-3 h-3 text-[#7B91EB]" />
                                             <span className="text-[7px] font-black text-[#7B91EB] uppercase tracking-widest italic leading-none">
                                                Ejercicios ({isCompleted ? milestone.subTasks.length : completedSubTasks.length}/{milestone.subTasks.length})
                                             </span>
                                          </div>

                                          <div className="grid grid-cols-1 gap-1">
                                             {milestone.subTasks.map((task: any, idx: number) => {
                                                const isSubChecked = isCompleted || task.isCompleted;
                                                const isBtnDisabled = isCompleted || !isDayAllowed;

                                                return (
                                                   <button
                                                      key={idx}
                                                      disabled={isBtnDisabled}
                                                      type="button"
                                                      onClick={() => toggleProgramSubTask(milestone.programId, milestone.id, task.title)}
                                                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all duration-300 active:scale-[0.98] ${isSubChecked
                                                            ? 'bg-emerald-50/30 border-emerald-100/50 text-emerald-800'
                                                            : !isDayAllowed
                                                               ? 'bg-rose-50/20 border-rose-100/30 text-rose-400 cursor-not-allowed opacity-60'
                                                               : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                                         }`}
                                                   >
                                                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${isSubChecked
                                                            ? 'bg-emerald-600 border-emerald-500 text-white'
                                                            : !isDayAllowed
                                                               ? 'border-rose-200 bg-white'
                                                               : 'border-slate-300 bg-white'
                                                         }`}>
                                                         {isSubChecked && <Check size={8} strokeWidth={4} />}
                                                      </div>
                                                      <span className={`text-[9px] font-black uppercase tracking-tight italic leading-tight ${isSubChecked
                                                            ? 'line-through text-slate-400'
                                                            : !isDayAllowed
                                                               ? 'text-rose-300'
                                                               : 'text-slate-700'
                                                         }`}>
                                                         {task.title}
                                                      </span>
                                                   </button>
                                                );
                                             })}
                                          </div>
                                       </div>
                                    )}
                                 </div>

                                 {/* Check-in Button */}
                                 <div className="pt-3 border-t border-slate-50 mt-4">
                                    {isCompleted ? (
                                       <div className="w-full py-2 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-xl text-[7.5px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm italic">
                                          <Check className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
                                          Completado Hoy
                                       </div>
                                    ) : (
                                       <button
                                          disabled={isToggling || !allSubTasksChecked || !isDayAllowed}
                                          onClick={() => handleToggleMilestoneClick(milestone)}
                                          className={`w-full py-2 rounded-xl text-[7.5px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5 group italic ${!isDayAllowed
                                                ? 'bg-rose-50 text-rose-400 border border-rose-100 cursor-not-allowed opacity-80'
                                                : allSubTasksChecked
                                                   ? 'bg-slate-900 hover:bg-[#7B91EB] text-white cursor-pointer shadow-md'
                                                   : 'bg-slate-100 text-slate-400 cursor-not-allowed border-none opacity-60'
                                             }`}
                                       >
                                          {isToggling ? (
                                             <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                          ) : !isDayAllowed ? (
                                             <>
                                                <Clock className="w-3.5 h-3.5" />
                                                Bloqueado hoy
                                             </>
                                          ) : allSubTasksChecked ? (
                                             <>
                                                {milestone.requiredEvidence !== 'NONE' ? (
                                                   <Camera className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                                                ) : (
                                                   <Check className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                                                )}
                                                Registrar Hito
                                             </>
                                          ) : (
                                             <>
                                                <ListTodo className="w-3.5 h-3.5" />
                                                Completá ejercicios primero
                                             </>
                                          )}
                                       </button>
                                    )}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>

               {/* 2. Hábitos Diarios */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                     <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        <div className="w-1.5 h-3 bg-amber-500 rounded-full" />
                        Hábitos del Día
                     </h3>
                     <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest italic">{todayHabits.length} activos</span>
                  </div>

                  {todayHabits.length === 0 ? (
                     <div className="glass-card bg-white/70 backdrop-blur-xl p-8 rounded-[24px] border border-white shadow-soft text-center">
                        <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-xs font-black text-slate-600 uppercase italic">Sin hábitos programados</h4>
                        <p className="text-[8px] text-slate-400 uppercase mt-1">
                           No tenés hábitos generales programados para hoy.
                        </p>
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {todayHabits.map((habit) => {
                           const isChecked = habit.checkedToday;
                           const isChecking = checkingHabitId === habit.id;
                           const hasSubTasks = habit.subTasks && habit.subTasks.length > 0;
                           const completedSubTasks = checkedSubTasks[habit.id] || [];
                           const allSubTasksChecked = hasSubTasks ? habit.subTasks.every((st: any) => completedSubTasks.includes(st.title)) : true;

                           return (
                              <div key={habit.id} className={`flex flex-col justify-between p-5 rounded-[24px] border transition-all duration-300 text-left relative overflow-hidden bg-white border-[#EAF0F6] shadow-sm hover:shadow-md`}>
                                 <div>
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                       <div className="space-y-0.5">
                                          <h4 className={`text-[10px] font-black uppercase tracking-tight italic block ${isChecked ? 'line-through text-slate-400' : 'text-[#2C3A50]'
                                             }`}>
                                             {habit.name}
                                          </h4>
                                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block leading-tight">
                                             {habit.description || 'Hábito diario'}
                                          </span>
                                       </div>

                                       <button
                                          disabled={isChecking || !allSubTasksChecked || isChecked}
                                          onClick={() => handleHabitCheckin(habit.id)}
                                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isChecked
                                                ? 'bg-emerald-600 text-white shadow-md'
                                                : !allSubTasksChecked
                                                   ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                   : 'bg-[#F0F3FF] text-[#7B91EB] hover:bg-[#7B91EB] hover:text-white active:scale-95'
                                             }`}
                                       >
                                          {isChecking ? (
                                             <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                             <Check size={12} strokeWidth={3} />
                                          )}
                                       </button>
                                    </div>

                                    {/* Checklist of subtasks */}
                                    {hasSubTasks && (
                                       <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-xl p-2.5 mt-2">
                                          <div className="flex items-center gap-1 mb-0.5">
                                             <ListTodo className="w-3 h-3 text-[#7B91EB]" />
                                             <span className="text-[7px] font-black text-[#7B91EB] uppercase tracking-widest italic leading-none">
                                                Tareas ({isChecked ? habit.subTasks.length : completedSubTasks.length}/{habit.subTasks.length})
                                             </span>
                                          </div>

                                          <div className="grid grid-cols-1 gap-1">
                                             {habit.subTasks.map((task: any, idx: number) => {
                                                const isSubChecked = isChecked || completedSubTasks.includes(task.title);

                                                return (
                                                   <button
                                                      key={idx}
                                                      disabled={isChecked}
                                                      type="button"
                                                      onClick={() => toggleHabitSubTask(habit.id, task.title)}
                                                      className={`w-full flex items-center gap-2 px-2 px-1.5 py-1 rounded-lg border text-left transition-all duration-300 ${isSubChecked
                                                            ? 'bg-emerald-50/30 border-emerald-100/50 text-emerald-800'
                                                            : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                                                         }`}
                                                   >
                                                      <div className={`w-3 h-3 rounded border flex items-center justify-center transition-all ${isSubChecked
                                                            ? 'bg-emerald-600 border-emerald-500 text-white'
                                                            : 'border-slate-300 bg-white'
                                                         }`}>
                                                         {isSubChecked && <Check size={8} strokeWidth={4} />}
                                                      </div>
                                                      <span className={`text-[8.5px] font-black uppercase tracking-tight italic leading-tight ${isSubChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                                         {task.title}
                                                      </span>
                                                   </button>
                                                );
                                             })}
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>

               {/* 3. Tareas Asignadas (Entregables) */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                     <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        <div className="w-1.5 h-3 bg-blue-500 rounded-full" />
                        Tareas Entregables
                     </h3>
                     <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest italic">{todayTasks.length} activas</span>
                  </div>

                  {todayTasks.length === 0 ? (
                     <div className="glass-card bg-white/70 backdrop-blur-xl p-8 rounded-[24px] border border-white shadow-soft text-center">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-xs font-black text-slate-600 uppercase italic">Sin tareas pendientes</h4>
                        <p className="text-[8px] text-slate-400 uppercase mt-1">
                           ¡Buen trabajo! No tenés tareas ni entregas agendadas para hoy.
                        </p>
                     </div>
                  ) : (
                     <div className="space-y-3">
                        {todayTasks.map((task) => {
                           const isCompleted = task.status === 'SUBMITTED' || task.status === 'COMPLETED' || task.status === 'APPROVED';

                           return (
                              <div key={task.id} className={`glass-card p-4 rounded-[20px] border transition-all duration-300 flex items-center justify-between bg-white border-[#EAF0F6] shadow-sm hover:shadow-md`}>
                                 <div className="flex items-center gap-4">
                                    <button
                                       onClick={() => handleTaskClick(task)}
                                       className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isCompleted
                                             ? 'bg-emerald-600 text-white shadow-md'
                                             : 'bg-[#F0F3FF] text-[#7B91EB] hover:bg-[#7B91EB] hover:text-white active:scale-95'
                                          }`}
                                    >
                                       {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Camera className="w-4 h-4" />}
                                    </button>
                                    <div>
                                       <span className="text-[7.5px] font-black text-indigo-500 uppercase tracking-widest block mb-0.5 italic">Entregable</span>
                                       <h4 className={`text-[10px] font-black uppercase tracking-tight transition-all italic ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                          {task.title}
                                       </h4>
                                       <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed mt-0.5">
                                          {task.description || 'Entrega especial solicitada por tu mentor'}
                                       </p>
                                    </div>
                                 </div>

                                 <div className="flex flex-col items-end gap-2">
                                    <div className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border border-indigo-100 italic">
                                       +{task.xpReward || 50} XP
                                    </div>
                                    {isCompleted && (
                                       <div className="text-[7px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 italic">
                                          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                          {task.status === 'APPROVED' ? 'Aprobada' : 'Entregada'}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>

            </div>

            {/* RIGHT COLUMN: Sessions & Stats */}
            <div className="lg:col-span-4 space-y-6">

               {/* 1. Sesiones de hoy */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                     <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                        <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                        Sesiones de Mentoría
                     </h3>
                     <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest italic">{todaySessions.length} agendadas</span>
                  </div>

                  {todaySessions.length === 0 ? (
                     <div className="glass-card bg-white/70 backdrop-blur-xl p-6 rounded-[24px] border border-white shadow-soft text-center">
                        <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-xs font-black text-slate-600 uppercase italic">Sin videollamadas</h4>
                        <p className="text-[8px] text-slate-400 uppercase mt-1">
                           No tenés sesiones virtuales agendadas para hoy.
                        </p>
                     </div>
                  ) : (
                     <div className="space-y-3">
                        {todaySessions.map((session) => (
                           <div key={session.id} className="bg-white border border-[#EAF0F6] rounded-[20px] p-4 shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
                              <div className="flex items-center justify-between">
                                 <span className="text-[8px] font-black text-[#7B91EB] uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 italic">
                                    En Vivo 🚀
                                 </span>
                                 <span className="text-[8.5px] font-bold text-slate-400 uppercase">
                                    {session.startTime || 'Hora pautada'}
                                 </span>
                              </div>
                              <h4 className="text-[10px] font-black text-[#2C3A50] uppercase tracking-tight italic leading-tight">
                                 {session.name || 'Sesión de Alineación'}
                              </h4>
                              {session.meetingLink ? (
                                 <a
                                    href={session.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2 bg-slate-900 hover:bg-[#7B91EB] text-white rounded-xl font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all italic shadow-sm"
                                 >
                                    <Video className="w-3 h-3" />
                                    Unirse a Videollamada
                                 </a>
                              ) : (
                                 <div className="w-full py-2 bg-slate-50 text-slate-400 rounded-xl font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1 border border-slate-100 italic">
                                    <AlertCircle className="w-3 h-3" />
                                    Enlace pendiente
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* 2. Desafío del Día */}
               <div className="bg-slate-900 p-5 rounded-[24px] text-white overflow-hidden relative group shadow-2xl shadow-slate-200">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                  <Trophy className="w-7 h-7 text-indigo-400 mb-4" />
                  <h3 className="text-lg font-black uppercase tracking-tight mb-1 italic">Desafío del Día</h3>
                  <p className="text-white/60 text-[8.5px] font-black leading-relaxed uppercase tracking-wider mb-4">Completá todos tus hábitos de hoy para obtener un multiplicador de XP x1.5</p>
                  <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[8px] uppercase tracking-[0.2em] hover:bg-indigo-400 hover:text-white transition-all active:scale-95 italic">
                     Ver Recompensas
                  </button>
               </div>

               {/* 3. Rendimiento Semanal */}
               <div className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-soft">
                  <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 italic">
                     <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                     Rendimiento Semanal
                  </h3>
                  <div className="flex justify-between items-end gap-1 h-20">
                     {[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
                        <div key={i} className="flex-1 space-y-1.5 flex flex-col items-center group/bar">
                           <div
                              className={`w-full rounded-md transition-all duration-700 ${i === adjustedIndex ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-100 group-hover/bar:bg-indigo-200'}`}
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
