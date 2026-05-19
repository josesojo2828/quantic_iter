'use client';

import React, { useState, useEffect, use } from 'react';
import { 
  ArrowLeft,
  Target,
  Zap,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { contactsService } from '@/features/crm/services/contacts.service';

interface Objective {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId: string;
  menteeName?: string;
  xpReward: number;
  dueDate?: string;
  createdAt: string;
}

export default function ObjectiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [objective, setObjective] = useState<Objective | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentAvatar, setStudentAvatar] = useState<string | undefined>(undefined);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchObjectiveDetails = async () => {
    try {
      setLoading(true);
      // Fetch all tasks and filter to find this specific ID
      const data = await apiClient.get<Objective[]>('/mentor/tasks');
      const found = data.find(item => item.id === id);
      if (found) {
        setObjective(found);
        loadStudentAvatar(found.assigneeId);
      } else {
        toast.error('No se encontró el objetivo especificado');
        router.push('/dashboard/tasks');
      }
    } catch (error) {
      console.error('Error fetching objective detail:', error);
      toast.error('Error al sincronizar el objetivo');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentAvatar = async (studentId: string) => {
    try {
      const { items } = await contactsService.getContacts({ ids: [studentId] });
      if (items.length > 0 && items[0].avatarUrl) {
        setStudentAvatar(items[0].avatarUrl);
      }
    } catch (err) {
      console.error('Error loading student avatar:', err);
    }
  };

  useEffect(() => {
    fetchObjectiveDetails();
  }, [id]);

  const handleApprove = async () => {
    if (!objective) return;
    try {
      setActionLoading(true);
      await apiClient.put(`/mentor/tasks/${objective.id}/status`, { status: 'APPROVED' });
      toast.success('¡Operación validada! Recompensas de XP desplegadas con éxito.');
      fetchObjectiveDetails();
    } catch (error) {
      toast.error('Error al intentar validar la tarea');
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-50 text-red-600 border-red-100 shadow-red-100';
      case 'HIGH':
        return 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100';
      case 'MEDIUM':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100';
      default:
        return 'bg-slate-50 text-slate-400 border-slate-100 shadow-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 border-[4px] border-indigo-50 border-t-indigo-600 rounded-full animate-spin shadow-2xl" />
        <p className="text-[9px] text-slate-400 font-black tracking-[0.35em] uppercase animate-pulse italic">Cargando Ficha Operativa...</p>
      </div>
    );
  }

  if (!objective) return null;

  const currentStep = 
    objective.status === 'APPROVED' ? 4 :
    objective.status === 'SUBMITTED' ? 3 :
    objective.status === 'IN_PROGRESS' ? 2 : 1;

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push('/dashboard/tasks')}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-[8.5px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all shadow-sm active:scale-95 italic"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a Misiones
        </button>

        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 italic">OP-ID: {objective.id.substring(0, 8).toUpperCase()}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Status Track */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[28px] border border-white p-6 md:p-8 shadow-soft relative overflow-hidden">
            {/* Decoration Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/[0.03] rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />

            <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
              <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.25em] border italic shadow-sm ${getPriorityColor(objective.priority)}`}>
                PRIORIDAD {objective.priority}
              </span>
              <div className="flex items-center gap-2 text-[8px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest shadow-sm italic">
                <Zap className="w-3.5 h-3.5 fill-current animate-bounce" />
                +{objective.xpReward} XP
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">
              {objective.title}
            </h1>

            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] opacity-80 leading-relaxed border-l-2 border-indigo-500 pl-4 mb-8 italic">
              {objective.description || 'SIN ESPECIFICACIONES TÉCNICAS ADICIONALES PARA ESTA MISIÓN.'}
            </p>

            {/* Performance Timeline Tracker */}
            <div className="pt-6 border-t border-slate-100/50">
              <h3 className="text-[10px] font-black text-slate-900 tracking-[0.25em] uppercase mb-6 italic">LÍNEA DE TIEMPO OPERATIVA</h3>
              
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {[
                  { title: 'MISIÓN PLANIFICADA', desc: 'Misión y recompensa inicial configuradas en el sistema.', step: 1, date: objective.createdAt },
                  { title: 'EN DESARROLLO', desc: 'El estudiante está ejecutando las especificaciones de la tarea.', step: 2 },
                  { title: 'ENTREGADO / EN REVISIÓN', desc: 'Evidencias subidas por el alumno listas para auditoría del coach.', step: 3 },
                  { title: 'APROBADO & VALIDADO', desc: 'Recompensa de XP transferida al perfil del estudiante.', step: 4 }
                ].map((track, i) => {
                  const isActive = currentStep >= track.step;
                  const isCurrent = currentStep === track.step;
                  
                  return (
                    <div key={i} className="relative group/timeline">
                      {/* Step Indicator Dot */}
                      <div className={`absolute -left-[20px] top-1 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500 z-10 ${
                        isCurrent ? 'bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' :
                        isActive ? 'bg-indigo-100 border-indigo-200 text-indigo-600' :
                        'bg-white border-slate-100 text-slate-300'
                      }`}>
                        {isActive && currentStep > track.step ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-[8px] font-black font-sans">{track.step}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className={`p-4 rounded-[20px] border transition-all duration-500 ${
                        isCurrent ? 'bg-indigo-50/20 border-indigo-100/80 shadow-sm' :
                        isActive ? 'bg-slate-50/30 border-slate-100' :
                        'bg-white/10 border-transparent opacity-40'
                      }`}>
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${
                            isActive ? 'text-slate-900' : 'text-slate-300'
                          }`}>
                            {track.title}
                          </h4>
                          {track.date && (
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest italic">
                              {format(new Date(track.date), 'dd MMM yyyy, HH:mm', { locale: es }).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className={`text-[8.5px] font-black uppercase tracking-[0.1em] leading-relaxed italic ${
                          isActive ? 'text-slate-400' : 'text-slate-200'
                        }`}>
                          {track.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Student CRM Card & Actions */}
        <div className="space-y-6">
          
          {/* Student CRM Box */}
          <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[28px] border border-white p-6 shadow-soft text-center relative overflow-hidden">
            <h3 className="text-[9px] font-black text-slate-400 tracking-[0.25em] uppercase mb-4 text-left italic">ALUMNO ASIGNADO</h3>
            
            <div className="flex flex-col items-center py-4 space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-[24px] overflow-hidden border-2 border-white shadow-2xl relative z-10 bg-slate-900 flex items-center justify-center">
                  {studentAvatar ? (
                    <img 
                      src={studentAvatar.startsWith('http') ? studentAvatar : `/avatars/${studentAvatar}`} 
                      alt={objective.menteeName || 'M'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-black text-white italic">{objective.menteeName?.charAt(0).toUpperCase() || 'M'}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full scale-75 z-0 animate-pulse" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">
                  {objective.menteeName || 'ALUMNO QUANTIC'}
                </h4>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1 italic">NIVEL OPERATIVO ACTIVO</p>
              </div>

              <Link 
                href={`/dashboard/clients/${objective.assigneeId}`}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl text-[8.5px] font-black text-slate-400 hover:text-indigo-600 transition-all w-full uppercase tracking-widest shadow-sm active:scale-95 italic group"
              >
                Ver Expediente Académico
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Performance stats summary */}
          <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[28px] border border-white p-6 shadow-soft space-y-4 relative overflow-hidden">
            <h3 className="text-[9px] font-black text-slate-400 tracking-[0.25em] uppercase mb-2 italic">MÉTRICAS DE RENDIMIENTO</h3>
            
            <div className="space-y-3">
              {[
                { label: 'IMPACTO ESTIMADO', val: objective.priority === 'URGENT' ? '100% ALTO' : objective.priority === 'HIGH' ? '80% MEDIO-ALTO' : '50% ESTÁNDAR', icon: TrendingUp },
                { label: 'COEFICIENTE DE EXPERIENCIA', val: `+${objective.xpReward} PUNTOS`, icon: Award },
                { label: 'FECHA LÍMITE DE ENTREGA', val: objective.dueDate ? format(new Date(objective.dueDate), 'dd MMMM yyyy', { locale: es }).toUpperCase() : 'SIN FECHA LÍMITE', icon: Calendar }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50/40 border border-slate-100 rounded-xl">
                  <div className="w-8 h-8 bg-white border border-slate-50 text-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 italic">{item.label}</p>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Management Actions */}
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-[28px] p-6 shadow-2xl space-y-4 relative overflow-hidden text-white">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

            <h3 className="text-[9px] font-black text-indigo-400 tracking-[0.25em] uppercase mb-2 relative z-10 italic">AUDITORÍA MENTOR MAESTRO</h3>
            
            {objective.status === 'SUBMITTED' ? (
              <div className="space-y-4 relative z-10">
                <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[8.5px] font-black uppercase tracking-wider text-slate-400 leading-normal italic">
                    El alumno ha reportado la tarea como resuelta. Por favor valida la calidad de las evidencias antes de otorgar el XP.
                  </p>
                </div>
                <button 
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full py-4 bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-[18px] text-[8.5px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-950/20 active:scale-95 flex items-center justify-center gap-2 group italic border border-indigo-400/20"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      VALIDAR Y OTORGAR XP
                      <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            ) : objective.status === 'APPROVED' ? (
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex flex-col items-center text-center space-y-2 relative z-10">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center shadow-lg mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em] italic">OPERACIÓN COMPLETADA</h4>
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 leading-relaxed italic">
                  Este objetivo fue validado exitosamente. La recompensa de {objective.xpReward} XP se encuentra activa en el expediente del alumno.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-2 relative z-10">
                <div className="w-10 h-10 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center shadow-lg mb-2">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] italic">MISIÓN EN DESARROLLO</h4>
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-500 leading-relaxed italic">
                  Esperando que el alumno marque este objetivo como completado. Recibirás una notificación cuando las evidencias estén listas para tu auditoría.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
