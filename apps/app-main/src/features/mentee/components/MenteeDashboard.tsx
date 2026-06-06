'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/core/contexts/AuthContext';
import { apiClient } from '@/core/api/api.client';
import {
  Zap,
  Flame,
  Clock,
  Calendar,
  Check,
  Award,
  ExternalLink,
  Sparkles,
  Send,
  Lock,
  Users,
  User,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
  Target,
  ListTodo,
  Video,
  AlertCircle,
  Camera,
  Trophy,
  ChevronRight,
  FileText,
  Plus
} from 'lucide-react';
import { format, isSameWeek } from 'date-fns';
import { toast } from 'react-hot-toast';
import { es } from 'date-fns/locale';
import { EvidenceModal } from '@/app/dashboard/programs/[id]/components/EvidenceModal';

interface MenteeDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCoach: { id: string; name: string; specialty: string; avatarUrl?: string; bio?: string; color?: string; bgLight?: string } | null;
  setSelectedCoach: (coach: { id: string; name: string; specialty: string; avatarUrl?: string; bio?: string; color?: string; bgLight?: string } | null) => void;
}

export const MenteeDashboard: React.FC<MenteeDashboardProps> = ({
  activeTab,
  setActiveTab,
  selectedCoach,
  setSelectedCoach,
}) => {
  const { user } = useAuth();
  
  // API Data States
  const [habits, setHabits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantCoach, setTenantCoach] = useState<any | null>(null);

  // UI Interactive States
  const [panelSubTab, setPanelSubTab] = useState<'today' | 'programs'>('today');
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [togglingMilestoneId, setTogglingMilestoneId] = useState<string | null>(null);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [checkingHabitId, setCheckingHabitId] = useState<string | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceTarget, setEvidenceTarget] = useState<any>(null);

  // Subtasks checklist local state
  const [checkedSubTasks, setCheckedSubTasks] = useState<Record<string, string[]>>({});

  const toggleSubTask = async (programId: string | null, milestoneId: string, title: string, index?: number) => {
    if (programId && programId !== milestoneId) {
      let milestoneObj: any = null;
      for (const prog of programs) {
        if (prog.id === programId) {
          for (const phase of (prog.phases || [])) {
            const found = (phase.milestones || []).find((m: any) => m.id === milestoneId);
            if (found) {
              milestoneObj = found;
              break;
            }
          }
        }
        if (milestoneObj) break;
      }

      if (milestoneObj && milestoneObj.daysOfWeek && milestoneObj.daysOfWeek.length > 0) {
        const todayIndex = new Date().getDay(); // 0 (Dom) - 6 (Sab)
        const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1; // 0 (Lun) - 6 (Dom)
        if (!milestoneObj.daysOfWeek.includes(adjustedTodayIndex)) {
          const daysMap = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
          const allowedDaysStr = milestoneObj.daysOfWeek.map((d: number) => daysMap[d]).join(', ');
          toast.error(`Los ejercicios de este paso solo se pueden modificar los días: ${allowedDaysStr}`);
          return;
        }
      }
    }

    if (!programId || programId === milestoneId) {
      const current = checkedSubTasks[milestoneId] || [];
      const key = index !== undefined ? `${title}-${index}` : title;
      const keyIndex = current.indexOf(key);
      const updated = [...current];
      if (keyIndex > -1) {
        updated.splice(keyIndex, 1);
      } else {
        updated.push(key);
      }
      setCheckedSubTasks({
        ...checkedSubTasks,
        [milestoneId]: updated,
      });
      return;
    }

    let isCurrentlyCompleted = false;

    // 1. Optimistic UI update on local programs state
    setPrograms((prev: any[]) => {
      if (!prev) return prev;
      return prev.map((prog: any) => {
        if (prog.id !== programId) return prog;
        return {
          ...prog,
          phases: prog.phases?.map((ph: any) => ({
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
    });

    try {
      await apiClient.post(`/mentor/programs/${programId}/milestones/${milestoneId}/subtasks/toggle`, {
        title,
        index,
        isCompleted: !isCurrentlyCompleted,
      });
    } catch (error) {
      toast.error('Error al actualizar el ejercicio');
      // Revert Optimistic UI update
      setPrograms((prev: any[]) => {
        if (!prev) return prev;
        return prev.map((prog: any) => {
          if (prog.id !== programId) return prog;
          return {
            ...prog,
            phases: prog.phases?.map((ph: any) => ({
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
      });
    }
  };

  // Coach Specific Gamification persistency
  const [coachStats, setCoachStats] = useState<Record<string, { xp: number; level: number; currentStreak: number }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iter_coach_stats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Fallback below
        }
      }
    }
    return {};
  });

  const getCoachStats = (coachId: string) => {
    // Normalize or map backend ObjectId to mock IDs if necessary
    const id = coachId || 'coach_fitness';
    return coachStats[id] || coachStats['coach_fitness'] || { xp: 0, level: 1, currentStreak: 0 };
  };

  // Helper stats for currently selected coach
  const activeCoachStats = selectedCoach ? getCoachStats(selectedCoach.id) : { xp: 0, level: 1, currentStreak: 0 };

  // Real CRM Contact ID resolved from programs or fallback to authenticated user ID
  const crmMenteeId = programs.find(p => p.menteeId)?.menteeId || user?.id || '';

  // Fetch all necessary data based on menteeId
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Habits for the logged-in student
        const userHabits = await apiClient.get<any[]>(`/mentor/habits`)
          .catch(() => []);

        // Fetch Tasks
        const userTasks = await apiClient.get<any[]>(`/mentor/tasks/mentee/${user.id}`)
          .catch(() => apiClient.get<any[]>(`/mentor/tasks`).catch(() => []));

        // Fetch Sessions
        const userSessions = await apiClient.get<any[]>(`/mentor/sessions/mentee/${user.id}`)
          .catch(() => []);

        // Fetch Resources (Library)
        const sharedResources = await apiClient.get<any[]>(`/mentor/resources`)
          .catch(() => []);

        // Fetch Programs for active student
        const userPrograms = await apiClient.get<any[]>('/mentor/programs')
          .catch(() => []);

        // Fetch Objectives linked to programs
        const userObjectives = await apiClient.get<any[]>(`/mentor/objectives`)
          .catch(() => []);

        // Fetch Groups
        const userGroups = await apiClient.get<any[]>('/mentor/groups')
          .catch(() => []);
        
        // Fetch Tenant details to get the coach who owns the academy
        const tenantInfo = await apiClient.get<any>('/tenant/me').catch(() => null);
        if (tenantInfo?.mentor_owner) {
          setTenantCoach(tenantInfo.mentor_owner);
        }

        setHabits(userHabits);
        setTasks(userTasks);
        setSessions(userSessions);
        setResources(sharedResources);
        setPrograms(userPrograms);
        setObjectives(userObjectives);
        setGroups(userGroups);
      } catch (error) {
        console.error('Error fetching mentee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const checkMilestoneCompleted = (milestone: any, menteeId: string) => {
    if (!milestone?.completions) return false;
    const freq = milestone.frequency || 'ONCE';
    
    if (freq === 'DAILY') {
      const localTodayDateString = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD" local
      return milestone.completions.some((c: any) => {
        if (c.menteeId !== menteeId) return false;
        const utcDateStr = new Date(c.date).toISOString().split('T')[0]; // "YYYY-MM-DD" UTC
        return utcDateStr === localTodayDateString;
      });
    }
    
    if (freq === 'WEEKLY') {
      const getStartOfWeekUTC = (d: Date) => {
        const temp = new Date(d);
        const day = temp.getUTCDay();
        const diff = temp.getUTCDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(temp.setUTCDate(diff));
        weekStart.setUTCHours(0, 0, 0, 0);
        return weekStart;
      };
      
      const localTodayDateString = new Date().toLocaleDateString('en-CA');
      const localTodayAsUTCDate = new Date(`${localTodayDateString}T00:00:00.000Z`);
      const currentWeekStart = getStartOfWeekUTC(localTodayAsUTCDate);
      
      return milestone.completions.some((c: any) => {
        if (c.menteeId !== menteeId) return false;
        const cWeekStart = getStartOfWeekUTC(new Date(c.date));
        return cWeekStart.getTime() === currentWeekStart.getTime();
      });
    }
    
    return milestone.completions.some((c: any) => c.menteeId === menteeId);
  };

  const handleToggleMilestone = async (programId: string, milestoneId: string) => {
    if (togglingMilestoneId) return;

    let milestoneObj: any = null;
    for (const prog of programs) {
      if (prog.id === programId) {
        for (const phase of (prog.phases || [])) {
          const found = (phase.milestones || []).find((m: any) => m.id === milestoneId);
          if (found) {
            milestoneObj = found;
            break;
          }
        }
      }
      if (milestoneObj) break;
    }

    if (milestoneObj && milestoneObj.daysOfWeek && milestoneObj.daysOfWeek.length > 0) {
      const todayIndex = new Date().getDay(); // 0 (Dom) - 6 (Sab)
      const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1; // 0 (Lun) - 6 (Dom)
      if (!milestoneObj.daysOfWeek.includes(adjustedTodayIndex)) {
        const daysMap = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const allowedDaysStr = milestoneObj.daysOfWeek.map((d: number) => daysMap[d]).join(', ');
        toast.error(`Este paso solo se puede completar los días: ${allowedDaysStr}`);
        return;
      }
    }

    setTogglingMilestoneId(milestoneId);

    const localTodayStr = new Date().toLocaleDateString('en-CA');
    const apiDateStr = `${localTodayStr}T12:00:00.000Z`;

    // Guardar el estado anterior para reversión limpia en caso de error
    const oldPrograms = [...programs];

    // Actualización Optimista: marcamos o desmarcamos el hito en local de inmediato (1ms)
    setPrograms(prev => prev.map(p => {
      if (p.id !== programId) return p;
      return {
        ...p,
        phases: p.phases?.map((ph: any) => {
          const hasMilestone = ph.milestones?.some((m: any) => m.id === milestoneId);
          if (!hasMilestone) return ph;
          return {
            ...ph,
            milestones: ph.milestones?.map((m: any) => {
              if (m.id !== milestoneId) return m;

              const wasCompleted = checkMilestoneCompleted(m, crmMenteeId);
              let newCompletions = m.completions || [];

              if (wasCompleted) {
                // Desmarcar optimistamente
                if (m.frequency === 'DAILY') {
                  newCompletions = newCompletions.filter((c: any) => {
                    if (c.menteeId !== crmMenteeId) return true;
                    const utcDateStr = new Date(c.date).toISOString().split('T')[0];
                    return utcDateStr !== localTodayStr;
                  });
                } else if (m.frequency === 'WEEKLY') {
                  const getStartOfWeekUTC = (d: Date) => {
                    const temp = new Date(d);
                    const day = temp.getUTCDay();
                    const diff = temp.getUTCDate() - day + (day === 0 ? -6 : 1);
                    const weekStart = new Date(temp.setUTCDate(diff));
                    weekStart.setUTCHours(0, 0, 0, 0);
                    return weekStart;
                  };
                  const currentWeekStart = getStartOfWeekUTC(new Date(`${localTodayStr}T00:00:00.000Z`));
                  newCompletions = newCompletions.filter((c: any) => {
                    if (c.menteeId !== crmMenteeId) return true;
                    const cWeekStart = getStartOfWeekUTC(new Date(c.date));
                    return cWeekStart.getTime() !== currentWeekStart.getTime();
                  });
                } else {
                  newCompletions = newCompletions.filter((c: any) => c.menteeId !== crmMenteeId);
                }
              } else {
                // Marcar optimistamente
                newCompletions = [...newCompletions, { menteeId: crmMenteeId, date: apiDateStr }];
              }

              return {
                ...m,
                completions: newCompletions
              };
            })
          };
        })
      };
    }));

    try {
      await apiClient.post(`/mentor/programs/${programId}/milestones/${milestoneId}/toggle`, { date: apiDateStr });
      
      // Cargar la lista fresca y oficial desde la base de datos
      const userPrograms = await apiClient.get<any[]>('/mentor/programs').catch(() => []);
      setPrograms(userPrograms);
      
      // Buscar si estaba completado en el estado viejo (para la lógica de XP)
      const oldProgram = oldPrograms.find(p => p.id === programId);
      const oldPhase = oldProgram?.phases?.find((ph: any) => ph.milestones?.some((m: any) => m.id === milestoneId));
      const oldMilestone = oldPhase?.milestones?.find((m: any) => m.id === milestoneId);
      const wasCompleted = checkMilestoneCompleted(oldMilestone, crmMenteeId);

      // Buscar el estado nuevo oficial retornado por el servidor
      const updatedProgram = userPrograms.find(p => p.id === programId);
      const updatedPhase = updatedProgram?.phases?.find((ph: any) => ph.milestones?.some((m: any) => m.id === milestoneId));
      const updatedMilestone = updatedPhase?.milestones?.find((m: any) => m.id === milestoneId);
      const isNowCompleted = checkMilestoneCompleted(updatedMilestone, crmMenteeId);

      if (wasCompleted !== isNowCompleted && selectedCoach) {
        const xpAmount = oldMilestone?.xpReward || 30;
        const xpChange = isNowCompleted ? xpAmount : -xpAmount;

        setCoachStats(prev => {
          const current = prev[selectedCoach.id] || { xp: 0, level: 1, currentStreak: 0 };
          const nextXp = Math.max(0, current.xp + xpChange);
          let nextLevel = current.level;

          if (xpChange > 0) {
            while (nextXp >= getNextLevelXp(nextLevel)) {
              nextLevel++;
            }
          } else {
            while (nextLevel > 1 && nextXp < getNextLevelXp(nextLevel - 1)) {
              nextLevel--;
            }
          }

          const updated = {
            ...prev,
            [selectedCoach.id]: {
              xp: nextXp,
              level: nextLevel,
              currentStreak: current.currentStreak
            }
          };
          localStorage.setItem('iter_coach_stats', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('Error toggling milestone:', error);
      // En caso de error, revertimos optimistamente al estado original
      setPrograms(oldPrograms);
    } finally {
      setTogglingMilestoneId(null);
    }
  };

  // Toggle para fases sin hitos: el backend auto-crea el milestone y lo togglea
  const [togglingPhaseId, setTogglingPhaseId] = useState<string | null>(null);
  const handleTogglePhase = async (programId: string, phaseId: string) => {
    if (togglingPhaseId) return;
    setTogglingPhaseId(phaseId);

    const localTodayStr = new Date().toLocaleDateString('en-CA');
    const apiDateStr = `${localTodayStr}T12:00:00.000Z`;

    try {
      await apiClient.post(`/mentor/programs/${programId}/phases/${phaseId}/toggle`, { date: apiDateStr });
      // Refrescar programas desde la base de datos
      const userPrograms = await apiClient.get<any[]>('/mentor/programs').catch(() => []);
      setPrograms(userPrograms);
    } catch (error) {
      console.error('Error toggling phase:', error);
    } finally {
      setTogglingPhaseId(null);
    }
  };

  // Extract unique coach IDs from habits, tasks, and sessions, falling back to the inviting coach
  const uniqueApiCoachIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (tenantCoach?.id) {
      ids.add(tenantCoach.id);
    }
    habits.forEach(h => h.coachId && ids.add(h.coachId));
    tasks.forEach(t => t.coachId && ids.add(t.coachId));
    sessions.forEach(s => s.coachId && ids.add(s.coachId));
    programs.forEach(p => p.coachId && ids.add(p.coachId));
    groups.forEach(g => g.coachId && ids.add(g.coachId));
    return Array.from(ids);
  }, [habits, tasks, sessions, programs, groups, tenantCoach?.id]);

  // Build the list of active coaches, mapping backend database IDs dynamically
  const coachesList = React.useMemo(() => {
    return uniqueApiCoachIds.map((id) => {
      // If this ID matches the inviting tenant coach, override mock details with the real ones!
      if (tenantCoach && id === tenantCoach.id) {
        const rawAvatar = tenantCoach.avatarUrl;
        const resolvedAvatar = rawAvatar
          ? (rawAvatar.startsWith('/') || rawAvatar.startsWith('http') ? rawAvatar : `/avatars/${rawAvatar}`)
          : '/assets/avatar-placeholder.png';

        return {
          id: tenantCoach.id,
          name: `${tenantCoach.firstName} ${tenantCoach.lastName}`.trim() || 'Coach Principal',
          avatarUrl: resolvedAvatar,
          specialty: 'Coach Principal',
          bio: 'Tu coach principal y guía en la academia.',
          color: '#7B91EB',
          bgLight: 'rgba(123,145,235,0.1)'
        };
      }

      return {
        id: id,
        name: 'Coach Colaborador',
        avatarUrl: '/assets/avatar-placeholder.png',
        specialty: 'Coach de la Academia',
        bio: 'Coach y guía en tu proceso de aprendizaje.',
        color: '#10B981',
        bgLight: 'rgba(16,185,129,0.1)'
      };
    });
  }, [uniqueApiCoachIds, tenantCoach]);

  // Auto-select the coach if the student only has one active coach in their relations!
  useEffect(() => {
    if (coachesList.length === 1 && (!selectedCoach || selectedCoach.id !== coachesList[0].id)) {
      setSelectedCoach(coachesList[0]);
      // If we are currently on the 'coach' selection tab, auto-switch to panel since it's already active!
      if (activeTab === 'coach') {
        setActiveTab('panel');
      }
    }
  }, [coachesList, selectedCoach, setSelectedCoach, activeTab, setActiveTab]);

  // Filter lists strictly by selected coach
  // Filter lists strictly by selected coach
  const filteredHabits = React.useMemo(() => {
    if (!selectedCoach) return [];
    
    // 1. Legacy habits (if any)
    const legacy = habits.filter(h => h.coachId === selectedCoach.id || !h.coachId);
    
    // 2. Program-based habits (where program.type === 'HABITS')
    const programHabits: any[] = [];
    programs.forEach(program => {
      if (program.type === 'HABITS' && (program.coachId === selectedCoach.id || !program.coachId)) {
        (program.phases || []).forEach((phase: any) => {
          (phase.milestones || []).forEach((milestone: any) => {
            programHabits.push({
              id: milestone.id,
              programId: program.id,
              name: milestone.title,
              description: milestone.description,
              frequency: milestone.frequency || 'DAILY',
              daysOfWeek: milestone.daysOfWeek,
              requiredEvidence: milestone.requiredEvidence,
              subTasks: milestone.subTasks || [],
              checkedToday: checkMilestoneCompleted(milestone, crmMenteeId),
              coachId: program.coachId,
              checkins: milestone.completions?.map((c: any) => ({
                date: c.date || c.completedAt || c.createdAt,
                createdAt: c.completedAt || c.createdAt,
              })) || [],
            });
          });
        });
      }
    });

    return [...legacy, ...programHabits];
  }, [habits, programs, selectedCoach, crmMenteeId]);

  // Hábitos específicos para la vista "Today" con filtros temporales avanzados (DAILY / WEEKLY)
  const todayHabits = React.useMemo(() => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 (Dom) - 6 (Sab)
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // 0 (Lun) - 6 (Dom)

    return filteredHabits.filter(habit => {
      // Si el hábito tiene días específicos configurados, solo se muestra en esos días
      if (habit.daysOfWeek && habit.daysOfWeek.length > 0) {
        return habit.daysOfWeek.includes(adjustedIndex);
      }

      // Si el hábito es diario, siempre se muestra hoy (esté completado o no)
      if (habit.frequency === 'DAILY' || !habit.frequency) {
        return true;
      }
      // Si el hábito es semanal:
      if (habit.frequency === 'WEEKLY') {
        // Verificamos si tiene algún check-in esta semana en curso
        const hasCheckinThisWeek = habit.checkins?.some((c: any) => {
          const checkinDate = c.date || c.createdAt;
          if (!checkinDate) return false;
          return isSameWeek(new Date(checkinDate), new Date(), { weekStartsOn: 1 }); // Semana de lunes a domingo
        });
        // Si ya tiene un check-in esta semana, no debe aparecer en la pestaña "Today"
        return !hasCheckinThisWeek;
      }
      return true;
    });
  }, [filteredHabits]);

  const filteredTasks = React.useMemo(() => {
    if (!selectedCoach) return [];
    return tasks.filter(t => t.coachId === selectedCoach.id || !t.coachId);
  }, [tasks, selectedCoach]);

  const filteredSessions = React.useMemo(() => {
    if (!selectedCoach) return [];
    return sessions.filter(s => s.coachId === selectedCoach.id || !s.coachId);
  }, [sessions, selectedCoach]);
  
  const filteredPrograms = React.useMemo(() => {
    if (!selectedCoach) return [];
    return programs.filter(p => (p.coachId === selectedCoach.id || !p.coachId) && p.type !== 'HABITS');
  }, [programs, selectedCoach]);

  // 1. Program Milestones (Pasos) of today
  const todayMilestones = React.useMemo(() => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 (Dom) - 6 (Sab)
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // 0 (Lun) - 6 (Dom)

    return filteredPrograms.flatMap(program =>
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
  }, [filteredPrograms]);

  // 2. Today's/Pending Tasks
  const todayTasks = React.useMemo(() => {
    const today = new Date();
    return filteredTasks.filter((task: any) => {
      if (task.status !== 'COMPLETED' && task.status !== 'APPROVED') return true;
      if (task.updatedAt) {
         return new Date(task.updatedAt).toDateString() === today.toDateString();
      }
      return false;
    });
  }, [filteredTasks]);

  // 3. Today's Sessions
  const todaySessions = React.useMemo(() => {
    const today = new Date();
    return filteredSessions.filter((session: any) => {
      if (!session.date) return false;
      return new Date(session.date).toDateString() === today.toDateString();
    });
  }, [filteredSessions]);

  // 4. Daily Progress Metrics
  const dailyProgressMetrics = React.useMemo(() => {
    const completedTasksCount = todayMilestones.filter(t => checkMilestoneCompleted(t, crmMenteeId)).length;
    const completedHabitsCount = todayHabits.filter(h => h.checkedToday).length;
    const completedAssignedTasksCount = todayTasks.filter(t => t.status === 'SUBMITTED' || t.status === 'COMPLETED' || t.status === 'APPROVED').length;

    const total = todayMilestones.length + todayHabits.length + todayTasks.length;
    const completed = completedTasksCount + completedHabitsCount + completedAssignedTasksCount;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percent };
  }, [todayMilestones, todayHabits, todayTasks, crmMenteeId]);

  const handleToggleMilestoneClick = (milestone: any, programId: string) => {
     const isCompleted = checkMilestoneCompleted(milestone, crmMenteeId);

     if (milestone.requiredEvidence && milestone.requiredEvidence !== 'NONE' && !isCompleted) {
        setEvidenceTarget({ ...milestone, programId });
        setIsEvidenceModalOpen(true);
        return;
     }

     handleToggleMilestone(programId, milestone.id);
  };

  const handleEvidenceSubmit = async (evidence: string) => {
     if (!evidenceTarget) return;
     setIsEvidenceModalOpen(false);

     try {
        const localTodayStr = new Date().toLocaleDateString('en-CA');
        const apiDateStr = `${localTodayStr}T12:00:00.000Z`;
        setTogglingMilestoneId(evidenceTarget.id);

        await apiClient.post(`/mentor/programs/${evidenceTarget.programId}/milestones/${evidenceTarget.id}/toggle`, {
           date: apiDateStr,
           evidence
        });

        toast.success('¡Registro con evidencia completado!');

        // Reload fresh programs list
        const userPrograms = await apiClient.get<any[]>('/mentor/programs').catch(() => []);
        setPrograms(userPrograms);
        
        // Update XP
        if (selectedCoach) {
           const xpAmount = evidenceTarget.xpReward || 30;
           setCoachStats(prev => {
              const current = prev[selectedCoach.id] || { xp: 0, level: 1, currentStreak: 0 };
              const nextXp = current.xp + xpAmount;
              let nextLevel = current.level;
              while (nextXp >= getNextLevelXp(nextLevel)) {
                 nextLevel++;
              }
              const updated = {
                 ...prev,
                 [selectedCoach.id]: {
                    ...current,
                    xp: nextXp,
                    level: nextLevel
                 }
              };
              localStorage.setItem('iter_coach_stats', JSON.stringify(updated));
              return updated;
           });
        }
     } catch (error) {
        toast.error('Error al registrar con evidencia');
     } finally {
        setTogglingMilestoneId(null);
        setEvidenceTarget(null);
     }
  };

  // Handle Habit Check-in
  const handleHabitCheckin = async (habit: any) => {
    if (habit.programId) {
      handleToggleMilestoneClick(habit, habit.programId);
      return;
    }

    const habitId = habit.id;
    setCheckingHabitId(habitId);
    try {
      await apiClient.post(`/mentor/habits/${habitId}/checkin`, { date: new Date().toISOString() });
      
      // Update checkin locally
      setHabits(prev =>
        prev.map(h => {
          if (h.id === habitId) {
            return {
              ...h,
              checkedToday: true,
              checkins: [...(h.checkins || []), { createdAt: new Date().toISOString() }]
            };
          }
          return h;
        })
      );

      // Increment stats for this specific coach
      if (selectedCoach) {
        setCoachStats(prev => {
          const current = prev[selectedCoach.id] || { xp: 0, level: 1, currentStreak: 0 };
          const nextXp = current.xp + 15;
          let nextLevel = current.level;
          while (nextXp >= getNextLevelXp(nextLevel)) {
            nextLevel++;
          }
          const updated = {
            ...prev,
            [selectedCoach.id]: {
              xp: nextXp,
              level: nextLevel,
              currentStreak: current.currentStreak + 1
            }
          };
          localStorage.setItem('iter_coach_stats', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('Error in habit checkin:', error);
    } finally {
      setTimeout(() => setCheckingHabitId(null), 800);
    }
  };

  // Handle Task submission
  const handleTaskSubmit = async (taskId: string) => {
    if (!evidenceText.trim() && !evidenceUrl.trim()) return;

    try {
      await apiClient.put(`/mentor/tasks/${taskId}/status`, {
        status: 'SUBMITTED',
        evidenceUrl: evidenceUrl.trim(),
        evidenceNotes: evidenceText.trim()
      });

      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: 'SUBMITTED' } : t))
      );

      // Gain XP for task submittal
      if (selectedCoach) {
        setCoachStats(prev => {
          const current = prev[selectedCoach.id] || { xp: 0, level: 1, currentStreak: 0 };
          const nextXp = current.xp + 50; // Tasks award 50 XP
          let nextLevel = current.level;
          while (nextXp >= getNextLevelXp(nextLevel)) {
            nextLevel++;
          }
          const updated = {
            ...prev,
            [selectedCoach.id]: {
              ...current,
              xp: nextXp,
              level: nextLevel
            }
          };
          localStorage.setItem('iter_coach_stats', JSON.stringify(updated));
          return updated;
        });
      }

      setSubmittingTaskId(null);
      setEvidenceText('');
      setEvidenceUrl('');
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  // Level Progression Math
  const getNextLevelXp = (lvl: number) => Math.round(100 * Math.pow(lvl + 1, 1.5));
  const getCurrentLevelXpFloor = (lvl: number) => lvl === 1 ? 0 : Math.round(100 * Math.pow(lvl, 1.5));

  const xpFloor = getCurrentLevelXpFloor(activeCoachStats.level);
  const nextLevelXp = getNextLevelXp(activeCoachStats.level);
  const xpInCurrentLevel = activeCoachStats.xp - xpFloor;
  const xpNeededForLevel = nextLevelXp - xpFloor;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));

  // 0. Loading Spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 border-[5px] border-[#7B91EB]/10 border-t-[#7B91EB] rounded-full animate-spin shadow-xl" />
        <p className="text-[10px] font-black text-[#7B91EB] uppercase tracking-[0.3em] mt-6 animate-pulse italic">
          Cargando tu Camino en ITER...
        </p>
      </div>
    );
  }

  // 0.5 Empty Coaches state
  if (coachesList.length === 0) {
    return (
      <div className="glass-card bg-white rounded-[32px] p-12 border border-[#EAF0F6] shadow-soft text-center flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-3xl bg-[#7B91EB]/10 text-[#7B91EB] flex items-center justify-center shadow-inner relative">
          <Users size={36} className="text-[#7B91EB] animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tight italic text-[#2C3A50]">
            Esperando Asignación de Coach
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Actualmente no tenés coaches vinculados en tus asignaciones. Hablá con tu Coach o Nutricionista para que te asigne tus primeros hábitos, tareas o sesiones 1:1, ¡y tu panel se desbloqueará de inmediato!
          </p>
        </div>
      </div>
    );
  }

  // 1. COACH SELECTION TAB
  if (activeTab === 'coach') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="glass-card bg-white rounded-[32px] p-6 border border-[#EAF0F6] shadow-soft">
          <h2 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-2 text-[#2C3A50]">
            <Users className="w-6 h-6 text-[#7B91EB] animate-pulse" />
            Tus Entrenadores y Coaches
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Seleccioná un coach activo para acceder a tu panel personalizado de hábitos y tareas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coachesList.map((coach) => {
            const isSelected = selectedCoach?.id === coach.id;
            const stats = getCoachStats(coach.id);
            return (
              <div
                key={coach.id}
                className={`glass-card bg-white border rounded-[32px] p-6 transition-all duration-500 flex flex-col justify-between relative overflow-hidden group ${
                  isSelected
                    ? 'border-[#7B91EB] shadow-xl shadow-[#7B91EB]/5 ring-2 ring-[#7B91EB]/20 -translate-y-1'
                    : 'border-[#EAF0F6] shadow-soft hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {/* Active Indicator Header */}
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-[#7B91EB] text-white text-[7px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-[16px] shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    SELECCIONADO
                  </div>
                )}

                <div className="space-y-4">
                  {/* Avatar & Info Row */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[20px] overflow-hidden border border-slate-100 bg-slate-50 shrink-0 shadow-sm relative">
                      <img src={coach.avatarUrl} alt={coach.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-black text-[#2C3A50] uppercase tracking-tight italic leading-tight">
                        {coach.name}
                      </h3>
                      <span className="text-[8px] font-extrabold text-[#7B91EB] bg-[#7B91EB]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block border border-[#7B91EB]/20">
                        {coach.specialty}
                      </span>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                    {coach.bio}
                  </p>

                  {/* Coach Specific Metrics Row */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">NIVEL</span>
                      <span className="text-[15px] font-black italic text-[#2C3A50] mt-1 block leading-none">{stats.level}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">RACHA</span>
                      <span className="text-[15px] font-black italic text-orange-500 mt-1 flex items-center justify-center gap-0.5 block leading-none">
                        <Flame size={13} className="fill-orange-500" />
                        {stats.currentStreak}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    onClick={() => {
                      setSelectedCoach(coach);
                      setActiveTab('panel');
                    }}
                    className={`w-full py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 italic flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-[#2C3A50] text-white hover:bg-[#202b3c]'
                        : 'bg-[#7B91EB] text-white hover:bg-[#6D83E0] shadow-md hover:shadow-lg hover:shadow-[#7B91EB]/15'
                    }`}
                  >
                    {isSelected ? 'VER MI PANEL' : 'SELECCIONAR COACH'}
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. PANEL TAB: LOCKED SCREEN (No Coach Selected)
  if (activeTab === 'panel' && !selectedCoach) {
    return (
      <div className="glass-card bg-white rounded-[32px] p-12 border border-[#EAF0F6] shadow-soft text-center flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-3xl bg-[#7B91EB]/10 text-[#7B91EB] flex items-center justify-center shadow-inner relative">
          <Lock size={36} className="text-[#7B91EB] animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#7B91EB] rounded-full animate-ping" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tight italic text-[#2C3A50]">
            Panel de Control Bloqueado
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Para ver tus hábitos, tareas y sesiones del día, primero debés seleccionar a uno de tus coaches activos.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('coach')}
          className="px-6 py-3.5 bg-[#7B91EB] hover:bg-[#6D83E0] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#7B91EB]/15 italic flex items-center gap-2"
        >
          SELECCIONAR ENTRENADOR
          <ArrowRight size={12} />
        </button>
      </div>
    );
  }

  // 3. PANEL TAB: FULL FILTERED DASHBOARD (Coach Selected)
  if (activeTab === 'panel' && selectedCoach) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Local Scope Header Notification */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-[#EAF0F6] shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shrink-0">
              <img src={selectedCoach.avatarUrl} alt={selectedCoach.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[7px] font-black uppercase tracking-widest text-[#7B91EB] block">PANEL ACTIVO DE:</span>
              <h2 className="text-xs font-black text-[#2C3A50] uppercase tracking-tight italic">{selectedCoach.name}</h2>
            </div>
          </div>

          {/* Sub-Navigator Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            {[
              { key: 'today', label: 'DIARIO', icon: Zap },
              { key: 'programs', label: 'PROGRAMAS', icon: Layers }
            ].map((subItem) => {
              const SubIcon = subItem.icon;
              const isSubActive = panelSubTab === subItem.key;
              return (
                <button
                  key={subItem.key}
                  onClick={() => setPanelSubTab(subItem.key as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all duration-300 ${
                    isSubActive
                      ? 'bg-[#7B91EB] text-white shadow-md shadow-[#7B91EB]/10'
                      : 'text-slate-400 hover:text-[#7B91EB]'
                  }`}
                >
                  <SubIcon size={12} />
                  {subItem.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DIARIO SECTION */}
        {panelSubTab === 'today' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Player Stats Card */}
            <div className="glass-card bg-white border border-[#EAF0F6] rounded-[32px] p-6 shadow-soft relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000">
                <Sparkles className="w-40 h-40 text-[#7B91EB] rotate-12" />
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Level Circle */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[#EAF0F6] pb-6 md:pb-0 md:pr-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="42" stroke="#F0F3F7" strokeWidth="6" fill="transparent" />
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke={selectedCoach.color || '#7B91EB'}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * (activeCoachStats.xp - getCurrentLevelXpFloor(activeCoachStats.level)) / (getNextLevelXp(activeCoachStats.level) - getCurrentLevelXpFloor(activeCoachStats.level) || 1))}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="text-center z-10">
                      <span className="text-[9px] font-black text-[#7B91EB] tracking-widest leading-none block">NIVEL</span>
                      <span className="text-4xl font-black italic tracking-tighter leading-none mt-1 block text-[#2C3A50]">
                        {activeCoachStats.level}
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 italic">
                    {activeCoachStats.xp} / {getNextLevelXp(activeCoachStats.level)} EXP total
                  </p>
                </div>

                {/* Progress Details */}
                <div className="md:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-2 text-[#2C3A50]">
                        ¡Bienvenido, {user?.firstName}!
                        <Zap className="w-5 h-5 text-[#7B91EB] animate-pulse" />
                      </h2>
                      <p className="text-[10px] font-bold text-[#7B91EB] uppercase tracking-widest mt-0.5">
                        Camino a nivel {activeCoachStats.level + 1} con {selectedCoach.name}
                      </p>
                    </div>
                    {/* Streaks */}
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-2xl">
                      <Flame className="w-5 h-5 text-orange-500 animate-pulse fill-orange-500" />
                      <div className="text-left">
                        <span className="text-[13px] font-black text-[#2C3A50] italic tracking-tighter leading-none block">
                          {activeCoachStats.currentStreak}
                        </span>
                        <span className="text-[7px] font-extrabold text-orange-500 uppercase tracking-widest leading-none mt-0.5 block">
                          DÍAS RACHA
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-[#F0F3F7] rounded-full h-3.5 p-0.5 overflow-hidden border border-[#EAF0F6]">
                      <div
                        className="h-full rounded-full transition-all duration-1000 shadow-md"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((activeCoachStats.xp - getCurrentLevelXpFloor(activeCoachStats.level)) / (getNextLevelXp(activeCoachStats.level) - getCurrentLevelXpFloor(activeCoachStats.level) || 1)) * 100))}%`,
                          backgroundColor: selectedCoach.color || '#7B91EB',
                          boxShadow: `0 0 12px ${selectedCoach.color || '#7B91EB'}30`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Nivel {activeCoachStats.level}</span>
                      <span>{Math.round(Math.min(100, Math.max(0, ((activeCoachStats.xp - getCurrentLevelXpFloor(activeCoachStats.level)) / (getNextLevelXp(activeCoachStats.level) - getCurrentLevelXpFloor(activeCoachStats.level) || 1)) * 100)))}% completado</span>
                      <span>Nivel {activeCoachStats.level + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Layout: Left list of actions, Right progress circle KPI and sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Actions Checklist */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Pasos de hoy (Program Milestones) */}
                <div className="glass-card bg-white rounded-[32px] p-6 border border-[#EAF0F6] shadow-soft space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-indigo-500 rounded-full animate-pulse" />
                      <h3 className="text-xs font-black text-[#2C3A50] uppercase tracking-widest italic">
                         Rutinas y Pasos de Hoy
                      </h3>
                    </div>
                    <span className="text-[8px] font-extrabold text-[#7B91EB] bg-[#7B91EB]/10 px-2.5 py-1 rounded-xl uppercase tracking-wider border border-[#7B91EB]/20">
                       {todayMilestones.length} asignados
                    </span>
                  </div>

                  {todayMilestones.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">
                        No tenés rutinas ni pasos configurados para hoy.
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase mt-1">
                        Disfrutá tu día de descanso o consultá con tu coach.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {todayMilestones.map((milestone) => {
                        const isCompleted = checkMilestoneCompleted(milestone, crmMenteeId);
                        const isToggling = togglingMilestoneId === milestone.id;
                        const hasSubTasks = milestone.subTasks && milestone.subTasks.length > 0;
                        const completedSubTasks = hasSubTasks ? milestone.subTasks.filter((st: any) => st.isCompleted) : [];
                        const allSubTasksChecked = hasSubTasks ? milestone.subTasks.every((st: any) => st.isCompleted) : true;

                        const todayIndex = new Date().getDay();
                        const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;
                        const isDayAllowed = !milestone.daysOfWeek || milestone.daysOfWeek.length === 0 || milestone.daysOfWeek.includes(adjustedTodayIndex);

                        return (
                          <div
                            key={milestone.id}
                            className={`p-5 rounded-[24px] border transition-all duration-300 relative overflow-hidden flex flex-col gap-4 shadow-sm hover:shadow-md ${
                              isCompleted
                                ? 'bg-emerald-50/20 border-emerald-100/50'
                                : 'bg-white border-[#EAF0F6]'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[7.5px] font-black bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    {milestone.programName}
                                  </span>
                                  {milestone.xpReward && (
                                    <span className="text-[7.5px] font-black bg-amber-50 text-amber-500 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                      +{milestone.xpReward} XP
                                    </span>
                                  )}
                                  {milestone.requiredEvidence && milestone.requiredEvidence !== 'NONE' && (
                                    <span className="text-[7.5px] font-black bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5">
                                      <Camera className="w-2.5 h-2.5" /> Evidencia
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-[11px] font-black text-[#2C3A50] uppercase tracking-tight italic mt-1.5 leading-tight">
                                  {milestone.title}
                                </h4>
                                <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-widest">{milestone.description || 'Hito del programa de hoy'}</p>
                              </div>
                            </div>

                            {/* Checklist of Exercises/Subtasks */}
                            {hasSubTasks && (
                              <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <ListTodo className="w-3 h-3 text-[#7B91EB]" />
                                  <span className="text-[7px] font-black text-[#7B91EB] uppercase tracking-widest italic leading-none">
                                    Ejercicios completados ({isCompleted ? milestone.subTasks.length : completedSubTasks.length}/{milestone.subTasks.length})
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
                                        onClick={() => toggleSubTask(milestone.programId, milestone.id, task.title, idx)}
                                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all duration-300 active:scale-[0.98] ${
                                          isSubChecked
                                            ? 'bg-emerald-50/30 border-emerald-100/50 text-emerald-800'
                                            : !isDayAllowed
                                              ? 'bg-rose-50/20 border-rose-100/30 text-rose-400 cursor-not-allowed opacity-60'
                                              : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                        }`}
                                      >
                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                          isSubChecked 
                                            ? 'bg-emerald-600 border-emerald-500 text-white' 
                                            : !isDayAllowed
                                              ? 'border-rose-200 bg-white'
                                              : 'border-slate-300 bg-white'
                                        }`}>
                                          {isSubChecked && <Check size={8} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-tight italic leading-tight ${
                                          isSubChecked 
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

                            {/* Milestone Toggle button */}
                            <div className="pt-1">
                              {isCompleted ? (
                                <div className="w-full py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-xl text-[7.5px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm italic">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  Paso Completado
                                </div>
                              ) : (
                                <button
                                  disabled={isToggling || !allSubTasksChecked || !isDayAllowed}
                                  onClick={() => handleToggleMilestoneClick(milestone, milestone.programId)}
                                  className={`w-full py-2.5 rounded-xl text-[7.5px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5 group italic ${
                                    !isDayAllowed
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
                                      No disponible hoy
                                    </>
                                  ) : allSubTasksChecked ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                                      Registrar Paso Completado
                                    </>
                                  ) : (
                                    <>
                                      <ListTodo className="w-3.5 h-3.5" />
                                      Completá los ejercicios primero
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
                <div className="glass-card bg-white rounded-[32px] p-6 border border-[#EAF0F6] shadow-soft space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-[#2CD79A] rounded-full animate-pulse" />
                      <h3 className="text-xs font-black text-[#2C3A50] uppercase tracking-widest italic">
                        Hábitos del Día
                      </h3>
                    </div>
                    <span className="text-[8px] font-extrabold text-[#7B91EB] bg-[#7B91EB]/10 px-2.5 py-1 rounded-xl uppercase tracking-wider border border-[#7B91EB]/20">
                      +15 EXP c/u
                    </span>
                  </div>

                  {todayHabits.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">
                        No hay hábitos asignados para hoy.
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase mt-1">
                        Tu coach definirá tus hábitos pronto.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {todayHabits.map((habit) => {
                        const isChecked = habit.checkedToday;
                        const isChecking = checkingHabitId === habit.id || togglingMilestoneId === habit.id;
                        const hasSubTasks = habit.subTasks && habit.subTasks.length > 0;
                        const completedSubTasks = checkedSubTasks[habit.id] || [];
                        const allSubTasksChecked = hasSubTasks ? habit.subTasks.every((st: any, i: number) => completedSubTasks.includes(`${st.title}-${i}`)) : true;

                        if (hasSubTasks) {
                          return (
                            <div
                              key={habit.id}
                              className={`flex flex-col p-5 rounded-[24px] border transition-all duration-500 text-left relative overflow-hidden shadow-sm hover:shadow-md ${
                                isChecked
                                  ? 'bg-[#E5FAF0]/40 border-[#D1FAE5]'
                                  : 'bg-white border-[#EAF0F6]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="space-y-0.5 max-w-[70%]">
                                  <span className={`text-[11px] font-black uppercase tracking-tight italic block ${
                                    isChecked ? 'line-through text-slate-400' : 'text-[#2C3A50]'
                                  }`}>
                                    {habit.name}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block leading-tight">
                                    {habit.description || 'Rutina estructurada'}
                                  </span>
                                </div>

                                <button
                                  disabled={isChecked || isChecking || !allSubTasksChecked}
                                  onClick={() => handleHabitCheckin(habit)}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                    isChecked
                                      ? 'bg-[#2CD79A] text-white shadow-lg shadow-[#2CD79A]/20'
                                      : allSubTasksChecked
                                        ? 'bg-[#7B91EB] text-white shadow-lg shadow-[#7B91EB]/20 hover:scale-105 active:scale-95'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-60'
                                  }`}
                                >
                                  {isChecking ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : isChecked ? (
                                    <Check size={14} strokeWidth={3} />
                                  ) : (
                                    <Check size={14} />
                                  )}
                                </button>
                              </div>

                              {/* Subtasks Checklist */}
                              <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <ListTodo className="w-3.5 h-3.5 text-[#7B91EB]" />
                                  <span className="text-[7.5px] font-black text-indigo-500 uppercase tracking-widest italic leading-none">Ejercicios completados ({isChecked ? habit.subTasks.length : completedSubTasks.length}/{habit.subTasks.length})</span>
                                </div>
                                {habit.subTasks.map((task: any, idx: number) => {
                                  const isSubChecked = isChecked || completedSubTasks.includes(`${task.title}-${idx}`);
                                  return (
                                    <button
                                      key={idx}
                                      disabled={isChecked}
                                      type="button"
                                      onClick={() => toggleSubTask(habit.programId || habit.id, habit.id, task.title, idx)}
                                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all duration-300 ${
                                        isSubChecked
                                          ? 'bg-emerald-50/30 border-emerald-100/50 text-emerald-800'
                                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                      }`}
                                    >
                                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                        isSubChecked 
                                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                                          : 'border-slate-300 bg-white'
                                      }`}>
                                        {isSubChecked && <Check size={8} strokeWidth={4} />}
                                      </div>
                                      <span className={`text-[9.5px] font-black uppercase tracking-tight italic leading-tight ${isSubChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                        {task.title}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={habit.id}
                            disabled={isChecked || isChecking}
                            onClick={() => handleHabitCheckin(habit)}
                            className={`flex items-center justify-between p-4 rounded-[24px] border transition-all duration-500 text-left relative overflow-hidden group ${
                              isChecked
                                ? 'bg-[#E5FAF0]/70 border-[#D1FAE5] text-[#2C3A50]'
                                : 'bg-white hover:bg-slate-50 border-[#EAF0F6] shadow-sm hover:shadow-md'
                            }`}
                          >
                            <div className="space-y-0.5 max-w-[80%]">
                              <span className={`text-[11px] font-black uppercase tracking-tight italic block ${
                                isChecked ? 'line-through text-slate-400' : 'text-[#2C3A50]'
                              }`}>
                                {habit.name}
                              </span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">
                                {habit.description || 'Hábito de desarrollo'}
                              </span>
                            </div>

                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isChecked
                                ? 'bg-[#2CD79A] text-white shadow-lg shadow-[#2CD79A]/20'
                                : 'bg-[#F0F3FF] text-[#7B91EB] group-hover:scale-110 group-hover:bg-[#7B91EB] group-hover:text-white'
                            }`}>
                              {isChecking ? (
                                <div className="w-4 h-4 border-2 border-[#7B91EB] border-t-transparent rounded-full animate-spin" />
                              ) : isChecked ? (
                                <Check size={14} strokeWidth={3} />
                              ) : (
                                <Check size={14} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Tareas Entregables (Assigned Tasks) */}
                <div className="glass-card bg-white rounded-[32px] p-6 border border-[#EAF0F6] shadow-soft space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-amber-500 rounded-full animate-pulse" />
                      <h3 className="text-xs font-black text-[#2C3A50] uppercase tracking-widest italic">
                        Tareas y Entregables
                      </h3>
                    </div>
                    <span className="text-[8px] font-extrabold text-[#7B91EB] bg-[#7B91EB]/10 px-2.5 py-1 rounded-xl uppercase tracking-wider border border-[#7B91EB]/20">
                      {todayTasks.length} en agenda
                    </span>
                  </div>

                  {todayTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">
                        No tenés tareas pendientes para hoy.
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase mt-1">
                        ¡Buen trabajo manteniéndote al día!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {todayTasks.map((task) => {
                        const isCompleted = task.status === 'SUBMITTED' || task.status === 'COMPLETED' || task.status === 'APPROVED';
                        
                        return (
                          <div
                            key={task.id}
                            className={`flex items-center justify-between p-4 rounded-[20px] border transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-50/20 border-emerald-100/50'
                                : 'bg-white border-[#EAF0F6] hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="space-y-1 max-w-[70%]">
                              <span className="text-[7.5px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase tracking-wider border border-indigo-100 italic w-fit block">
                                +50 XP
                              </span>
                              <h4 className="text-[10px] font-black text-[#2C3A50] uppercase tracking-tight italic mt-1 leading-tight">
                                {task.title}
                              </h4>
                              <p className="text-[8px] text-[#7B91EB] font-bold uppercase tracking-widest">{task.description || 'Tarea especial de tu coach'}</p>
                              {task.dueDate && (
                                <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-widest block mt-0.5">
                                  Límite: {new Date(task.dueDate).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                                </span>
                              )}
                            </div>

                            <div>
                              {isCompleted ? (
                                <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 italic">
                                  <Check className="w-3.5 h-3.5" />
                                  {task.status === 'APPROVED' ? 'Aprobada' : 'Entregada'}
                                </div>
                              ) : (
                                <button
                                  onClick={() => setSubmittingTaskId(task.id)}
                                  className="px-4 py-2 bg-slate-900 hover:bg-[#7B91EB] text-white rounded-xl font-black text-[8px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all italic"
                                >
                                  Entregar
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Performance/Sessions */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. Hoy de un vistazo (Circle KPI) */}
                <div className="glass-card bg-white border border-[#EAF0F6] rounded-[32px] p-6 shadow-soft text-center space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 justify-center">
                    <h3 className="text-[9px] font-black text-[#2C3A50] uppercase tracking-[0.2em] italic">
                       Hoy de un Vistazo
                    </h3>
                  </div>

                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="#F0F3F7" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        stroke={selectedCoach.color || '#7B91EB'}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={339}
                        strokeDashoffset={339 - (339 * dailyProgressMetrics.percent) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="text-center z-10">
                      <span className="text-3xl font-black italic tracking-tighter leading-none block text-[#2C3A50]">
                        {dailyProgressMetrics.percent}%
                      </span>
                      <span className="text-[7.5px] font-black text-[#7B91EB] tracking-widest uppercase block mt-1">PROGRESO</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="space-y-0.5">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">PASOS</span>
                      <span className="text-[11px] font-black text-[#2C3A50]">{todayMilestones.filter(t => checkMilestoneCompleted(t, crmMenteeId)).length}/{todayMilestones.length}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">HÁBITOS</span>
                      <span className="text-[11px] font-black text-[#2C3A50]">{todayHabits.filter(h => h.checkedToday).length}/{todayHabits.length}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">TAREAS</span>
                      <span className="text-[11px] font-black text-[#2C3A50]">{todayTasks.filter(t => t.status === 'SUBMITTED' || t.status === 'COMPLETED' || t.status === 'APPROVED').length}/{todayTasks.length}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Sesiones de hoy */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                     <h3 className="text-[9px] font-black text-[#2C3A50] uppercase tracking-[0.2em] flex items-center gap-1.5 italic">
                        <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                        Videollamadas Hoy
                     </h3>
                     <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest italic">{todaySessions.length} hoy</span>
                  </div>

                  {todaySessions.length === 0 ? (
                     <div className="glass-card bg-white border border-[#EAF0F6] rounded-[24px] p-5 shadow-soft text-center">
                        <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-[10px] font-black text-slate-600 uppercase italic">Sin llamadas</h4>
                        <p className="text-[8px] text-slate-400 uppercase mt-1">
                           No tenés sesiones virtuales hoy.
                        </p>
                     </div>
                  ) : (
                     <div className="space-y-3">
                        {todaySessions.map((session) => (
                           <div key={session.id} className="bg-white border border-[#EAF0F6] rounded-[20px] p-4 shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
                              <div className="flex items-center justify-between">
                                 <span className="text-[7.5px] font-black text-[#7B91EB] uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 italic">
                                    En Vivo 🚀
                                 </span>
                                 <span className="text-[8.5px] font-bold text-slate-400 uppercase">
                                    {session.startTime || 'Hoy'}
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
                                    <Video className="w-3.5 h-3.5" />
                                    Unirse a Videollamada
                                 </a>
                              ) : (
                                 <div className="w-full py-2 bg-slate-50 text-slate-400 rounded-xl font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1 border border-slate-100 italic">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Enlace pendiente
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  )}
                </div>

                {/* 3. Próximas Sesiones */}
                <div className="glass-card bg-white rounded-[24px] p-5 border border-[#EAF0F6] shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[9px] font-black text-[#2C3A50] uppercase tracking-[0.2em] italic">
                       Mis próximas sesiones
                     </h3>
                  </div>

                  {filteredSessions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                        Sin sesiones agendadas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredSessions.slice(0, 3).map((session) => (
                        <div key={session.id} className="flex items-center justify-between gap-3 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#7B91EB]" />
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-black text-[#2C3A50] uppercase tracking-tight block">
                                Sesión Especial
                              </span>
                              <span className="text-[7.5px] font-extrabold text-[#7B91EB] uppercase tracking-widest block">
                                {session.date ? format(new Date(session.date), 'dd MMMM - HH:mm', { locale: es }) : 'POR DEFINIR'}
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-white text-[6.5px] font-black text-[#2CD79A] rounded border border-slate-100 uppercase">
                            {session.status || 'CONFIRMADA'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* PROGRAMAS TAB */}
        {panelSubTab === 'programs' && (
          <div className="space-y-6">
            <div className="glass-card bg-white rounded-[32px] p-6 border border-[#EAF0F6] shadow-soft">
              <h2 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-2 text-[#2C3A50]">
                <Layers className="w-6 h-6 text-[#7B91EB] animate-pulse" />
                Programas y Ruta de Aprendizaje
              </h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Visualizá tus programas asignados por {selectedCoach.name}, completá las fases e hitos propuestos.
              </p>
            </div>

            {filteredPrograms.length === 0 ? (
              <div className="glass-card bg-white rounded-[32px] p-16 border border-[#EAF0F6] shadow-soft text-center flex flex-col items-center justify-center">
                <Layers className="w-16 h-16 text-slate-200 mb-3" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">
                  No tenés programas asignados por este coach aún.
                </p>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">
                  Tu coach definirá tu programa de entrenamiento o nutrición pronto.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPrograms.map((program) => {
                  // Calculate total progress
                  const totalMilestones = program.phases?.reduce((acc: number, p: any) => acc + (p.milestones?.length || 0), 0) || 0;
                  const completedMilestones = program.phases?.reduce((acc: number, p: any) => 
                    acc + (p.milestones?.filter((m: any) => checkMilestoneCompleted(m, crmMenteeId)).length || 0), 0) || 0;
                  const programProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

                  return (
                    <div key={program.id} className="glass-card bg-white border border-[#EAF0F6] rounded-[32px] p-6 shadow-soft space-y-6">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[7.5px] font-black bg-[#7B91EB]/10 text-[#7B91EB] border border-[#7B91EB]/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {program.type || 'CURRICULUM'}
                            </span>
                            {program.duration && (
                              <span className="text-[7.5px] font-black bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {program.duration}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-[#2C3A50] uppercase tracking-tight italic mt-1.5">{program.name}</h3>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{program.description || 'Sin descripción'}</p>
                        </div>

                        {/* Progress Badge */}
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-black text-[#2C3A50] italic tracking-tighter block">{programProgress}%</span>
                            <span className="text-[7px] font-extrabold text-[#7B91EB] uppercase tracking-widest block">PROGRESO RUTA</span>
                          </div>
                          <div className="w-10 h-1.5 bg-[#F0F3F7] rounded-full overflow-hidden border border-[#EAF0F6]">
                            <div className="h-full rounded-full bg-[#7B91EB]" style={{ width: `${programProgress}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Phases Accordion */}
                      <div className="space-y-4">
                        {program.phases?.map((phase: any, pIdx: number) => {
                          const isOpen = expandedPhases[phase.id] !== false; // Default expanded!
                          const phaseTotal = phase.milestones?.length || 0;
                          const phaseCompleted = phase.milestones?.filter((m: any) => checkMilestoneCompleted(m, crmMenteeId)).length || 0;
                          const phaseProgress = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

                          return (
                            <div key={phase.id} className="border border-[#EAF0F6] rounded-[24px] overflow-hidden bg-slate-50/50">
                              <button
                                onClick={() => setExpandedPhases(prev => ({ ...prev, [phase.id]: !isOpen }))}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-white border border-[#EAF0F6] flex items-center justify-center text-[10px] font-black text-[#7B91EB] italic shrink-0">
                                    0{pIdx + 1}
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black text-[#2C3A50] uppercase tracking-tight italic">{phase.name}</h4>
                                    <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block">
                                      {phaseCompleted} de {phaseTotal} hitos completados
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Phase Progress bar */}
                                  <div className="hidden sm:flex items-center gap-2">
                                    <div className="w-16 h-1 bg-[#F0F3F7] rounded-full overflow-hidden">
                                      <div className="h-full bg-[#2CD79A]" style={{ width: `${phaseProgress}%` }} />
                                    </div>
                                    <span className="text-[7.5px] font-black text-[#2CD79A]">{phaseProgress}%</span>
                                  </div>
                                  {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </div>
                              </button>

                              {isOpen && (
                                <div className="p-4 border-t border-[#EAF0F6] bg-white space-y-3">
                                  {phase.milestones?.length === 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                      <button
                                        disabled={togglingPhaseId === phase.id}
                                        onClick={() => handleTogglePhase(program.id, phase.id)}
                                        className="flex items-center justify-between p-3.5 rounded-[18px] border transition-all duration-300 text-left relative overflow-hidden group bg-white hover:bg-slate-50 border-[#EAF0F6] shadow-sm"
                                      >
                                        <div className="space-y-0.5 max-w-[80%]">
                                          <span className="text-[10px] font-black uppercase tracking-tight italic block text-[#2C3A50]">
                                            {phase.name}
                                          </span>
                                          <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block leading-snug">
                                            {phase.description || 'Marca como completada'}
                                          </span>
                                        </div>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F0F3FF] text-[#7B91EB] group-hover:bg-[#7B91EB] group-hover:text-white transition-all duration-300 shrink-0">
                                          {togglingPhaseId === phase.id ? (
                                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <Check size={12} />
                                          )}
                                        </div>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {phase.milestones.map((milestone: any) => {
                                        const isCompleted = checkMilestoneCompleted(milestone, crmMenteeId);
                                        const isToggling = togglingMilestoneId === milestone.id;
                                        
                                        const hasSubTasks = milestone.subTasks && milestone.subTasks.length > 0;
                                        const isHabitOrRoutine = program.type === 'HABITS' || program.type === 'ROUTINE' || milestone.frequency !== 'ONCE';

                                        const todayIndex = new Date().getDay(); // 0 (Dom) - 6 (Sab)
                                        const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1; // 0 (Lun) - 6 (Dom)
                                        const isDayAllowed = !milestone.daysOfWeek || milestone.daysOfWeek.length === 0 || milestone.daysOfWeek.includes(adjustedTodayIndex);

                                        if (isHabitOrRoutine || hasSubTasks) {
                                          const completedSubTasks = hasSubTasks ? milestone.subTasks.filter((st: any) => st.isCompleted) : [];
                                          const allSubTasksChecked = hasSubTasks ? milestone.subTasks.every((st: any) => st.isCompleted) : true;

                                          return (
                                            <div key={milestone.id} className="bg-white border border-[#EAF0F6] rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 relative overflow-hidden">
                                              <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-1">
                                                  <h4 className="text-[10px] font-black text-[#2C3A50] uppercase tracking-tight italic leading-tight">
                                                    {milestone.title}
                                                  </h4>
                                                  <div className="flex items-center gap-1.5 flex-wrap">
                                                    {milestone.xpReward && (
                                                      <div className="px-1.5 py-0.5 bg-amber-50 rounded text-[6.5px] font-black text-amber-500 uppercase tracking-widest italic border border-amber-100 shadow-sm">+{milestone.xpReward} XP</div>
                                                    )}
                                                    <div className="px-1.5 py-0.5 bg-indigo-50 rounded text-[6.5px] font-black text-[#7B91EB] uppercase tracking-widest italic border border-indigo-50 shadow-sm">
                                                      {milestone.frequency === 'DAILY' ? 'DIARIO' : milestone.frequency === 'WEEKLY' ? 'SEMANAL' : 'ÚNICO'}
                                                    </div>
                                                    {milestone.daysOfWeek && milestone.daysOfWeek.length > 0 && (
                                                      <div className={`px-1.5 py-0.5 rounded text-[6.5px] font-black uppercase tracking-widest italic border shadow-sm ${
                                                        isDayAllowed
                                                          ? 'bg-emerald-50 text-[#2CD79A] border-emerald-100'
                                                          : 'bg-rose-50 text-rose-500 border-rose-100'
                                                      }`}>
                                                        Días: {milestone.daysOfWeek.map((d: number) => ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][d]).join(', ')}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Checklist of subtasks */}
                                              {hasSubTasks && (
                                                <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                                                  <div className="flex items-center gap-1 mb-0.5">
                                                    <ListTodo className="w-3 h-3 text-[#7B91EB]" />
                                                    <span className="text-[7px] font-black text-[#7B91EB] uppercase tracking-widest italic leading-none">
                                                      Ejercicios completados ({isCompleted ? milestone.subTasks.length : completedSubTasks.length}/{milestone.subTasks.length})
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
                                                          onClick={() => toggleSubTask(program.id, milestone.id, task.title, idx)}
                                                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all duration-300 active:scale-[0.98] ${
                                                            isSubChecked
                                                              ? 'bg-emerald-50/30 border-emerald-100/50 text-emerald-800'
                                                              : !isDayAllowed
                                                                ? 'bg-rose-50/20 border-rose-100/30 text-rose-400 cursor-not-allowed opacity-60'
                                                                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                                          }`}
                                                        >
                                                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                                            isSubChecked 
                                                              ? 'bg-emerald-600 border-emerald-500 text-white' 
                                                              : !isDayAllowed
                                                                ? 'border-rose-200 bg-white'
                                                                : 'border-slate-300 bg-white'
                                                          }`}>
                                                            {isSubChecked && <Check size={8} strokeWidth={4} />}
                                                          </div>
                                                          <span className={`text-[9px] font-black uppercase tracking-tight italic leading-tight ${
                                                            isSubChecked 
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

                                              {/* Check-in Button */}
                                              <div className="pt-1">
                                                {isCompleted ? (
                                                  <div className="w-full py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-xl text-[7.5px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm italic">
                                                    <Check className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
                                                    Rutina Completada hoy
                                                  </div>
                                                ) : (
                                                  <button
                                                    disabled={isToggling || !allSubTasksChecked || !isDayAllowed}
                                                    onClick={() => handleToggleMilestone(program.id, milestone.id)}
                                                    className={`w-full py-2.5 rounded-xl text-[7.5px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5 group italic ${
                                                      !isDayAllowed
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
                                                        No disponible hoy
                                                      </>
                                                    ) : allSubTasksChecked ? (
                                                      <>
                                                        <Check className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                                                        Registrar Check-in Hoy
                                                      </>
                                                    ) : (
                                                      <>
                                                        <ListTodo className="w-3.5 h-3.5" />
                                                        Completá los ejercicios primero
                                                      </>
                                                    )}
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        }

                                        return (
                                          <div
                                            key={milestone.id}
                                            className={`flex items-center justify-between p-4 rounded-[20px] border transition-all duration-300 text-left relative overflow-hidden group ${
                                              isCompleted
                                                ? 'bg-[#E5FAF0]/50 border-[#D1FAE5] text-[#2C3A50]'
                                                : 'bg-white hover:bg-slate-50/50 border-[#EAF0F6] shadow-sm hover:shadow-md'
                                            }`}
                                          >
                                            <div className="space-y-1 max-w-[80%] pr-4">
                                              <span className={`text-[10px] font-black uppercase tracking-tight italic block ${
                                                isCompleted ? 'line-through text-slate-400' : 'text-[#2C3A50]'
                                              }`}>
                                                {milestone.title}
                                              </span>
                                              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block leading-snug">
                                                {milestone.description || 'Objetivo de aprendizaje'}
                                              </span>
                                              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                                {milestone.xpReward && (
                                                  <span className="inline-block text-[6.5px] font-black bg-amber-50 text-amber-500 border border-amber-100 px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                                                    +{milestone.xpReward} EXP
                                                  </span>
                                                )}
                                                <span className="inline-block text-[6.5px] font-black bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                  {milestone.frequency === 'DAILY' ? 'DIARIO' : milestone.frequency === 'WEEKLY' ? 'SEMANAL' : 'ÚNICO'}
                                                </span>
                                                {milestone.daysOfWeek && milestone.daysOfWeek.length > 0 && (
                                                  <span className={`inline-block text-[6.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border shadow-sm ${
                                                    isDayAllowed
                                                      ? 'bg-emerald-50 text-[#2CD79A] border-emerald-100'
                                                      : 'bg-rose-50 text-rose-500 border-rose-100'
                                                  }`}>
                                                    Días: {milestone.daysOfWeek.map((d: number) => ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][d]).join(', ')}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <button
                                              disabled={isToggling || (!isCompleted && !isDayAllowed)}
                                              onClick={() => handleToggleMilestone(program.id, milestone.id)}
                                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 shadow-sm active:scale-90 cursor-pointer ${
                                                isCompleted
                                                  ? 'bg-[#2CD79A] text-white hover:bg-[#23be87]'
                                                  : !isDayAllowed
                                                    ? 'bg-rose-50 text-rose-300 border border-rose-100 cursor-not-allowed opacity-80'
                                                    : 'bg-[#F0F3FF] text-[#7B91EB] hover:bg-[#7B91EB] hover:text-white'
                                              }`}
                                              title={isCompleted ? "Marcar como incompleto" : !isDayAllowed ? "No disponible hoy" : "Completar hito"}
                                            >
                                              {isToggling ? (
                                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                              ) : isCompleted ? (
                                                <Check size={14} strokeWidth={3.5} className="animate-bounce" />
                                              ) : !isDayAllowed ? (
                                                <Clock size={14} strokeWidth={2.5} />
                                              ) : (
                                                <Check size={14} strokeWidth={2.5} />
                                              )}
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUBMIT EVIDENCE MODAL */}
        {submittingTaskId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C3A50]/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white border border-[#EAF0F6] max-w-md w-full rounded-[32px] p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-black text-[#2C3A50] uppercase tracking-widest italic flex items-center gap-2">
                  <Send className="w-4.5 h-4.5 text-[#7B91EB]" />
                  Entregar Evidencia
                </h3>
                <button
                  onClick={() => setSubmittingTaskId(null)}
                  className="text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest border border-slate-200/50 bg-slate-50 hover:bg-slate-100/60 px-3 py-1.5 rounded-xl transition-all"
                >
                  CERRAR
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic block">
                    MENSAJE O EXPLICACIÓN (OPCIONAL)
                  </label>
                  <textarea
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                    placeholder="Escribí una nota para tu coach detallando tu progreso..."
                    className="w-full bg-[#F5F7FB] border border-[#EAF0F6] rounded-2xl p-4 text-[11px] font-medium placeholder-slate-400 focus:outline-none focus:border-[#7B91EB] focus:bg-white transition-all h-24 resize-none text-[#2C3A50]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic block">
                    ENLACE DE EVIDENCIA (LINK / REPO / DRIVE)
                  </label>
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://tudrive.com/mi-archivo"
                    className="w-full bg-[#F5F7FB] border border-[#EAF0F6] rounded-2xl px-4 py-3.5 text-[11px] font-medium placeholder-slate-400 focus:outline-none focus:border-[#7B91EB] focus:bg-white transition-all text-[#2C3A50]"
                  />
                </div>
              </div>

              <button
                disabled={!evidenceText.trim() && !evidenceUrl.trim()}
                onClick={() => handleTaskSubmit(submittingTaskId)}
                className="w-full py-4 bg-[#7B91EB] hover:bg-[#6D83E0] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-md hover:shadow-lg hover:shadow-[#7B91EB]/15 transition-all italic flex items-center justify-center gap-1.5"
              >
                ENVIAR A REVISIÓN
                <Send size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. STUDENT PROFILE TAB
  if (activeTab === 'profile') {
    // Sum stats for high-fidelity overall ITER metrics
    const totalXp = coachesList.reduce((acc, c) => acc + getCoachStats(c.id).xp, 0);
    const totalLevel = Math.max(1, Math.floor(1 + Math.sqrt(totalXp / 100)));

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Profile Details Header */}
        <div className="glass-card bg-white rounded-[32px] p-8 border border-[#EAF0F6] shadow-soft relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity duration-1000">
            <Sparkles className="w-56 h-56 text-[#7B91EB] rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
            {/* User Avatar */}
            <div className="w-24 h-24 rounded-[32px] overflow-hidden border-2 border-[#7B91EB] bg-slate-100 shrink-0 shadow-lg">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl.startsWith('/') || user.avatarUrl.startsWith('http') ? user.avatarUrl : `/avatars/${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#7B91EB]/10 text-[#7B91EB] text-2xl font-black uppercase">
                  {user?.firstName?.charAt(0) || 'E'}
                </div>
              )}
            </div>

            <div className="text-center md:text-left space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight italic text-[#2C3A50]">
                {user?.firstName} {user?.lastName}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="text-[8px] font-extrabold text-[#7B91EB] bg-[#7B91EB]/10 px-3 py-1 rounded-full uppercase tracking-wider border border-[#7B91EB]/20">
                  Alumno ITER
                </span>
                <span className="text-[8px] font-extrabold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider border border-slate-200">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Aggregate Progress Badge */}
            <div className="md:ml-auto bg-gradient-to-tr from-[#7B91EB] to-[#99A7EE] text-white px-6 py-4 rounded-[24px] shadow-lg shadow-[#7B91EB]/20 flex items-center gap-4 text-left">
              <Award size={32} className="animate-pulse shrink-0 animate-bounce-subtle" />
              <div>
                <span className="text-[7.5px] font-black uppercase tracking-widest block leading-none text-white/80">RANGO GLOBAL</span>
                <span className="text-lg font-black italic tracking-tighter block leading-none mt-1">LÍDER NIVEL {totalLevel}</span>
                <span className="text-[7.5px] font-black uppercase tracking-widest block mt-1.5 text-indigo-100">
                  {totalXp} XP Totales
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coach Specific Progression Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#7B91EB] rounded-full" />
            <h3 className="text-xs font-black text-[#2C3A50] uppercase tracking-widest italic">
              Progreso por Coach y Especialidad
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coachesList.map((coach) => {
              const cStats = getCoachStats(coach.id);
              const cXpFloor = getCurrentLevelXpFloor(cStats.level);
              const cNextXp = getNextLevelXp(cStats.level);
              const cXpInLevel = cStats.xp - cXpFloor;
              const cXpNeeded = cNextXp - cXpFloor;
              const cPercent = Math.min(100, Math.max(0, (cXpInLevel / cXpNeeded) * 100));

              return (
                <div key={coach.id} className="glass-card bg-white border border-[#EAF0F6] rounded-[32px] p-6 shadow-soft space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shrink-0 shadow-sm">
                        <img src={coach.avatarUrl} alt={coach.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-[#2C3A50] uppercase tracking-tight italic leading-none">{coach.name}</h4>
                        <span className="text-[7.5px] font-extrabold text-[#7B91EB] uppercase tracking-wider block mt-1">{coach.specialty}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-[#F0F3F7] rounded-full h-2 overflow-hidden border border-[#EAF0F6]">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${cPercent}%`,
                            backgroundColor: coach.color || '#7B91EB'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[7px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Nivel {cStats.level}</span>
                        <span>{Math.round(cPercent)}%</span>
                        <span>Nivel {cStats.level + 1}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCoach(coach);
                      setActiveTab('panel');
                    }}
                    className="w-full py-2.5 mt-2 bg-slate-50 hover:bg-[#7B91EB] hover:text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1 border border-slate-100 hover:border-transparent text-slate-500 italic"
                  >
                    INGRESAR A SU PANEL
                    <ArrowRight size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
