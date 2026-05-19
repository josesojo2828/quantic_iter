'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Flame, 
  Trophy, 
  Clock, 
  Users, 
  Layout, 
  Zap, 
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  UserPlus,
  BookOpen,
  X,
  Check
} from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import { toast } from 'react-hot-toast';
import { ProgramForm } from '../programs/components/ProgramForm';
import { contactsService, Contact } from '@/features/crm/services/contacts.service';

export default function HabitsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'templates' | 'executions'>('templates');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // States for assignment
  const [students, setStudents] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [stats, setStats] = useState({
    activeHabits: 0,
    globalStreak: '12d',
    committedMentees: 0,
    successRate: '88%'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any[]>('/mentor/programs');
      
      const habitsData = Array.isArray(response) ? response : [];
      
      const allExecutions = habitsData.filter(p => !p.isTemplate && (p.type === 'HABITS' || p.type === 'ROUTINE'));
      const uniqueMentees = new Set(allExecutions.map(e => e.menteeId)).size;
      
      setStats(prev => ({
        ...prev,
        activeHabits: allExecutions.length,
        committedMentees: uniqueMentees,
      }));

      const filtered = habitsData.filter(p => {
        const isHabit = p.type === 'HABITS' || p.type === 'ROUTINE';
        return activeTab === 'templates' 
          ? (p.isTemplate && isHabit)
          : (!p.isTemplate && isHabit);
      });
      
      setData(filtered);

      if (activeTab === 'templates') {
        setTemplates(filtered);
      } else {
        const allTemplates = habitsData.filter(p => p.isTemplate && (p.type === 'HABITS' || p.type === 'ROUTINE'));
        setTemplates(allTemplates);
      }
    } catch (error) {
      toast.error('Error al cargar datos de hábitos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await contactsService.getContacts({});
      setStudents(res.items || []);
    } catch (error) {
      console.error('Error fetching students', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStudents();
  }, [activeTab]);

  const handleCreateHabitTemplate = async (formData: any) => {
    try {
      await apiClient.post('/mentor/programs', { ...formData, isTemplate: true });
      toast.success('Plantilla de hábito creada');
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Error al crear la plantilla');
    }
  };

  const handleAssignHabit = async () => {
    if (!selectedTemplateId || !selectedStudentId) {
      toast.error('Selecciona una plantilla y un estudiante');
      return;
    }

    try {
      setAssigning(true);
      const template = await apiClient.get<any>(`/mentor/programs/${selectedTemplateId}`);
      
      const payload = {
        name: template.name,
        description: template.description,
        type: 'HABITS',
        duration: template.duration || '30 d',
        isTemplate: false,
        menteeId: selectedStudentId,
        phases: template.phases?.map((p: any) => ({
          name: p.name,
          order: p.order,
          milestones: p.milestones?.map((m: any) => ({
            title: m.title || m.name,
            description: m.description,
            points: m.points || m.xpReward || 500,
            isHabit: true,
            order: m.order
          }))
        }))
      };

      await apiClient.post('/mentor/programs', payload);
      toast.success('Hábito asignado correctamente');
      setIsAssignModalOpen(false);
      setSelectedTemplateId('');
      setSelectedStudentId('');
      fetchData();
    } catch (error) {
      toast.error('Error al asignar el hábito');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProgramForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateHabitTemplate}
        defaultIsTemplate={true}
      />

      {/* Assign Habit Modal - Aura v2.0 */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="glass-card bg-white/90 backdrop-blur-2xl w-full max-w-lg rounded-[24px] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-6 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1">Asignar Hábito</h2>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocolo de Consistencia</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                  Estudiante Destino
                </label>
                <select 
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[18px] text-[8px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">SELECCIONAR ALUMNO...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{(s.name || s.firstName || 'Sin Nombre').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                  <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                  Arquitectura de Hábito
                </label>
                <select 
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[18px] text-[8px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">SELECCIONAR PLANTILLA...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{(t.name || 'Sin Nombre').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-[20px] flex items-start gap-3">
                 <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                   <Zap className="w-4 h-4" />
                 </div>
                 <p className="text-[8px] text-indigo-900/60 font-black uppercase tracking-widest leading-relaxed">
                   Se creará una instancia personalizada. Podrás monitorear la <span className="text-indigo-600">consistencia técnica</span> del alumno desde su centro de control.
                 </p>
              </div>
            </div>

            <div className="p-6 flex gap-3 pt-3 border-t border-slate-100/50 bg-slate-50/20">
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="flex-1 px-4 py-3 border border-slate-100 text-slate-400 rounded-[18px] font-black text-[8px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all italic"
              >
                Abordar
              </button>
              <button 
                onClick={handleAssignHabit}
                disabled={assigning || !selectedTemplateId || !selectedStudentId}
                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-[18px] font-black text-[8px] uppercase tracking-[0.25em] hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 italic"
              >
                {assigning ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Ingeniería de Comportamiento Quántico</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">Hábitos</span>
          </h1>
          <p className="text-slate-500 font-black mt-3 max-w-xl text-[9px] uppercase tracking-[0.2em] opacity-60 italic leading-relaxed">
            {activeTab === 'templates' 
              ? 'Diseña arquitecturas de comportamiento industrial. Define los protocolos de éxito que tus activos deben integrar.'
              : 'Supervisa rachas y cumplimiento táctico en tiempo real. La consistencia es el motor de la transformación.'}
          </p>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          {activeTab === 'templates' ? (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-[18px] text-[8px] font-black uppercase tracking-[0.25em] hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 active:scale-95 border border-white/10 italic group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              Diseñar Protocolo
            </button>
          ) : (
            <button 
              onClick={() => setIsAssignModalOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-[18px] text-[8px] font-black uppercase tracking-[0.25em] hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100 active:scale-95 border border-white/10 italic group"
            >
              <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-500" />
              Desplegar Hábito
            </button>
          )}
        </div>
      </header>

      {/* Control Bar - Tabs System */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/40 backdrop-blur-md rounded-[18px] border border-white shadow-inner w-full md:w-fit">
        <button 
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-2 rounded-[12px] text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'templates' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
        >
          Mis Plantillas
        </button>
        <button 
          onClick={() => setActiveTab('executions')}
          className={`px-6 py-2 rounded-[12px] text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'executions' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
        >
          Hábitos en Curso
        </button>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'HÁBITOS ACTIVOS', value: stats.activeHabits, unit: 'SISTEMAS', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
          { label: 'RACHA GLOBAL', value: stats.globalStreak, unit: 'LOGRADA', icon: Flame, color: 'text-amber-500', bg: 'bg-amber-50/50' },
          { label: 'ACTIVOS COMPROMETIDOS', value: stats.committedMentees, unit: 'USUARIOS', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { label: 'TASA DE ÉXITO', value: stats.successRate, unit: 'GLOBAL', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50/50' },
        ].map((stat, i) => (
          <div key={i} className="glass-card bg-white/70 backdrop-blur-xl p-6 rounded-[24px] border border-white shadow-soft group hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-700 relative overflow-hidden">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500 shadow-inner border border-white relative z-10`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1.5 opacity-60 italic">{stat.label}</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{stat.value}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{stat.unit}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="glass-card bg-white/60 backdrop-blur-xl rounded-[24px] border border-white p-6 lg:p-8 shadow-soft min-h-[400px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/[0.03] blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-indigo-500/[0.05] transition-all duration-1000" />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-lg" />
            <p className="text-[9px] text-slate-400 font-black tracking-[0.25em] uppercase animate-pulse">Analizando Red de Hábitos...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto relative z-10 space-y-6">
            <div className="relative group/icon">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="w-24 h-24 bg-white/80 rounded-[24px] flex items-center justify-center relative z-10 shadow-soft border border-white rotate-12 group-hover/icon:rotate-0 transition-transform duration-700">
                <Sparkles className="w-12 h-12 text-indigo-300" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Lienzo en Reposo</h3>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed opacity-70">
                {activeTab === 'templates' 
                  ? 'Empieza diseñando una arquitectura de hábitos para tus alumnos de élite.'
                  : 'No se detectan ejecuciones de hábitos activas en este momento.'}
              </p>
            </div>
            {activeTab === 'templates' && (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="px-8 py-4 bg-slate-900 text-white rounded-[18px] text-[8px] font-black uppercase tracking-[0.25em] hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 italic"
              >
                Crear Estructura de Hábito
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
            {data.map((item) => (
              <div 
                key={item.id} 
                className="glass-card bg-white/70 hover:bg-white border border-white p-6 rounded-[24px] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity duration-1000">
                   <Zap className="w-24 h-24 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                </div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className={`px-3 py-1.5 rounded-full text-[7px] font-black uppercase tracking-[0.2em] shadow-sm border italic ${
                    item.mentee ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {item.mentee ? 'OPERATIVO' : 'PROTOCOLO'}
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center text-slate-200 group-hover:text-indigo-400 transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
 
                <div className="mb-6 flex-1 relative z-10">
                   <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:rotate-6 transition-all duration-700 shadow-xl shadow-slate-200">
                     <Layers className="w-5 h-5" />
                   </div>
                   <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-3 group-hover:text-indigo-600 transition-colors">
                     {item.name}
                   </h4>
                   {item.mentee && (
                     <div className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full w-fit">
                       <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                       <span className="text-[8px] font-black text-slate-900 uppercase tracking-[0.2em] italic">{item.mentee.name}</span>
                     </div>
                   )}
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] line-clamp-2 leading-relaxed opacity-60 h-8 italic">
                     {item.description || 'SIN ESPECIFICACIONES TÉCNICAS DEL HÁBITO.'}
                   </p>
                </div>
 
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100/50 mb-6 relative z-10 bg-slate-50/30 -mx-6 px-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight italic">{item.duration || '30D'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight italic">{item.phases?.[0]?.milestones?.length || 0} HÁBITOS</span>
                  </div>
                </div>
 
                <button 
                  onClick={() => router.push(`/dashboard/programs/${item.id}?from=habits`)}
                  className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-[18px] text-[8px] font-black uppercase tracking-[0.25em] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-soft group/btn relative z-10 italic"
                >
                  {item.mentee ? 'Supervisar Racha' : 'Configurar Protocolo'}
                  <ChevronRight className="w-4 h-4 inline-block ml-1.5 group-hover/btn:translate-x-1.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
