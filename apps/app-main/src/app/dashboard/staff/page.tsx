'use client';

import React, { useState, useEffect, useRef } from 'react';
import { workersService, Worker } from '@/features/auth/services/workers.service';
import { branchesService, Branch } from '@/features/auth/services/branches.service';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MapPin,
  Trash2,
  Edit2,
  Loader2,
  X,
  LayoutGrid,
  List,
  ChevronRight,
  Search
} from 'lucide-react';
import { useAuth } from '@/core/contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import gsap from 'gsap';

export default function StaffPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Worker | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roleSlug: 'facilitator' as 'facilitator' | 'support',
    branchId: ''
  });

  const headerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (selectedProfile && drawerRef.current) {
      gsap.fromTo(drawerRef.current,
        { x: '100%', opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power4.out', clearProps: 'transform' }
      );
    }
  }, [selectedProfile]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [workersData, branchesData] = await Promise.all([
        workersService.getWorkers({
          excludeRole: 'client',
          excludeUserId: user.id
        }),
        branchesService.getBranches()
      ]);
      setWorkers(workersData.items);
      const branchesList = branchesData || [];
      setBranches(branchesList);
    } catch (error) {
      toast.error('Error al cargar datos del equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (worker?: Worker) => {
    if (worker) {
      setIsEditing(true);
      setSelectedWorker(worker);
      setForm({
        email: worker.email,
        firstName: worker.firstName,
        lastName: worker.lastName,
        roleSlug: (typeof worker.role === 'string' ? worker.role : worker.role?.slug) as any || 'facilitator',
        branchId: worker.branchId || ''
      });
    } else {
      setIsEditing(false);
      setSelectedWorker(null);
      setForm({
        email: '',
        firstName: '',
        lastName: '',
        roleSlug: 'facilitator',
        branchId: branches.length === 1 ? branches[0].id : ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      if (isEditing && selectedWorker) {
        await workersService.updateWorker(selectedWorker.id, form);
        toast.success('Perfil actualizado correctamente');
      } else {
        await workersService.inviteWorker(form);
        toast.success('Invitación enviada al colaborador');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que querés remover a ${name} del equipo?`)) return;
    try {
      await workersService.deleteWorker(id);
      toast.success('Colaborador removido');
      loadData();
    } catch (error) {
      toast.error('No se pudo eliminar al colaborador');
    }
  };

  const filteredWorkers = workers.filter(w =>
    `${w.firstName} ${w.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full p-6 lg:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster />

      {/* Header */}
      <header ref={headerRef} className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Talent Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Equipo <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-emerald-700">Estratégico</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 max-w-2xl text-sm leading-relaxed">
            Gestiona tu capital humano. Monitorea el rendimiento de tus facilitadores y escala tu estructura operativa.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex-1 xl:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 group"
          >
            <UserPlus className="w-4 h-4 transition-transform group-hover:rotate-12" />
            Invitar Talento
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="glass-card bg-white/50 backdrop-blur-md rounded-3xl p-4 border border-white shadow-soft flex items-center justify-between overflow-hidden">
        <div className="relative group w-full max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido o email..."
            className="w-full bg-white/50 border border-transparent rounded-[20px] pl-14 pr-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-emerald-600/20 focus:ring-4 focus:ring-emerald-600/5 transition-all text-slate-900 placeholder:text-slate-300"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-300">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando Nómina...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="glass-card bg-white/70 backdrop-blur-xl p-8 rounded-[32px] border border-white shadow-soft hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden flex flex-col items-center text-center"
                >
                  <div className="absolute top-0 right-0 p-5 flex gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all z-10 duration-500">
                    <button
                      onClick={() => handleOpenModal(worker)}
                      className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(worker.id, `${worker.firstName} ${worker.lastName}`)}
                      className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-[32px] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-700">
                      {worker.avatarUrl ? (
                        <img
                          src={worker.avatarUrl.startsWith('/') ? worker.avatarUrl : `/avatars/${worker.avatarUrl}`}
                          alt={worker.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-300 uppercase">
                          {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white p-1 rounded-full shadow-sm">
                      <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter group-hover:text-emerald-600 transition-colors">
                    {worker.firstName} {worker.lastName}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 mb-6 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    {worker.email}
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${(typeof worker.role === 'string' ? worker.role : worker.role?.slug) === 'support'
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                      {typeof worker.role === 'string' ? worker.role : (worker.role?.name || '---')}
                    </span>
                    {worker.branchId && (
                      <span className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100 text-[9px] font-black uppercase tracking-widest shadow-sm">
                        {branches.find(b => b.id === worker.branchId)?.name || 'Sede'}
                      </span>
                    )}
                  </div>

                  <button
                    className="w-full py-4 bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 rounded-2xl uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                    onClick={() => setSelectedProfile(worker)}
                  >
                    Perfil de Alto Impacto <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-soft overflow-hidden group">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 backdrop-blur-md">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Colaborador</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rol Asignado</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sede Operativa</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Estado</th>
                    <th className="px-10 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-indigo-50/30 transition-all duration-300 group/row">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/row:scale-110 transition-transform shadow-sm">
                            {worker.avatarUrl ? (
                              <img src={worker.avatarUrl.startsWith('/') ? worker.avatarUrl : `/avatars/${worker.avatarUrl}`} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-slate-300 uppercase">
                                {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{worker.firstName} {worker.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{worker.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-xs font-black text-slate-600 uppercase tracking-widest italic">
                        {typeof worker.role === 'string' ? worker.role : (worker.role?.name || '---')}
                      </td>
                      <td className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                        {branches.find(b => b.id === worker.branchId)?.name || 'Todas'}
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm">Activo</span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all">
                          <button onClick={() => handleOpenModal(worker)} className="p-2.5 text-slate-400 hover:text-indigo-600">
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button onClick={() => handleDelete(worker.id, `${worker.firstName} ${worker.lastName}`)} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredWorkers.length === 0 && (
            <div className="py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform -rotate-6 border border-slate-100 shadow-inner">
                <Users className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase italic">Tu equipo está en las sombras...</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-[200px] mx-auto italic text-center">
                Invita a tu primer colaborador para delegar con confianza.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white/90 backdrop-blur-2xl w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-white group animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 bg-white/50 backdrop-blur-md flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuración de Talento</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                  {isEditing ? 'Optimizar' : 'Integrar'} <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-emerald-700">Colaborador</span>
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-slate-900 bg-slate-50 rounded-2xl transition-all hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Ej: Carlos"
                    className="w-full bg-slate-50/50 border border-transparent rounded-[20px] px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-emerald-600/20 focus:ring-4 focus:ring-emerald-600/5 transition-all text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Ej: Gomez"
                    className="w-full bg-slate-50/50 border border-transparent rounded-[20px] px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-emerald-600/20 focus:ring-4 focus:ring-emerald-600/5 transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Profesional</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    required
                    disabled={isEditing}
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="ejemplo@mentoría.com"
                    className="w-full bg-slate-50/50 border border-transparent rounded-[20px] pl-14 pr-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-emerald-600/20 focus:ring-4 focus:ring-emerald-600/5 transition-all text-slate-900 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol Táctico</label>
                  <select
                    value={form.roleSlug}
                    onChange={e => setForm({ ...form, roleSlug: e.target.value as any })}
                    className="w-full bg-slate-50/50 border border-transparent rounded-[20px] px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-emerald-600/20 transition-all text-slate-900 appearance-none"
                  >
                    <option value="facilitator">🛠️ --- Aura</option>
                    <option value="support">📞 Soporte Crítico</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sede Operativa</label>
                  <select
                    value={form.branchId}
                    onChange={e => setForm({ ...form, branchId: e.target.value })}
                    className="w-full bg-slate-50/50 border border-transparent rounded-[20px] px-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-emerald-600/20 transition-all text-slate-900 appearance-none"
                  >
                    <option value="">🌎 Todas las Sedes</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors italic"
                >
                  Abortar
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-[2] py-5 px-10 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {inviteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? 'Sincronizar Perfil' : 'Integrar al Sistema')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Slide-over Profile Drawer - High Fidelity Aura Chill */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[110] flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedProfile(null)}></div>
          <div ref={drawerRef} className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-white/20 flex flex-col z-50 overflow-hidden rounded-l-[40px] animate-in slide-in-from-right duration-500">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[28px] bg-white border border-slate-100 shadow-soft flex items-center justify-center overflow-hidden group">
                  {selectedProfile.avatarUrl ? (
                    <img src={selectedProfile.avatarUrl.startsWith('/') ? selectedProfile.avatarUrl : `/avatars/${selectedProfile.avatarUrl}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <span className="text-2xl font-black text-emerald-400 uppercase">{selectedProfile.firstName.charAt(0)}{selectedProfile.lastName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{selectedProfile.firstName} {selectedProfile.lastName}</h2>
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest italic mt-1">{typeof selectedProfile.role === 'string' ? selectedProfile.role : (selectedProfile.role?.name || 'Staff Specialist')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProfile(null)} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-slate-900 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:scale-110"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Impacto Aura</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter italic">98%</p>
                </div>
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">XP Mentor</p>
                  <p className="text-4xl font-black text-indigo-600 tracking-tighter italic">Lvl 24</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  Ficha de Inteligencia
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{selectedProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{branches.find(b => b.id === selectedProfile.branchId)?.name || 'Sede Global'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
