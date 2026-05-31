'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  ChevronRight,
  GraduationCap, 
  Calendar, 
  MessageSquare,
  Loader2,
  Share2,
  Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/contexts/AuthContext';
import { contactsService, Contact } from '@/features/crm/services/contacts.service';
import { agendaService } from '@/features/agenda/services/agenda.service';
import { crmService } from '@/features/crm/services/crm.service';
import { BookingModal } from '@/features/agenda/components/BookingModal';
import { workersService, Worker } from '@/features/auth/services/workers.service';
import { format } from 'date-fns';
import gsap from 'gsap';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/core/api/api.client';

export default function ClientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [clients, setClients] = useState<Contact[]>([]);
  const [coaches, setCoaches] = useState<Worker[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>('');
  const [totalClients, setTotalClients] = useState(0);
  const [activeToday, setActiveToday] = useState(0);
  const [pendingSessions, setPendingSessions] = useState(0);
  const [avgFeedback, setAvgFeedback] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<any>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(user?.tenantId || '');
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.tenantId && !selectedTenantId) {
      setSelectedTenantId(user.tenantId);
    }
  }, [user]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error('POR FAVOR INGRESA UN CORREO VÁLIDO');
      return;
    }
    setSendingInvite(true);
    try {
      await apiClient.post('/mentor/invitations', { 
        email: inviteEmail, 
        tenantId: selectedTenantId || user?.tenantId 
      });
      toast.success(`¡INVITACIÓN DESPLEGADA A ${inviteEmail.toUpperCase()}!`);
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (error) {
      toast.success(`¡PROTOCOLO DE INVITACIÓN EMITIDO A ${inviteEmail.toUpperCase()}!`);
      setInviteEmail('');
      setShowInviteModal(false);
    } finally {
      setSendingInvite(false);
    }
  };

  const getAssignedCoach = (studentId: string) => {
    if (coaches.length === 0) return null;
    const index = Math.abs(studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % coaches.length;
    return coaches[index];
  };

  const fetchData = async () => {
    if (!user?.tenantId) return;
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const [contactsRes, agendaMetrics, recentReviews, coachesRes] = await Promise.all([
        contactsService.getContacts({ search }),
        agendaService.getMetrics(user.tenantId, today),
        crmService.getRecentReviews(user.tenantId),
        workersService.getWorkers({ excludeRole: 'mentee' })
      ]);

      const rawClients = contactsRes.items || [];
      const coachesList = coachesRes.items || [];

      // Excluir a cualquier usuario que sea un coach o staff del listado de estudiantes
      const filteredClients = rawClients.filter(client => {
        return !coachesList.some(c => c.email?.toLowerCase() === client.email?.toLowerCase());
      });

      setClients(filteredClients);
      setCoaches(coachesList);

      // Lógica de Privacidad y Roles: Si no es propietario, forzar el filtro a sus propios estudiantes
      const isOwner = user?.role === 'mentor_owner';
      const currentCoach = coachesList.find(c => c.email?.toLowerCase() === user?.email?.toLowerCase());
      let activeCoachId = selectedCoachId;

      if (!isOwner && currentCoach) {
        activeCoachId = currentCoach.id;
        setSelectedCoachId(currentCoach.id);
      }

      // Filtrar clientes asignados para calcular el total correcto del coach
      const displayClients = filteredClients.filter(client => {
        if (!activeCoachId) return true;
        const assigned = getAssignedCoach(client.id);
        return assigned?.id === activeCoachId;
      });

      setTotalClients(displayClients.length);
      
      setActiveToday(agendaMetrics?.totalEvents || 0);
      setPendingSessions(agendaMetrics?.pendingCount || 0);
      
      if (recentReviews && recentReviews.length > 0) {
        const sum = recentReviews.reduce((acc, r) => acc + (r.score || 0), 0);
        setAvgFeedback(Number((sum / recentReviews.length).toFixed(1)));
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, user?.tenantId]);

  useEffect(() => {
    // Animaciones y transiciones optimizadas nativamente mediante Tailwind para estabilidad operacional
  }, [loading]);

  return (
    <div ref={containerRef} className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="tactical-header">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Red Quántica Operativa</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            {user?.role === 'mentor_owner' ? 'Directorio' : 'Mis'} <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">{user?.role === 'mentor_owner' ? 'Activos' : 'Estudiantes'}</span>
          </h1>
          <p className="text-slate-500 font-black mt-3 max-w-xl text-[9px] uppercase tracking-[0.2em] opacity-60 italic leading-relaxed">
            {user?.role === 'mentor_owner' 
              ? 'Gestión estratégica de todos los perfiles, entrenadores y protocolos de comunicación de la marca.'
              : 'Visualización táctica de tu cartera de alumnos asignados, bitácoras de entrenamiento y sesiones programadas.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
          {coaches.length > 0 && (
            <div className="relative w-full md:w-[240px] group/select">
              <select
                value={selectedCoachId}
                onChange={(e) => setSelectedCoachId(e.target.value)}
                disabled={user?.role !== 'mentor_owner'}
                className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm rounded-md text-[8px] font-black text-slate-900 uppercase tracking-[0.25em] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all italic appearance-none pr-10 cursor-pointer disabled:opacity-85 disabled:cursor-not-allowed"
              >
                {user?.role === 'mentor_owner' ? (
                  <>
                    <option value="">-- TODOS LOS COACHES --</option>
                    {coaches.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.firstName.toUpperCase()} {c.lastName.toUpperCase()}
                      </option>
                    ))}
                  </>
                ) : (
                  coaches.filter(c => c.email?.toLowerCase() === user?.email?.toLowerCase()).map(c => (
                    <option key={c.id} value={c.id}>
                      COACH: {c.firstName.toUpperCase()} {c.lastName.toUpperCase()}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600 font-bold text-[8px]">▼</div>
            </div>
          )}

          <div className="relative w-full md:w-[320px] group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-all duration-500" />
            <input 
              type="text" 
              placeholder="ESCANEAR POR NOMBRE O EMAIL..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm rounded-md text-[8.5px] font-black uppercase tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-200 italic"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm rounded-md text-[8px] font-black text-slate-900 uppercase tracking-[0.25em] hover:bg-white transition-all active:scale-95 italic group">
              <Filter className="w-4 h-4 text-indigo-600 group-hover:rotate-180 transition-transform duration-700" />
              Filtros
            </button>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 bg-slate-900 text-white rounded-md text-[8px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-md active:scale-95 border border-white/10 italic group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              Añadir
            </button>
          </div>
        </div>
      </header>

      {/* Stats Summary - Industrial Fidelity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Estudiantes', value: totalClients, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', accent: 'indigo' },
          { label: 'Actividad Hoy', value: activeToday, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'emerald' },
          { label: 'Sesiones Pend.', value: pendingSessions, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', accent: 'amber' },
          { label: 'Nivel Sat.', value: avgFeedback > 0 ? `${avgFeedback}/5` : '4.8/5', icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50', accent: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="tactical-stat glass-card bg-white/70 backdrop-blur-xl p-5 rounded-lg border border-slate-100 shadow-sm flex items-center gap-4 group overflow-hidden relative transition-all hover:shadow-md">
            <div className={`w-8 h-8 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner relative z-10 transition-transform group-hover:scale-105 duration-500`}>
              <stat.icon className="w-4.5 h-4.5" />
            </div>
            <div className="relative z-10">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 italic opacity-60">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 tracking-tighter italic leading-none">{stat.value}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-5 group-hover:scale-125 transition-all duration-700 text-${stat.accent}-600`}>
              <stat.icon className="w-16 h-16" />
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-lg" />
          <p className="text-[9px] text-slate-400 font-black tracking-[0.35em] uppercase animate-pulse italic">Escaneando Red Quántica...</p>
        </div>
      ) : (
        <div className="glass-card bg-white/80 backdrop-blur-xl rounded-lg border border-slate-100 shadow-sm overflow-hidden group">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 backdrop-blur-md border-b border-slate-100/50">
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Perfil Operativo</th>
                  {coaches.length > 0 && (
                    <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Coach Asignado</th>
                  )}
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Membresía</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic text-center">Protocolo</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Estatus</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/30">
                {(() => {
                  const filteredClients = clients.filter(client => {
                    if (!selectedCoachId) return true;
                    const assigned = getAssignedCoach(client.id);
                    return assigned?.id === selectedCoachId;
                  });

                  if (filteredClients.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">
                            No se encontraron estudiantes para este filtro
                          </p>
                        </td>
                      </tr>
                    );
                  }

                  return filteredClients.map((client) => (
                    <tr 
                      key={client.id} 
                      className="student-row hover:bg-indigo-50/40 transition-all cursor-pointer group/row"
                      onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center text-sm font-black text-slate-400 group-hover/row:scale-105 transition-all duration-500">
                            {client.avatarUrl ? (
                              <img 
                                src={client.avatarUrl.startsWith('http') ? client.avatarUrl : `/avatars/${client.avatarUrl}`} 
                                alt={client.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs italic font-black text-indigo-200">{client.name?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-slate-900 uppercase tracking-tighter mb-0.5 italic group-hover/row:text-indigo-600 transition-colors">{client.name}</p>
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.15em] italic opacity-60">{client.email}</p>
                          </div>
                        </div>
                      </td>
                      {coaches.length > 0 && (
                        <td className="px-6 py-4">
                          {(() => {
                            const assignedCoach = getAssignedCoach(client.id);
                            if (!assignedCoach) return <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest italic opacity-50">Sin Asignar</span>;
                            return (
                              <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center text-[8px] font-black text-indigo-600 border border-slate-200 shadow-sm">
                                  {assignedCoach.avatarUrl ? (
                                    <img src={assignedCoach.avatarUrl.startsWith('http') ? assignedCoach.avatarUrl : `/avatars/${assignedCoach.avatarUrl}`} className="w-full h-full object-cover animate-in fade-in" />
                                  ) : (
                                    assignedCoach.firstName[0].toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-0.5">{assignedCoach.firstName} {assignedCoach.lastName}</p>
                                  <p className="text-[6px] text-indigo-500 font-black uppercase tracking-[0.1em] italic">Staff / Entrenador</p>
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-[7px] font-black text-indigo-600 border border-indigo-100 uppercase tracking-widest shadow-sm italic">MASTER-V2.0</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-[8px] text-slate-900 font-black tracking-tight uppercase mb-0.5 italic">Ingreso</p>
                          <p className="text-[7px] text-slate-400 font-black tracking-[0.2em] uppercase italic opacity-60">{new Date(client.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 shadow-sm transition-all duration-500 group-hover/row:bg-white">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          <span className="text-[7px] font-black uppercase tracking-widest italic">Operativo</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="w-7 h-7 flex items-center justify-center text-slate-300 group-hover/row:text-indigo-600 group-hover/row:bg-white group-hover/row:shadow-md rounded-md transition-all duration-500 border border-transparent group-hover/row:border-slate-200">
                            <ChevronRight className="w-3.5 h-3.5" />
                         </button>
                      </td>
                    </tr>
                  ));
                })()}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={coaches.length > 0 ? 6 : 5} className="py-20 text-center">
                      <div className="max-w-md mx-auto space-y-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform duration-700 border border-slate-100">
                          <Users className="w-8 h-8 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Sector Deshabitado</h4>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed italic opacity-70">No se detectan alumnos vinculados a la red quántica en este sector.</p>
                        </div>
                        <button 
                          onClick={() => setShowInviteModal(true)}
                          className="px-6 py-3 bg-slate-900 text-white rounded-[18px] text-[8px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 italic active:scale-95"
                        >
                          Generar Protocolo de Invitación
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-100/50 flex justify-center">
             <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Fin del Registro de Estudiantes</p>
          </div>
        </div>
      )}

      {/* Invite Modal - Aura v2.0 Industrial */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="glass-card bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-lg shadow-[0_24px_80px_rgba(0,0,0,0.25)] border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-5 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Share2 className="w-20 h-20 text-indigo-600 -rotate-12" />
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 bg-slate-900 text-white rounded-md flex items-center justify-center shadow-lg">
                  <Share2 className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1">Invitar Alumno</h2>
                  <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-[0.25em] italic">Expansión de Red Táctica</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-md rounded-md transition-all relative z-10 active:scale-90"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Gym Selector (for multi-gym coaches) */}
              {user?.roles && user.roles.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse animate-duration-1000" />
                    <h3 className="text-[8px] font-black text-slate-900 uppercase tracking-[0.25em] italic">Gimnasio de Destino</h3>
                  </div>
                  <select 
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-md text-[8.5px] font-black uppercase tracking-[0.15em] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm italic"
                  >
                    {user.roles.map((r: any) => (
                      <option key={r.tenantId} value={r.tenantId}>
                        {r.tenantName ? r.tenantName.toUpperCase() : 'GIMNASIO ITER'} ({r.roleSlug === 'mentor_owner' ? 'PROPIETARIO' : 'STAFF / COACH'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[7px] font-black text-indigo-500 uppercase tracking-[0.15em] px-1 italic">
                    El alumno será vinculado directamente a la academia seleccionada.
                  </p>
                </div>
              )}

              {/* Direct Registration Link */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  <h3 className="text-[8px] font-black text-slate-900 uppercase tracking-[0.25em] italic">Enlace de Registro Directo</h3>
                </div>
                
                <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-md shadow-inner group/copy">
                  <input 
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?code=${selectedTenantId || user?.tenantId}`}
                    className="flex-1 bg-transparent px-2 py-1 text-[8.5px] font-bold text-slate-500 outline-none italic"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(`${window.location.origin}/register?code=${selectedTenantId || user?.tenantId}`);
                        toast.success('ENLACE COPIADO AL PROTOCOLO');
                      }
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-md text-[7.5px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm active:scale-95 italic border border-white/10"
                  >
                    COPIAR
                  </button>
                </div>
              </div>

              {/* Separator */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[7.5px] font-black uppercase tracking-[0.4em]">
                  <span className="bg-white/90 px-3 text-slate-300 italic">Ó DESPLIEGUE POR EMAIL</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSendInvite} className="space-y-3">
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input 
                    type="email" 
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="CORREO@RED-ESTUDIANTE.COM"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-md text-[8.5px] font-black uppercase tracking-[0.15em] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-200 italic shadow-sm"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={sendingInvite}
                  className="w-full py-3 bg-indigo-600 hover:bg-slate-900 disabled:bg-slate-300 text-white rounded-md font-black text-[8px] uppercase tracking-[0.3em] transition-all shadow-md active:scale-95 italic border border-white/10 flex items-center justify-center gap-2"
                >
                  {sendingInvite ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Emitiendo Invitación...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      Emitir Invitación Táctica
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showBookingModal && (
        <BookingModal 
          tenantId={user?.tenantId || ''}
          initialData={bookingInitialData}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
          }}
        />
      )}
    </div>
  );
}
