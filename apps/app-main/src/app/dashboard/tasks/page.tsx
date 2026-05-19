'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Users,
  Calendar,
  ArrowRight,
  Zap,
  Target,
  ShieldCheck
} from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ObjectiveFormModal } from './components/ObjectiveFormModal';
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

export default function TasksPage() {
  const router = useRouter();
  const [objectiveQueue, setObjectiveQueue] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatarsCache, setAvatarsCache] = useState<Record<string, { name: string, avatarUrl?: string }>>({});

  useEffect(() => {
    if (objectiveQueue.length > 0) {
      const loadAvatars = async () => {
        const allMenteeIds = Array.from(new Set(
          objectiveQueue.map(obj => obj.assigneeId).filter(Boolean)
        )).filter(id => !avatarsCache[id]);

        if (allMenteeIds.length === 0) return;

        try {
          const { items } = await contactsService.getContacts({ ids: allMenteeIds });
          const newCache = { ...avatarsCache };
          items.forEach(contact => {
            newCache[contact.id] = {
              name: contact.name,
              avatarUrl: contact.avatarUrl || undefined
            };
          });
          setAvatarsCache(newCache);
        } catch (err) {
          console.error('Error loading task avatars:', err);
        }
      };
      loadAvatars();
    }
  }, [objectiveQueue]);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Objective[]>('/mentor/tasks');
      setObjectiveQueue(data);
    } catch (error) {
      toast.error('Error en la sincronización de objetivos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjectives();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await apiClient.put(`/mentor/tasks/${id}/status`, { status: 'APPROVED' });
      toast.success('¡Objetivo validado! XP desplegada.');
      fetchObjectives();
    } catch (error) {
      toast.error('Error en la validación táctica');
    }
  };

  const filteredQueue = objectiveQueue.filter(objective => {
    const matchesFilter = filter === 'ALL' || objective.status === filter;
    const matchesSearch = 
      objective.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      objective.menteeName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const tacticalStats = {
    total: objectiveQueue.length,
    pending: objectiveQueue.filter(t => t.status === 'SUBMITTED').length,
    completed: objectiveQueue.filter(t => t.status === 'APPROVED').length,
  };

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Unidad de Gestión de Objetivos</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            Objetivos <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">& Tareas</span>
          </h1>
          <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.25em] opacity-60 italic leading-relaxed">
            Supervisa el despliegue táctico de tus alumnos. Valida entregas de alto impacto y asigna recompensas de experiencia en tiempo real.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-[18px] text-[8px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-indigo-100 hover:bg-indigo-600 active:scale-95 group italic border border-white/10"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-500" /> 
          Nuevo Objetivo
        </button>
      </header>

      {/* Tactical Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'OBJETIVOS TOTALES', value: tacticalStats.total, unit: 'OPERACIONES', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
          { label: 'POR REVISAR', value: tacticalStats.pending, unit: 'PENDIENTES', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50/50' },
          { label: 'VALIDADOS', value: tacticalStats.completed, unit: 'ÉXITOS', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
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

      {/* Tactical Control Bar */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white/30 backdrop-blur-xl p-4 rounded-[24px] border border-white shadow-soft">
        <div className="relative group w-full xl:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="RASTREAR OBJETIVO O ALUMNO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-[18px] text-[8.5px] font-black text-slate-900 outline-none focus:border-indigo-600/20 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner uppercase tracking-[0.2em] italic placeholder:text-slate-300" 
          />
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-slate-50/50 rounded-[18px] border border-slate-100/50 overflow-x-auto w-full xl:w-auto">
          {['ALL', 'PENDING', 'SUBMITTED', 'APPROVED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-[14px] text-[8px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap italic ${
                filter === status 
                  ? 'bg-slate-900 text-white shadow-xl' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white'
              }`}
            >
              {status === 'ALL' ? 'TODO' : status === 'PENDING' ? 'PENDIENTE' : status === 'SUBMITTED' ? 'EN REVISIÓN' : 'APROBADO'}
            </button>
          ))}
        </div>
      </div>

      {/* Objective Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 border-[4px] border-indigo-50 border-t-indigo-600 rounded-full animate-spin shadow-2xl" />
            <p className="text-[9px] text-slate-400 font-black tracking-[0.35em] uppercase animate-pulse italic">Sincronizando Inteligencia...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="col-span-full py-16 text-center glass-card bg-white/40 backdrop-blur-md rounded-[24px] border border-white flex flex-col items-center space-y-4 shadow-soft">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 rotate-12 shadow-inner group hover:rotate-0 transition-transform duration-700">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Sector Despejado</h3>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.25em] opacity-60 italic">No se detectan objetivos en los parámetros actuales.</p>
            </div>
          </div>
        ) : (
          filteredQueue.map((objective) => (
            <div 
              key={objective.id} 
              onClick={() => router.push(`/dashboard/tasks/${objective.id}`)}
              className="group glass-card bg-white/70 hover:bg-white border border-white rounded-[24px] p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 cursor-pointer transition-all duration-700 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity duration-1000">
                 <Target className="w-24 h-24 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              </div>
              
              <div className="relative z-10 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-[7.5px] font-black uppercase tracking-[0.25em] border italic ${
                    objective.priority === 'URGENT' ? 'bg-red-50 text-red-600 border-red-100 shadow-sm animate-pulse' :
                    objective.priority === 'HIGH' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {objective.priority}
                  </div>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/dashboard/clients/${objective.assigneeId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-3 mb-4 p-3 bg-slate-50/50 border border-slate-100 rounded-[18px] group-hover:bg-white transition-all hover:border-indigo-200 hover:shadow-md cursor-pointer w-full text-left"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center font-black text-[9px] shadow-2xl shadow-slate-200 uppercase italic">
                    {avatarsCache[objective.assigneeId]?.avatarUrl ? (
                      <img 
                        src={avatarsCache[objective.assigneeId].avatarUrl?.startsWith('http') ? avatarsCache[objective.assigneeId].avatarUrl : `/avatars/${avatarsCache[objective.assigneeId].avatarUrl}`} 
                        alt={objective.menteeName || 'M'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center">
                        {objective.menteeName?.charAt(0).toUpperCase() || 'M'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mb-0.5 italic">ACTIVO</p>
                    <p className="text-[10.5px] font-black text-slate-900 uppercase tracking-tight italic">{objective.menteeName || 'ALUMNO QUANTIC'}</p>
                  </div>
                </Link>

                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-3 group-hover:text-indigo-600 transition-colors">
                  {objective.title}
                </h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] line-clamp-2 mb-4 leading-relaxed opacity-60 h-9 italic">
                  {objective.description || 'SIN ESPECIFICACIONES TÉCNICAS DEL OBJETIVO.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-2 text-[8px] font-black text-indigo-600 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-widest shadow-sm italic">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    +{objective.xpReward} XP
                  </div>
                  <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-100 uppercase tracking-widest shadow-sm italic">
                    <Calendar className="w-3.5 h-3.5 text-slate-300" />
                    {objective.dueDate ? format(new Date(objective.dueDate), 'dd MMM', { locale: es }).toUpperCase() : 'S/F'}
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-slate-100/50 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-black text-slate-300 uppercase tracking-[0.25em] mb-0.5 italic leading-none">ESTADO ACTUAL</span>
                  <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] italic ${
                    objective.status === 'APPROVED' ? 'text-emerald-600' :
                    objective.status === 'SUBMITTED' ? 'text-indigo-600' :
                    'text-slate-400'
                  }`}>
                    {objective.status === 'SUBMITTED' && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]" />}
                    {objective.status === 'APPROVED' ? 'VALIDADO' : objective.status === 'SUBMITTED' ? 'POR REVISAR' : 'EN PROGRESO'}
                  </div>
                </div>

                {objective.status === 'SUBMITTED' ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleApprove(objective.id); }}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-[18px] text-[8.5px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn italic"
                  >
                    VALIDAR
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-500" />
                  </button>
                ) : objective.status === 'APPROVED' ? (
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-2xl shadow-emerald-100 border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <ObjectiveFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchObjectives}
      />
    </div>
  );
}
