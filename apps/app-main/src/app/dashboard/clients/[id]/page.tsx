'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Mail, 
  Phone, 
  Calendar as CalendarIcon, 
  History, 
  BookOpen, 
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Loader2,
  Plus,
  Flame,
  Award
} from 'lucide-react';
import { contactsService, Contact } from '@/features/crm/services/contacts.service';
import { crmService, Interaction, Review } from '@/features/crm/services/crm.service';
import { BookingModal } from '@/features/agenda/components/BookingModal';
import { AssignTemplateModal } from '../components/AssignTemplateModal';
import { useAuth } from '@/core/contexts/AuthContext';
import { apiClient } from '@/core/api/api.client';
import { toast } from 'react-hot-toast';
import gsap from 'gsap';

export interface CombinedTimelineItem {
  id: string;
  type: 'crm' | 'activity';
  title: string;
  description?: string;
  date: string;
}

export default function StudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'programs' | 'reviews'>('timeline');
  const [timeline, setTimeline] = useState<CombinedTimelineItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<any>({});

  const getAvatarSrc = (url?: string) => {
    if (!url) return '';
    return url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')
      ? url
      : `/avatars/${url}`;
  };

  const calculateStreak = (completions: any[]) => {
    if (!completions || completions.length === 0) return 0;
    
    const sortedDates = Array.from(
      new Set(completions.map(c => new Date(c.date || c.completedAt).toISOString().split('T')[0]))
    ).map(dStr => new Date(`${dStr}T00:00:00.000Z`)).sort((a, b) => b.getTime() - a.getTime());

    let activeStreak = 0;
    
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
        activeStreak++;
        expected.setUTCDate(expected.getUTCDate() - 1);
        expected.setUTCHours(0, 0, 0, 0);
      } else if (sortedDates[i].getTime() < expected.getTime()) {
        break;
      }
    }
    return activeStreak;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentId = (Array.isArray(id) ? id[0] : id) as string;
      
      const [contactData, interData, revData, programsData, timelineData] = await Promise.all([
        contactsService.getContactById(studentId),
        crmService.getInteractions(studentId),
        crmService.getReviews?.(studentId) || Promise.resolve([]),
        apiClient.get<any[]>('/mentor/programs').catch(() => []),
        apiClient.get<any[]>(`/mentor/progress/timeline/${studentId}`).catch(() => [])
      ]);
      
      setContact(contactData);
      setReviews(revData || []);

      const studentPrograms = (programsData || []).filter((p: any) => !p.isTemplate && p.menteeId === studentId);
      setPrograms(studentPrograms);

      const allCompletions: any[] = [];
      studentPrograms.forEach((p: any) => {
        p.phases?.forEach((phase: any) => {
          phase.milestones?.forEach((ms: any) => {
            if (Array.isArray(ms.completions)) {
              allCompletions.push(...ms.completions);
            }
          });
        });
      });
      setStreak(calculateStreak(allCompletions));

      const crmItems: CombinedTimelineItem[] = (interData || []).map((i: any) => ({
        id: i.id,
        type: 'crm',
        title: i.action || i.type || 'Nota de CRM',
        description: i.content || '',
        date: i.timestamp || i.createdAt
      }));

      const activityItems: CombinedTimelineItem[] = (timelineData || []).map((a: any) => ({
        id: a.id,
        type: 'activity',
        title: a.title || 'Actividad registrada',
        description: a.description || '',
        date: a.createdAt
      }));

      const combined = [...crmItems, ...activityItems].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTimeline(combined);

    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && contact) {
      const ctx = gsap.context(() => {
        gsap.from('.tactical-expediente', {
          y: 15,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, contact]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Estudiante no encontrado</h2>
        <button 
          onClick={() => router.push('/dashboard/clients')}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm transition-all"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'timeline', label: 'Historial', icon: History },
    { id: 'programs', label: 'Programas', icon: BookOpen },
    { id: 'reviews', label: 'Reseñas', icon: MessageSquare }
  ] as const;

  return (
    <div ref={containerRef} className="w-full p-4 lg:p-6 space-y-6">
      {/* Navigation */}
      <header className="flex items-center justify-between">
        <button 
          onClick={() => router.push('/dashboard/clients')}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all text-xs font-semibold uppercase tracking-wider"
        >
          <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center group-hover:bg-slate-50 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Regresar al Directorio
        </button>
      </header>

      {/* Profile Info Header */}
      <div className="tactical-expediente bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {contact.avatarUrl ? (
                <img src={getAvatarSrc(contact.avatarUrl)} alt={contact.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-slate-400">
                  {contact.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Details */}
            <div className="text-center lg:text-left space-y-2">
              {/* Racha badge - Oculto temporalmente
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {streak > 0 && (
                  <span className="px-2.5 py-1 rounded bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-100 flex items-center gap-1.5 animate-pulse">
                    <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
                    Racha: {streak} días
                  </span>
                )}
              </div> */}
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {contact.name}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {contact.email}
                </span>
                {contact.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {contact.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  Registrado el {new Date(contact.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-48">
            <button 
              onClick={() => {
                setBookingInitialData({ 
                  title: `Sesión de Seguimiento: ${contact.name}`,
                  guestIds: [contact.id],
                  contacts: [contact]
                });
                setShowBookingModal(true);
              }}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Agendar Sesión
            </button>
            <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Enviar Mensaje
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 gap-6 overflow-x-auto scrollbar-none">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-xs font-semibold transition-all relative whitespace-nowrap flex items-center gap-2 ${
                      isActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-300'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="tactical-tab-content">
              {activeTab === 'timeline' && (
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {timeline.length > 0 ? (
                    timeline.map((item) => (
                      <div key={item.id} className="flex gap-4 group relative z-10">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                          item.type === 'activity' 
                            ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                            : 'bg-slate-50 border-slate-150 text-slate-500'
                        }`}>
                          {item.type === 'activity' ? <Award className="w-4 h-4" /> : <History className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 bg-slate-50/50 p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-white transition-all shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold text-slate-800">
                              {item.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(item.date).toLocaleString('es-ES', { 
                                day: '2-digit', 
                                month: 'short', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                         <History className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500">Sin registros de actividad</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'programs' && (
                <div className="space-y-4">
                  {/* Actions Header */}
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-500">Programas activos</h4>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Asignar Plantilla
                    </button>
                  </div>

                  {programs.length > 0 ? (
                    <div className="space-y-3">
                      {programs.map(program => (
                        <div 
                          key={program.id} 
                          onClick={() => router.push(`/dashboard/programs/${program.id}`)} 
                          className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between transition-all cursor-pointer shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {program.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {program.phases?.length || 0} fases · Estado: {program.status || 'Activo'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-slate-200 rounded-lg">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                         <BookOpen className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">Sin programas asignados</p>
                        <p className="text-xs text-slate-400">Asigná una plantilla para dar inicio a su plan de hábitos.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.id} className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50/50 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < (review.rating || 0) ? 'bg-amber-400' : 'bg-slate-200'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed">"{review.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                         <MessageSquare className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500">Sin reseñas registradas</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Details */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Responsable Operativo</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center text-md font-bold text-white uppercase shadow-sm">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-500 font-medium capitalize">{user?.role || 'Coach'}</p>
              </div>
            </div>
            <button className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
              <TrendingUp className="w-4 h-4" />
              Reporte de Avance
            </button>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          initialData={bookingInitialData}
          tenantId={user?.tenantId || ''}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            fetchData();
          }}
        />
      )}

      {showAssignModal && (
        <AssignTemplateModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          studentId={contact.id}
          studentName={contact.name}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
