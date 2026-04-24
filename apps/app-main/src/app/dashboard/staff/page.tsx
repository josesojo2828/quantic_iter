'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
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
  List
} from 'lucide-react';
import { useAuth } from '@/core/contexts/AuthContext';

export default function StaffPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roleSlug: 'mechanic' as 'mechanic' | 'receptionist',
    branchId: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

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
      const branchesList = branchesData.items || [];
      setBranches(branchesList);
      
      // Auto-select branch if only one exists
      if (branchesList.length === 1) {
        setForm(prev => ({ ...prev, branchId: branchesList[0].id }));
      }
    } catch (error) {
      console.error('Error loading staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await workersService.inviteWorker(form);
      setIsModalOpen(false);
      setForm({ email: '', firstName: '', lastName: '', roleSlug: 'mechanic', branchId: branches.length === 1 ? branches[0].id : '' });
      loadData();
    } catch (error) {
      console.error('Error inviting worker:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que querés remover a este colaborador?')) return;
    try {
      await workersService.deleteWorker(id);
      loadData();
    } catch (error) {
      console.error('Error deleting worker:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-32 p-10">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Equipo de Trabajo</h1>
            <p className="text-sm text-gray-500 font-medium font-inter mt-1 italic">Gestioná tus colaboradores y sucursales.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 group"
            >
              <UserPlus className="w-4 h-4" />
              Invitar Miembro
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map((worker) => (
                  <div key={worker.id} className="admin-card p-6 group">
                    <div className="flex items-start justify-between mb-6">
                      <div className="relative">
                        {worker.avatarUrl ? (
                          <img 
                            src={worker.avatarUrl.startsWith('/') ? worker.avatarUrl : `/avatars/${worker.avatarUrl}`} 
                            alt={worker.firstName} 
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-black">
                            {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(worker.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{worker.firstName} {worker.lastName}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {worker.email}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-wider">
                          <Shield className="w-3 h-3" />
                          {typeof worker.role === 'string' ? worker.role : (worker.role?.name || 'Mecánico')}
                        </span>
                        {worker.branchId && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider">
                            <MapPin className="w-3 h-3" />
                            {branches.find(b => b.id === worker.branchId)?.name || 'Sucursal'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Colaborador</th>
                      <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Email</th>
                      <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Rol</th>
                      <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Sucursal</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {workers.map((worker) => (
                      <tr key={worker.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            {worker.avatarUrl ? (
                              <img src={worker.avatarUrl.startsWith('/') ? worker.avatarUrl : `/avatars/${worker.avatarUrl}`} alt={worker.firstName} className="w-10 h-10 rounded-xl object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">
                                {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-gray-900">{worker.firstName} {worker.lastName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">Activo</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs text-gray-500 font-medium">{worker.email}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-wider">
                            {typeof worker.role === 'string' ? worker.role : (worker.role?.name || 'Mecánico')}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {worker.branchId ? (
                            <span className="inline-flex px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider">
                              {branches.find(b => b.id === worker.branchId)?.name || 'Sucursal'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300 font-bold uppercase italic">Todas</span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(worker.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {workers.length === 0 && (
              <div className="py-20 text-center admin-card bg-gray-50 border-dashed border-2 opacity-50">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No hay colaboradores registrados</p>
                <p className="text-xs text-gray-400 mt-1 italic">Empezá invitando a tu equipo para delegar tareas.</p>
              </div>
            )}
          </>
        )}

        {/* Invite Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Invitar Colaborador</h3>
                  <p className="text-xs text-gray-500 font-medium italic mt-0.5">Se enviará un correo con un link de acceso seguro.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
                    <input 
                      type="text"
                      required
                      value={form.firstName}
                      onChange={e => setForm({...form, firstName: e.target.value})}
                      className="admin-input p-3"
                      placeholder="Ej: Juan"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Apellido</label>
                    <input 
                      type="text"
                      required
                      value={form.lastName}
                      onChange={e => setForm({...form, lastName: e.target.value})}
                      className="admin-input p-3"
                      placeholder="Ej: Pérez"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Invitado</label>
                  <input 
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="admin-input p-3"
                    placeholder="ejemplo@taller.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rol</label>
                    <select 
                      value={form.roleSlug}
                      onChange={e => setForm({...form, roleSlug: e.target.value as any})}
                      className="admin-input p-3 bg-white"
                    >
                      <option value="mechanic">Mecánico</option>
                      <option value="receptionist">Recepcionista</option>
                    </select>
                  </div>
                  {branches.length > 1 && (
                    <div className="space-y-1.5 text-left animate-in slide-in-from-top-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sucursal</label>
                      <select 
                        value={form.branchId}
                        onChange={e => setForm({...form, branchId: e.target.value})}
                        className="admin-input p-3 bg-white"
                      >
                        <option value="">Todas las sucursales</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={inviteLoading}
                    className="flex-3 py-4 px-10 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Invitación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
