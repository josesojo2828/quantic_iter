'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  UserPlus, 
  Trash2, 
  Settings,
  ChevronRight,
  Filter,
  LayoutGrid,
  List as ListIcon,
  X
} from 'lucide-react';
import gsap from 'gsap';
import { apiClient } from '@/core/api/api.client';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Contact, contactsService } from '@/features/crm/services/contacts.service';

interface Group {
  id: string;
  name: string;
  description: string | null;
  status: string;
  members?: { id: string, menteeId: string }[];
  _count?: {
    members: number;
  };
  createdAt: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [avatarsCache, setAvatarsCache] = useState<Record<string, { name: string, avatarUrl?: string }>>({});

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      loadAvatars();
    }
  }, [groups]);

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get<Group[]>('/mentor/groups');
      setGroups(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('No se pudieron cargar los grupos');
    } finally {
      setLoading(false);
    }
  };

  const loadAvatars = async () => {
    const allMenteeIds = Array.from(new Set(
      groups.flatMap(g => g.members?.map(m => m.menteeId) || [])
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
      console.error('Error loading avatars:', err);
    }
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  const getBgColor = (name: string) => {
    const colors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name.trim()) return;

    try {
      const response = await apiClient.post<Group>('/mentor/groups', newGroup);
      setGroups([response, ...groups]);
      setIsCreateModalOpen(false);
      setNewGroup({ name: '', description: '' });
      toast.success('Grupo creado exitosamente');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Error al crear el grupo');
    }
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <span className="text-[8.5px] font-black uppercase tracking-[0.25em] text-slate-400 italic">Administración Académica</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">Cohortes</span>
          </h1>
          <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.25em] opacity-60 italic leading-relaxed">
            Organización técnica de grupos y control de acceso quántico para estudiantes.
          </p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[16px] text-[8.5px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-indigo-200 active:scale-95 border border-indigo-400/30 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Nuevo Grupo
        </button>
      </header>

      {/* Control Bar - High Fidelity Filters */}
      <div className="glass-card bg-white/60 backdrop-blur-xl p-3 rounded-[20px] border border-white shadow-soft flex flex-col xl:flex-row items-center justify-between gap-3">
        <div className="relative w-full xl:w-[350px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            placeholder="BUSCAR COHORTE O PROGRAMA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-slate-100/50 rounded-[12px] text-[8.5px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-200"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button className="flex-1 xl:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white border border-slate-100 rounded-[12px] text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm">
            <Filter className="w-3.5 h-3.5" />
            Protocolos de Filtro
          </button>
          <div className="hidden xl:block w-px h-6 bg-slate-100 mx-1"></div>
          <div className="flex bg-slate-50/50 p-1 rounded-[12px] border border-slate-100 shadow-inner">
            <button className="p-2 text-indigo-600 bg-white shadow-lg rounded-[8px] transition-all">
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button className="p-2 text-slate-300 hover:text-slate-900 rounded-[8px] transition-all">
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-lg" />
            <p className="text-[8px] text-slate-400 font-black tracking-[0.3em] uppercase animate-pulse">Analizando Red de Estudiantes...</p>
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <div 
                key={group.id}
                className="glass-card bg-white/70 backdrop-blur-xl rounded-[24px] border border-white p-6 shadow-soft hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 flex flex-col group relative overflow-hidden"
              >
                {/* Decoration Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.02] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />

                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <button className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-white rounded-lg transition-all shadow-sm">
                    <MoreVertical className="w-4.5 h-4.5" />
                  </button>
                </div>
                
                <div className="space-y-2 mb-6 flex-1 relative z-10">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic leading-tight line-clamp-2">
                    {group.name}
                  </h3>
                  <p className="text-[8.5px] text-slate-400 font-black uppercase tracking-[0.1em] line-clamp-2 leading-relaxed opacity-80 h-8">
                    {group.description || 'Sin descripción técnica del grupo.'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100/50 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {group.members && group.members.length > 0 ? (
                        group.members.slice(0, 3).map((member, i) => {
                          const cached = avatarsCache[member.menteeId];
                          return (
                            <div key={member.id} className="relative group/avatar">
                              <div className="w-7 h-7 rounded-full border-1.5 border-white overflow-hidden shadow-md group-hover/avatar:-translate-y-1 transition-transform">
                                {cached?.avatarUrl ? (
                                  <img 
                                    src={cached.avatarUrl.startsWith('http') ? cached.avatarUrl : `/avatars/${cached.avatarUrl}`} 
                                    alt={cached.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center text-[7px] font-black ${cached ? getBgColor(cached.name) : 'bg-slate-100 text-slate-400'}`}>
                                    {cached ? getInitial(cached.name) : 'U'}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="w-7 h-7 rounded-full border border-dashed border-slate-100 flex items-center justify-center text-[6px] text-slate-300 font-black uppercase tracking-tighter">
                          EMPTY
                        </div>
                      )}
                      {group._count && group._count.members > 3 && (
                        <div className="w-7 h-7 rounded-full bg-slate-900 border-1.5 border-white flex items-center justify-center text-[7px] font-black text-white shadow-md">
                          +{group._count.members - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8.5px] font-black text-slate-900 tracking-tighter leading-none">
                        {group._count?.members || 0} MIEMBROS
                      </span>
                      <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Capacidad Activa</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/dashboard/groups/${group.id}`}
                    className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-indigo-600 hover:bg-white hover:shadow-lg rounded-xl transition-all duration-500"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card bg-white/50 backdrop-blur-xl rounded-[24px] border border-white/50 p-10 shadow-soft text-center space-y-4 overflow-hidden relative">
            <div className="w-16 h-16 bg-white rounded-[20px] flex items-center justify-center shadow-soft mx-auto mb-4 border border-slate-50">
              <Users className="w-6 h-6 text-slate-200" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Academia en Reposo</h2>
              <p className="text-[8.5px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed opacity-70 italic">
                No se detectan cohortes activas. Inicia la expansión creando tu primer grupo de mentoría de élite.
              </p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-[16px] text-[8.5px] font-black uppercase tracking-[0.25em] hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 italic"
            >
              Crear Nueva Cohorte
            </button>
          </div>
        )}
      </div>

      {/* Create Modal - Aura v2.0 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="glass-card bg-white/90 backdrop-blur-2xl w-full max-w-lg rounded-[24px] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-5 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl shadow-indigo-200">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-0.5">Nueva Cohorte</h2>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Protocolo de Expansión</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="p-5 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-1.5 px-1">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                    Nombre del Grupo
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="EJ. QUANTUM ELITE - COHORTE 2024"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[14px] text-[8.5px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-200"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-1.5 px-1">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                    Descripción Técnica
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="DETALLA EL ALCANCE OPERATIVO DEL GRUPO..."
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[14px] text-[8.5px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder:text-slate-200"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-5 py-3 border border-slate-100 text-slate-400 rounded-[14px] font-black text-[8.5px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 italic"
                >
                  Abordar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-5 py-3 bg-slate-900 text-white rounded-[14px] font-black text-[8.5px] uppercase tracking-[0.25em] hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 italic"
                >
                  Confirmar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

