'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Trash2,
  ChevronRight,
  Search,
  X,
  User,
  Link as LinkIcon,
  ArrowLeft,
  Settings,
  MoreVertical,
  Plus
} from 'lucide-react';
import gsap from 'gsap';
import Link from 'next/link';
import { apiClient } from '@/core/api/api.client';
import { useAuth } from '@/core/contexts/AuthContext';
import { contactsService, Contact } from '@/features/crm/services/contacts.service';
import toast from 'react-hot-toast';

interface GroupMember {
  id: string;
  menteeId: string;
  joinedAt: string;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  status: string;
  members: GroupMember[];
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [membersInfo, setMembersInfo] = useState<Contact[]>([]);

  // Member selection
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [searchContact, setSearchContact] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const { user } = useAuth();
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchGroup();
    }
  }, [params.id]);

  useEffect(() => {
    if (!loading && group) {
      const ctx = gsap.context(() => {
        gsap.from('.tactical-group-header', {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
        gsap.from('.tactical-member-row', {
          x: -20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.4
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, group]);

  useEffect(() => {
    if (searchContact.length >= 2) {
      const timer = setTimeout(() => {
        handleSearchContacts();
      }, 400);
      return () => clearTimeout(timer);
    } else if (searchContact.length === 0) {
      setAvailableContacts([]);
    }
  }, [searchContact]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      console.log('[GroupDetail] 🔄 Fetching group info for:', params.id);
      const response = await apiClient.get<Group>(`/mentor/groups/${params.id}`);
      console.log('[GroupDetail] ✅ Group data received:', response);
      setGroup(response);

      if (response.members && response.members.length > 0) {
        console.log('[GroupDetail] 👥 Fetching info for members:', response.members);
        const membersData = await Promise.all(
          response.members.map((m: GroupMember) =>
            contactsService.getContactById(m.menteeId).catch((err) => {
              console.error(`[GroupDetail] ❌ Error fetching contact ${m.menteeId}:`, err);
              return null;
            })
          )
        );
        const filteredMembers = membersData.filter(m => m !== null) as Contact[];
        console.log('[GroupDetail] ✨ Filtered members list:', filteredMembers);
        setMembersInfo(filteredMembers);
      } else {
        console.log('[GroupDetail] ℹ️ No members in this group');
        setMembersInfo([]);
      }
    } catch (error) {
      console.error('[GroupDetail] 🔴 Error in fetchGroup:', error);
      toast.error('No se pudo cargar la información del grupo');
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationLink = () => {
    if (!group) return;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteLink = `${baseUrl}/register?tenantId=${user?.tenantId}&groupId=${group.id}`;

    navigator.clipboard.writeText(inviteLink);
    toast.success('¡Link de invitación copiado!');
  };

  const handleSearchContacts = async () => {
    if (searchContact.length < 2) return;

    setLoadingContacts(true);
    try {
      const response = await contactsService.getContacts({ search: searchContact });
      const currentMemberIds = group?.members?.map(m => m.menteeId) || [];
      const filtered = response.items.filter(c => !currentMemberIds.includes(c.id));
      setAvailableContacts(filtered);
    } catch (error) {
      console.error('Error searching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const addMember = async (menteeId: string) => {
    try {
      await apiClient.post(`/mentor/groups/${params.id}/members`, { menteeId });
      toast.success('Miembro agregado exitosamente');
      setIsAddMemberOpen(false);
      setSearchContact('');
      setAvailableContacts([]);
      fetchGroup();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Error al agregar el miembro');
    }
  };

  const removeMember = async (menteeId: string) => {
    if (!confirm('¿Estás seguro de eliminar a este estudiante del grupo?')) return;

    try {
      await apiClient.delete(`/mentor/groups/${params.id}/members/${menteeId}`);
      toast.success('Miembro eliminado del grupo');
      fetchGroup();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Error al eliminar el miembro');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-lg" />
        <p className="text-[10px] text-slate-400 font-black tracking-[0.3em] uppercase animate-pulse italic">Analizando Estructura de Cohorte...</p>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div ref={containerRef} className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tactical Header & Actions */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <button 
          onClick={() => router.push('/dashboard/groups')}
          className="group flex items-center gap-4 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-[0.25em] italic"
        >
          <div className="w-10 h-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Regresar a Grupos
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

      {/* Group Detail Tactical Dashboard */}
      <div className="tactical-group-header glass-card bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-soft overflow-hidden group">
        <div className="p-10 lg:p-14 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000">
             <Users className="w-64 h-64 text-indigo-600 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
          </div>

          <div className="w-32 h-32 rounded-[32px] bg-slate-900 border-4 border-white shadow-2xl flex items-center justify-center text-4xl font-black text-white relative z-10 group-hover:scale-105 transition-transform duration-700">
            <Users className="w-10 h-10" />
          </div>
          
          <div className="flex-1 text-center lg:text-left relative z-10">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
              <span className="px-5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black border border-emerald-100 uppercase tracking-[0.25em] italic shadow-sm">Cohorte Activa</span>
              <span className="px-5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black border border-indigo-100 uppercase tracking-[0.25em] italic shadow-sm">Expansión Global</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none italic mb-6">
              {group.name}
            </h1>
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] italic max-w-2xl leading-relaxed opacity-80">
              {group.description || 'Sin descripción técnica del grupo.'}
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full lg:w-72 relative z-10">
            <button 
              onClick={() => setIsAddMemberOpen(true)}
              className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 active:scale-95 italic border border-white/10 group/btn"
            >
              <UserPlus className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              Inscribir Alumno
            </button>
            <button 
              onClick={copyInvitationLink}
              className="w-full py-5 bg-white border border-slate-200 text-slate-900 rounded-[24px] font-black text-[10px] uppercase tracking-[0.25em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95 italic shadow-sm"
            >
              <LinkIcon className="w-5 h-5 text-indigo-600" />
              Copiar Invitación
            </button>
          </div>
        </div>
      </div>

      {/* Member Directory Tactical Table */}
      <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-soft overflow-hidden">
        <div className="p-10 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1">Registro Académico</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total de Alumnos: <span className="text-indigo-600">{membersInfo.length}</span></p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Estudiante</th>
                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Credenciales</th>
                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic text-right">Protocolos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {membersInfo.length > 0 ? (
                membersInfo.map((member) => (
                  <tr key={member.id} className="tactical-member-row hover:bg-white transition-all group/row cursor-pointer">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm group-hover/row:scale-110 group-hover/row:shadow-xl transition-all duration-500">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl.startsWith('http') ? member.avatarUrl : `/avatars/${member.avatarUrl}`}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight italic group-hover/row:text-indigo-600 transition-colors">{member.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">Matrícula: {member.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{member.email}</span>
                        <span className="text-[8px] text-slate-300 font-black uppercase tracking-[0.3em] mt-1 italic">Conexión Segura</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all duration-500 transform translate-x-4 group-hover/row:translate-x-0">
                        <Link 
                          href={`/dashboard/clients/${member.id}`}
                          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:shadow-lg rounded-xl transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeMember(member.id); }}
                          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:shadow-lg rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6 opacity-30">
                      <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center shadow-inner">
                         <Users className="w-12 h-12" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">No se detectan alumnos en esta cohorte</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Tactical Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="glass-card bg-white/90 backdrop-blur-2xl w-full max-w-2xl rounded-[40px] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1">Inscripción</h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Selección de Candidatos</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddMemberOpen(false)}
                className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 space-y-10">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="BUSCAR POR NOMBRE O EMAIL..."
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[24px] text-[10px] font-black uppercase tracking-[0.25em] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-200 italic"
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-tactical-scroll">
                {loadingContacts ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-sm" />
                  </div>
                ) : availableContacts.length > 0 ? (
                  availableContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-6 bg-white rounded-[24px] border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group/item"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden group-hover/item:scale-110 transition-transform duration-500">
                          {contact.avatarUrl ? (
                            <img src={contact.avatarUrl} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight italic">{contact.name}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic opacity-60">{contact.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => addMember(contact.id)}
                        className="px-6 py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-600 transition-all shadow-lg italic active:scale-95"
                      >
                        Inscribir
                      </button>
                    </div>
                  ))
                ) : searchContact.length >= 2 ? (
                  <div className="py-20 text-center space-y-4 opacity-30">
                    <Search className="w-10 h-10 mx-auto" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] italic">No se encontraron candidatos</p>
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4 opacity-30">
                    <UserPlus className="w-10 h-10 mx-auto" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] italic">Inicia la búsqueda en CRM</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-tactical-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-tactical-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-tactical-scroll::-webkit-scrollbar-thumb {
          background: #F1F5F9;
          border-radius: 20px;
        }
        .custom-tactical-scroll::-webkit-scrollbar-thumb:hover {
          background: #E2E8F0;
        }
      `}</style>
    </div>
  );
}
