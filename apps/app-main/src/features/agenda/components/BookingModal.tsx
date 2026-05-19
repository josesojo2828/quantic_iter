'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, X, Check, Calendar, Clock, Loader2, Package, Info, ChevronRight, Users, Layers, Minus, ArrowRight } from 'lucide-react';
import { Contact, contactsService } from '@/features/crm/services/contacts.service';
import { groupsService, Group } from '@/features/crm/services/groups.service';
import { agendaService, AgendaEvent } from '@/features/agenda/services/agenda.service';
import { toast } from 'react-hot-toast';
import { format, addHours } from 'date-fns';

interface EventModalProps {
  initialData: Partial<AgendaEvent>;
  tenantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal = ({ initialData, tenantId, onClose, onSuccess }: EventModalProps) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [start, setStart] = useState(initialData.start || new Date().toISOString());
  const [end, setEnd] = useState(initialData.end || addHours(new Date(initialData.start || new Date()), 1).toISOString());
  const [date, setDate] = useState(format(new Date(start), 'yyyy-MM-dd'));
  
  const [search, setSearch] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>(initialData.guestIds && initialData.contacts ? initialData.contacts : []);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'GROUPS'>('STUDENTS');

  const startTime = format(new Date(start), 'HH:mm');
  const endTime = format(new Date(end), 'HH:mm');
  
  const [startTimeInput, setStartTime] = useState(startTime);
  const [endTimeInput, setEndTime] = useState(endTime);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await contactsService.getContacts({ search: '' });
        const allContacts = response.items || [];
        setContacts(allContacts);

        // If we have guestIds but no selectedContacts, resolve them from the list
        if (initialData.guestIds && selectedContacts.length === 0) {
          const preselected = allContacts.filter(c => initialData.guestIds?.includes(c.id));
          if (preselected.length > 0) {
            setSelectedContacts(preselected);
          }
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    fetchContacts();
  }, [initialData.guestIds]);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'STUDENTS') {
        if (search.length < 2) {
          setContacts([]);
          return;
        }
        setLoading(true);
        try {
          const { items } = await contactsService.getContacts({ search });
          setContacts(items || []);
        } catch (error) {
          console.error('Error fetching contacts:', error);
          setContacts([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          const allGroups = await groupsService.getGroups();
          if (search) {
             setGroups(allGroups.filter(g => g.name.toLowerCase().includes(search.toLowerCase())));
          } else {
             setGroups(allGroups);
          }
        } catch (error) {
          console.error('Error fetching groups:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  const toggleContact = (contact: Contact) => {
    if (selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts(prev => [...prev, contact]);
    }
  };

  const toggleGroup = (group: Group) => {
    if (selectedGroups.find(g => g.id === group.id)) {
      setSelectedGroups(prev => prev.filter(g => g.id !== group.id));
    } else {
      setSelectedGroups(prev => [...prev, group]);
    }
  };

  const handleSave = async () => {
    if (!title) {
      toast.error('Ingresá un título para el evento');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tenantId,
        title,
        description,
        start,
        end,
        guestIds: selectedContacts.map(c => c.id),
        groupIds: selectedGroups.map(g => g.id),
        status: 'CONFIRMED'
      };

      if (initialData.id) {
        await agendaService.updateEvent(initialData.id, payload);
        toast.success('Evento actualizado');
      } else {
        await agendaService.createEvent(payload);
        toast.success('¡Evento agendado con éxito!');
      }
      onSuccess();
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-[#0B0F1A] w-full max-w-2xl rounded-xl shadow-2xl border border-white/5 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {initialData.id ? 'Editar Evento' : 'Nuevo Agendamiento'}
            </h2>
            <p className="text-xs text-white/40 mt-1">Gestión administrativa de sesiones</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Event Details Section */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">Título del Evento</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre de la sesión o actividad..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">Fecha</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setDate(newDate);
                      const s = new Date(start);
                      const [y, m, d] = newDate.split('-').map(Number);
                      s.setFullYear(y, m - 1, d);
                      setStart(s.toISOString());
                      
                      const e_ = new Date(end);
                      e_.setFullYear(y, m - 1, d);
                      setEnd(e_.toISOString());
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">Inicia</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                  <input 
                    type="time" 
                    value={startTimeInput}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      const [h, m] = e.target.value.split(':').map(Number);
                      const s = new Date(start);
                      s.setHours(h, m, 0, 0);
                      setStart(s.toISOString());
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">Termina</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                  <input 
                    type="time" 
                    value={endTimeInput}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      const [h, m] = e.target.value.split(':').map(Number);
                      const e_ = new Date(end);
                      e_.setHours(h, m, 0, 0);
                      setEnd(e_.toISOString());
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invitations Section */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Invitar Participantes</label>
            
            <div className="flex p-1 bg-white/5 rounded-lg border border-white/5">
              <button 
                onClick={() => setActiveTab('STUDENTS')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold transition-all ${activeTab === 'STUDENTS' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                <User className="w-3.5 h-3.5" />
                ESTUDIANTES
              </button>
              <button 
                onClick={() => setActiveTab('GROUPS')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold transition-all ${activeTab === 'GROUPS' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                <Users className="w-3.5 h-3.5" />
                GRUPOS / COHORTES
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input 
                type="text" 
                placeholder={`Buscar ${activeTab === 'STUDENTS' ? 'por nombre o email...' : 'por nombre de grupo...'}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              
              {search.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1A1E] border border-white/10 rounded-lg shadow-2xl z-20 py-1 max-h-60 overflow-y-auto">
                  {activeTab === 'STUDENTS' ? (
                    contacts?.length > 0 ? (
                      contacts.map(c => {
                        const isSelected = selectedContacts.find(sc => sc.id === c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() => toggleContact(c)}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/5 rounded-md flex items-center justify-center text-[10px] font-bold text-white/40">
                                {c.name ? c.name.charAt(0).toUpperCase() : c.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">{c.name || 'Estudiante'}</p>
                                <p className="text-[10px] text-white/30">{c.email}</p>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-center py-4 text-white/20 text-xs">No se encontraron resultados</p>
                    )
                  ) : (
                    groups?.length > 0 ? (
                      groups.map(g => {
                        const isSelected = selectedGroups.find(sg => sg.id === g.id);
                        return (
                          <button
                            key={g.id}
                            onClick={() => toggleGroup(g)}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/5 rounded-md flex items-center justify-center">
                                <Layers className="w-4 h-4 text-white/40" />
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">{g.name}</p>
                                <p className="text-[10px] text-white/30">{g.menteesCount} Estudiantes</p>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-center py-4 text-white/20 text-xs">No se encontraron resultados</p>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedContacts.map(c => (
                <div key={c.id} className="flex items-center gap-2 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[10px] font-bold text-cyan-400">
                  {c.name || c.email.split('@')[0]}
                  <button onClick={() => toggleContact(c)}><X className="w-3 h-3" /></button>
                </div>
              ))}
              {selectedGroups.map(g => (
                <div key={g.id} className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md text-[10px] font-bold text-purple-400">
                  {g.name}
                  <button onClick={() => toggleGroup(g)}><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 block">Notas</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <button 
            onClick={onClose}
            className="text-xs font-bold text-white/30 hover:text-white transition-colors"
          >
            CANCELAR
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-white text-slate-900 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {initialData.id ? 'ACTUALIZAR EVENTO' : 'AGENDAR AHORA'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
