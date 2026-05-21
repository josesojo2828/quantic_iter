'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Plus, Filter, Activity, BarChart3, Clock, Calendar, Users, Loader2, ArrowRight } from 'lucide-react';
import { agendaService, AgendaEvent } from '@/features/agenda/services/agenda.service';
import { BookingModal } from '@/features/agenda/components/BookingModal';
import { TimeGrid } from '@/features/agenda/components/TimeGrid';
import { MonthlyCalendar } from '@/features/agenda/components/MonthlyCalendar';
import { useAuth } from '@/core/contexts/AuthContext';
import { format, startOfToday, addHours } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function AgendaPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [busyDates, setBusyDates] = useState<string[]>([]);
  const [upcoming, setUpcoming] = useState<AgendaEvent | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEventForModal, setSelectedEventForModal] = useState<Partial<AgendaEvent> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.glass-card', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const fetchData = async () => {
    if (!user?.tenantId) return;
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const [eventsData, metricsData, upcomingData] = await Promise.all([
        agendaService.getEvents(user.tenantId, dateStr),
        agendaService.getMetrics(user.tenantId, dateStr),
        agendaService.getUpcoming(user.tenantId)
      ]);

      setEvents(eventsData);
      setMetrics(metricsData);
      setUpcoming(upcomingData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusyDates = async (month: number, year: number) => {
    if (!user?.tenantId) return;
    try {
      const dates = await agendaService.getBusyDays(user.tenantId, month, year);
      setBusyDates(dates);
    } catch (error) {
      console.error('Error fetching busy dates:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, user?.tenantId]);

  useEffect(() => {
    if (user?.tenantId) {
      const now = new Date();
      fetchBusyDates(now.getMonth() + 1, now.getFullYear());
    }
  }, [user?.tenantId]);

  return (
    <div ref={containerRef} className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Immersive Tactical Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <span className="text-[8.5px] font-black uppercase tracking-[0.25em] text-slate-400">Control Operativo</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            Agenda <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">Maestra</span>
          </h1>
          <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.25em] opacity-60 leading-relaxed italic">
            Despliegue táctico de sesiones, mentorías y eventos del ecosistema Quantic.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white/70 backdrop-blur-xl border border-white rounded-[16px] text-[8.5px] font-black text-slate-900 uppercase tracking-widest hover:bg-white transition-all shadow-soft group">
            <Filter className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
            Filtros Tácticos
          </button>
          <button
            onClick={() => {
              const startAt = new Date(selectedDate);
              const now = new Date();
              startAt.setHours(now.getHours() + 1, 0, 0, 0);
              setSelectedEventForModal({
                start: startAt.toISOString(),
                end: addHours(startAt, 1).toISOString(),
                title: '',
                description: '',
              });
            }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-[16px] font-black text-[8.5px] uppercase tracking-[0.25em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 border border-white/10 group italic"
          >
            <Plus className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform duration-500" />
            Nuevo Despliegue
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left: Spatial Deployment Grid */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="glass-card bg-white/70 backdrop-blur-xl border border-white p-2 rounded-[24px] shadow-soft min-h-[600px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Tactical Legend */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.25em] text-slate-500 italic">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]" /> SESIONES</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]" /> LOGÍSTICA</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.5)]" /> MENTORÍA</span>
            </div>

            <div className="p-3.5 relative z-10">
              <TimeGrid
                events={events}
                date={selectedDate}
                onTimeClick={(time) => setSelectedEventForModal({ start: time.toISOString() })}
                onEventClick={(event) => setSelectedEventForModal(event)}
              />
              {loading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[20px] flex flex-col items-center justify-center z-20 gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-lg" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic animate-pulse">Actualizando Rejilla...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Operational Control Sidebar */}
        <div className="xl:col-span-4 space-y-4">
          {/* Tactical Monthly View */}
          <div className="glass-card bg-white/60 backdrop-blur-xl rounded-[24px] border border-white p-4.5 shadow-soft overflow-hidden group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <MonthlyCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              busyDates={busyDates}
              onMonthChange={(m, y) => fetchBusyDates(m, y)}
            />
            {loading && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-20">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            )}
          </div>

          {/* Current Mission - En Curso */}
          <div className="glass-card bg-slate-900 p-5 rounded-[24px] border border-white/10 shadow-2xl relative group overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full group-hover:bg-indigo-500/30 transition-all duration-1000" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-1000" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.3em] text-cyan-400 italic">
                  <div className="w-1 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
                  EN CURSO
                </h3>
                {upcoming && (
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                    <span className="text-[8px] font-black text-cyan-400 animate-pulse uppercase tracking-widest italic">LIVE</span>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
                  </div>
                )}
              </div>

              {upcoming ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 border border-white/10 shadow-inner group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105 transition-all duration-700">
                      {upcoming.groupIds && upcoming.groupIds.length > 0 ? (
                        <Users className="w-6 h-6" />
                      ) : (
                        <Calendar className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-lg tracking-tighter truncate leading-tight text-white uppercase italic mb-1">
                        {upcoming.title || (upcoming.contact ? `${upcoming.contact.firstName}` : 'Misión Activa')}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/80 italic">
                            {upcoming.start ? format(new Date(upcoming.start), 'HH:mm') : '--:--'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-white text-slate-900 rounded-[16px] font-black text-[8.5px] uppercase tracking-[0.3em] hover:bg-cyan-400 transition-all shadow-xl active:scale-95 italic flex items-center justify-center gap-2 group/btn">
                    Ver Protocolo
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-white/20 text-[8.5px] font-black uppercase tracking-[0.25em] italic">Sin misiones inminentes</p>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Logistics Metrics */}
          <div className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-soft group">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 tracking-tighter uppercase italic">Logística Hoy</h3>
              <BarChart3 className="w-4.5 h-4.5 text-indigo-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Capacidad', val: metrics?.occupancyPercentage ? `${metrics.occupancyPercentage}%` : '0%', icon: Activity, color: 'text-emerald-500' },
                { label: 'Eventos', val: metrics?.totalEvents || '0', icon: Calendar, color: 'text-cyan-500' },
                { label: 'Grupos', val: events.filter(e => e.groupIds && e.groupIds.length > 0).length, icon: Users, color: 'text-amber-500' },
                { label: 'Presupuesto', val: metrics?.estimatedRevenue ? `$${metrics.estimatedRevenue}` : '$0', icon: BarChart3, color: 'text-indigo-600' }
              ].map((m, i) => (
                <div key={i} className="flex flex-col gap-1.5 group/metric">
                  <div className="flex items-center gap-1.5">
                    <m.icon className={`w-4 h-4 ${m.color} group-hover/metric:scale-110 transition-transform`} />
                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest italic">{m.label}</span>
                  </div>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedEventForModal && user?.tenantId && (
        <BookingModal
          initialData={selectedEventForModal}
          tenantId={user.tenantId}
          onClose={() => setSelectedEventForModal(null)}
          onSuccess={() => {
            setSelectedEventForModal(null);
            fetchData();
            const d = new Date(selectedDate);
            fetchBusyDates(d.getMonth() + 1, d.getFullYear());
          }}
        />
      )}
    </div>
  );
}
