'use client';

import React, { useState, useEffect } from 'react';
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
  Settings,
  MoreVertical,
  Loader2,
  Plus
} from 'lucide-react';
import { contactsService, Contact } from '@/features/crm/services/contacts.service';
import { crmService, Interaction, Review } from '@/features/crm/services/crm.service';
import { BookingModal } from '@/features/agenda/components/BookingModal';
import { useAuth } from '@/core/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import gsap from 'gsap';

export default function StudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'programs' | 'reviews'>('timeline');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<any>({});
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (!loading && contact) {
      const ctx = gsap.context(() => {
        gsap.from('.tactical-expediente', {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
        gsap.from('.tactical-tab-content', {
          opacity: 0,
          y: 20,
          duration: 0.5,
          delay: 0.5
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, contact]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentId = (Array.isArray(id) ? id[0] : id) as string;
      const [contactData, interData, revData] = await Promise.all([
        contactsService.getContactById(studentId),
        crmService.getInteractions(studentId),
        crmService.getReviews?.(studentId) || Promise.resolve([])
      ]);
      
      setContact(contactData);
      setInteractions(interData || []);
      setReviews(revData || []);
    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Estudiante no encontrado</h2>
        <button 
          onClick={() => router.push('/dashboard/clients')}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation & Tactical Actions */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <button 
          onClick={() => router.push('/dashboard/clients')}
          className="group flex items-center gap-4 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-[0.25em] italic"
        >
          <div className="w-10 h-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Regresar al Directorio
        </button>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <button className="flex-1 md:flex-none p-5 bg-white border border-slate-100 rounded-[24px] text-slate-400 hover:text-indigo-600 hover:shadow-xl transition-all active:scale-95">
             <Settings className="w-5 h-5" />
           </button>
           <button className="flex-1 md:flex-none flex items-center justify-center gap-4 px-8 py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 italic border border-white/10 group">
             Operaciones <MoreVertical className="w-5 h-5 group-hover:rotate-90 transition-transform" />
           </button>
        </div>
      </header>

      {/* Profile Tactical Expediente */}
      <div className="tactical-expediente glass-card bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-soft overflow-hidden group">
        <div className="p-10 lg:p-14 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000">
             <TrendingUp className="w-64 h-64 text-indigo-600 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
          </div>

          <div className="w-40 h-40 rounded-[32px] bg-white border-4 border-white shadow-2xl flex items-center justify-center text-6xl font-black text-indigo-200 relative z-10 group-hover:scale-105 transition-transform duration-700">
            {contact.avatarUrl ? (
              <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full object-cover rounded-[28px]" />
            ) : (
              <span className="italic">{contact.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <div className="flex-1 text-center lg:text-left relative z-10">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
              <span className="px-5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black border border-emerald-100 uppercase tracking-[0.25em] italic shadow-sm">Protocolo Activo</span>
              <span className="px-5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black border border-indigo-100 uppercase tracking-[0.25em] italic shadow-sm">Quantum Premium</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none italic mb-6">
              {contact.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 mt-4">
              <div className="flex items-center gap-3 text-slate-400 group/item">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center group-hover/item:text-indigo-600 group-hover/item:shadow-md transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest italic">{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-3 text-slate-400 group/item">
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center group-hover/item:text-indigo-600 group-hover/item:shadow-md transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest italic">{contact.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-slate-400 group/item">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center group-hover/item:text-indigo-600 group-hover/item:shadow-md transition-all">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest italic">Activo desde {new Date(contact.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full lg:w-72 relative z-10">
            <button 
              onClick={() => {
                setBookingInitialData({ 
                  title: `Sesión de Seguimiento: ${contact.name}`,
                  guestIds: [contact.id],
                  contacts: [contact]
                });
                setShowBookingModal(true);
              }}
              className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-300 active:scale-95 italic border border-white/10 group/btn"
            >
              <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
              Agendar Sesión
            </button>
            <button className="w-full py-5 bg-white border border-slate-200 text-slate-900 rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95 italic shadow-sm">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Enviar Mensaje
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-100/50 bg-slate-50/30">
          {[
            { label: 'Interacciones', value: interactions.length, icon: History },
            { label: 'Satisfacción', value: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) : '4.9', icon: TrendingUp },
            { label: 'Programas', value: '1', icon: BookOpen },
            { label: 'Asistencia', value: '94%', icon: CalendarIcon },
          ].map((stat, i) => (
            <div key={i} className={`p-10 flex flex-col items-center justify-center gap-3 group/stat ${i !== 3 ? 'border-r border-slate-100/50' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover/stat:text-indigo-600 group-hover/stat:scale-110 group-hover/stat:shadow-md transition-all duration-500">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] italic mb-1 opacity-60">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Tactical Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-10">
          <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-soft overflow-hidden">
            <div className="flex items-center gap-10 border-b border-slate-100/50 px-10 overflow-x-auto scrollbar-hide">
              {[
                { id: 'timeline', label: 'Historial Operativo', icon: History },
                { id: 'programs', label: 'Ruta de Aprendizaje', icon: BookOpen },
                { id: 'reviews', label: 'Métricas de Feedback', icon: MessageSquare },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-8 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative whitespace-nowrap italic flex items-center gap-3 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600 animate-pulse' : 'text-slate-300'}`} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-10 min-h-[500px] tactical-tab-content">
              {activeTab === 'timeline' && (
                <div className="space-y-10 relative">
                  <div className="absolute left-[31px] top-4 bottom-4 w-px bg-slate-100" />
                  {interactions.length > 0 ? (
                    interactions.map((interaction, i) => (
                      <div key={interaction.id} className="flex gap-10 group/row relative z-10">
                        <div className="w-16 h-16 rounded-[20px] bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover/row:scale-110 group-hover/row:text-indigo-600 group-hover/row:shadow-xl transition-all duration-500">
                          <History className="w-6 h-6" />
                        </div>
                        <div className="flex-1 bg-slate-50/50 p-6 rounded-[24px] border border-transparent group-hover/row:border-white group-hover/row:bg-white transition-all duration-500 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight italic group-hover/row:text-indigo-600 transition-colors">{interaction.action}</p>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{new Date(interaction.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed italic opacity-70">Registro automático de operación en el ecosistema Quantic.</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                      <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center shadow-inner">
                         <History className="w-12 h-12" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Sin registros de actividad</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'programs' && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="p-8 bg-slate-900 rounded-[32px] border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-indigo-600 transition-all duration-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                       <BookOpen className="w-32 h-32 text-white -rotate-12" />
                    </div>
                    <div className="flex items-center gap-8 relative z-10">
                      <div className="w-16 h-16 rounded-[20px] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-white uppercase tracking-tighter italic mb-1">Mentoría Elite v2.0</p>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] italic">Módulo actual: Estrategia Táctica</p>
                      </div>
                    </div>
                    <ChevronRight className="w-8 h-8 text-white/20 group-hover:text-white transition-all group-hover:translate-x-2" />
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.id} className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 group/review">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-3 h-3 rounded-full shadow-sm ${i < (review.rating || 0) ? 'bg-amber-400' : 'bg-slate-100'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-black text-slate-700 leading-relaxed italic opacity-80 group-hover/review:opacity-100 transition-opacity">"{review.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                      <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center shadow-inner">
                         <MessageSquare className="w-12 h-12" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Sin reseñas registradas</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-10">
          <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-soft p-10 group overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/5 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 italic opacity-60">Responsable Operativo</h3>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-xl font-black text-white uppercase italic shadow-xl border-2 border-white">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">Mentor Principal Aura</p>
              </div>
            </div>
            <button className="w-full mt-10 py-5 bg-slate-50 border border-slate-100 text-slate-600 rounded-[24px] text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white hover:shadow-xl transition-all flex items-center justify-center gap-4 italic active:scale-95 group/btn">
              <TrendingUp className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              Reporte de Avance
            </button>
          </div>

          <div className="bg-slate-900 rounded-[40px] shadow-2xl p-10 relative overflow-hidden group">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
            
            <h3 className="text-white text-3xl font-black mb-4 relative z-10 italic uppercase tracking-tighter">¿Soporte Táctico?</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed mb-10 relative z-10 italic">
              Si detectas inconsistencias en el progreso del estudiante o requieres asistencia de nivel superior.
            </p>
            <button className="w-full py-6 bg-white text-slate-900 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all relative z-10 italic shadow-xl active:scale-95">
              Contactar Soporte Aura
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
    </div>
  );
}
