'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Calendar as CalendarIcon, 
  History, 
  BookOpen, 
  MessageSquare,
  TrendingUp,
  Award,
  ChevronRight,
  Settings,
  MoreVertical,
  ArrowUpRight
} from 'lucide-react';
import { crmService, Interaction, Review } from '../services/crm.service';

interface Customer360Props {
  contact: any;
  isOpen: boolean;
  onClose: () => void;
  onBooking?: (contact: any) => void;
}

export const Customer360 = ({ contact, isOpen, onClose, onBooking }: Customer360Props) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'programs' | 'reviews'>('timeline');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contact) {
      fetchData();
    }
  }, [isOpen, contact]);

  const fetchData = async () => {
    if (!contact?.id) return;
    try {
      const [interData, revData] = await Promise.all([
        crmService.getInteractions(contact.id),
        crmService.getReviews?.(contact.id) || Promise.resolve([])
      ]);
      setInteractions(interData || []);
      setReviews(revData || []);
    } catch (err) {
      console.error('Error fetching customer data:', err);
    }
  };

  if (!contact) return null;

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-[450px] bg-[#0B0F1A] border-l border-white/5 shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header Section */}
        <div className="relative p-8 border-b border-white/5 bg-slate-900/20">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
              {contact.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 uppercase tracking-widest">Activo</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20 uppercase tracking-widest">Estudiante</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{contact.name}</h2>
              <p className="text-sm text-white/40 font-medium">{contact.email}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/[0.08] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500/60">SESSIONS</span>
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Interacciones</p>
              <h4 className="text-xl font-bold text-white">{interactions.length}</h4>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/[0.08] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-blue-500/60">SATISFACTION</span>
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Feedback</p>
              <h4 className="text-xl font-bold text-white">
                {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
              </h4>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Acciones Administrativas</h3>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => onBooking?.(contact)}
                className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg text-white/60 group-hover:text-white transition-colors">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Agendar Nueva Sesión</p>
                    <p className="text-[10px] text-white/30">Vincular directamente a la agenda</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all group text-left">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg text-white/60 group-hover:text-white transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Enviar Notificación</p>
                    <p className="text-[10px] text-white/30">Email de seguimiento administrativo</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all" />
              </button>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-8 border-b border-white/5">
              {[
                { id: 'timeline', label: 'Historial', icon: History },
                { id: 'programs', label: 'Cursos', icon: BookOpen },
                { id: 'reviews', label: 'Reseñas', icon: MessageSquare },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-4 text-xs font-bold transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-white/30 hover:text-white/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[200px]">
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  {interactions.length > 0 ? (
                    interactions.map(interaction => (
                      <div key={interaction.id} className="flex gap-4 group">
                        <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500/50" />
                        <div>
                          <p className="text-xs font-bold text-white mb-1">{interaction.action}</p>
                          <p className="text-[10px] text-white/30">{new Date(interaction.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Sin registros</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'programs' && (
                <div className="py-10 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Sin programas asignados</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < review.rating ? 'bg-amber-400' : 'bg-white/10'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-white/30">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-white/60 italic leading-relaxed">"{review.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Sin reseñas</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
