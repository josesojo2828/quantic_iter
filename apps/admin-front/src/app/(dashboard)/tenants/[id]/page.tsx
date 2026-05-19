'use client';

import React, { useState, useEffect } from 'react';
import { adminService, Tenant } from '@/services/admin.service';
import { 
  Building2, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  ChevronLeft,
  ExternalLink,
  Settings,
  CreditCard,
  Plus,
  AlertCircle,
  Users,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [branchForm, setBranchForm] = useState({ name: '', address: '' });

  useEffect(() => {
    loadTenant();
  }, [id]);

  const loadTenant = async () => {
    try {
      const data = await adminService.getTenant(id);
      setTenant(data);
    } catch (error) {
      console.error('Error loading tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async () => {
    try {
      const result = await adminService.impersonate(id);
      const appMainUrl = 'http://localhost:3000';
      window.location.href = `${appMainUrl}/auth/callback?token=${result.access_token}`;
    } catch (error) {
      console.error('Error impersonating:', error);
    }
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await adminService.updateBranch(id, editingBranch.id, branchForm);
      } else {
        await adminService.createBranch(id, branchForm);
      }
      setBranchModalOpen(false);
      setEditingBranch(null);
      setBranchForm({ name: '', address: '' });
      loadTenant();
    } catch (error) {
      console.error('Error saving branch:', error);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('¿Seguro que querés borrar esta sucursal? No hay vuelta atrás, loco.')) return;
    try {
      await adminService.deleteBranch(id, branchId);
      loadTenant();
    } catch (error) {
      console.error('Error deleting branch:', error);
    }
  };

  if (loading) return <div className="p-8 text-neutral/30 italic">Cargando ficha técnica...</div>;
  if (!tenant) return <div className="p-8 text-red-500">No se encontró el mentoría solicitado.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Back Button */}
      <Link 
        href="/tenants" 
        className="inline-flex items-center gap-2 text-[10px] font-bold text-neutral/40 uppercase tracking-widest hover:text-neutral transition-colors group"
      >
        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Volver a la lista
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-neutral-50 flex items-center justify-center text-3xl font-bold text-neutral/20 border border-neutral-100 overflow-hidden shrink-0 shadow-inner">
            {tenant.logo ? (
              <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-cover" />
            ) : (
              tenant.name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-neutral tracking-tight">{tenant.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${tenant.active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {tenant.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral/40">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-mono">{tenant.slug}.quantic.app</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Desde: {new Date(tenant.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleImpersonate}
            className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-black/10 group"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Impersonar Instancia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics & Usage */}
        <div className="lg:col-span-2 space-y-8">
          {/* Subscription Usage Gaugues */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-neutral-50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-neutral tracking-tight">Utilización de Recursos</h3>
                  <p className="text-xs text-neutral/40">Métricas en tiempo real basadas en el plan de suscripción.</p>
                </div>
                {tenant.subscription ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <CreditCard className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-700">Plan {tenant.subscription.plan?.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold text-red-700">Sin Plan Activo</span>
                  </div>
                )}
              </div>

              {tenant.subscription ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-neutral/40">Usuarios Concurrentes</span>
                      <span className="text-neutral">{tenant.subscription.usage.users.current} / {tenant.subscription.usage.users.limit || '∞'}</span>
                    </div>
                    <div className="h-2 bg-neutral-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                        style={{ width: `${Math.min((tenant.subscription.usage.users.current / (tenant.subscription.usage.users.limit || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-neutral/40">Sucursales Activas</span>
                      <span className="text-neutral">{tenant.subscription.usage.branches.current} / {tenant.subscription.usage.branches.limit || '∞'}</span>
                    </div>
                    <div className="h-2 bg-neutral-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-neutral-900 transition-all duration-1000"
                        style={{ width: `${Math.min((tenant.subscription.usage.branches.current / (tenant.subscription.usage.branches.limit || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-100 italic text-neutral/30 text-sm">
                  Este mentoría no tiene métricas de uso porque no registra una suscripción válida.
                </div>
              )}
            </div>
            <div className="px-8 py-4 bg-neutral-50/30 flex items-center justify-between">
              <div className="text-[10px] font-bold text-neutral/40 uppercase tracking-widest">
                {tenant.subscription ? (
                  <>Vencimiento: <span className="text-neutral/80">{new Date(tenant.subscription.expiresAt).toLocaleDateString()}</span></>
                ) : (
                  'Estado: Pendiente de Pago'
                )}
              </div>
              <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">
                Gestionar Suscripción
              </button>
            </div>
          </div>

          {/* Tables Section */}
          <div className="space-y-8">
            {/* Staff Table */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/20">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-neutral/30" />
                  <h3 className="text-sm font-bold text-neutral uppercase tracking-wider">Personal Registrado</h3>
                </div>
                <span className="text-[10px] font-bold text-neutral/30 uppercase">{tenant.users?.length || 0} Usuarios</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-neutral-50/30">
                      <th className="px-8 py-3 text-[9px] font-extrabold text-neutral/40 uppercase tracking-widest">Colaborador</th>
                      <th className="px-8 py-3 text-[9px] font-extrabold text-neutral/40 uppercase tracking-widest">Rol asignado</th>
                      <th className="px-8 py-3 text-[9px] font-extrabold text-neutral/40 uppercase tracking-widest text-right">Alta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {(tenant.users || []).map((user: any) => (
                      <tr key={user.id} className="hover:bg-neutral-50/30 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-neutral group-hover:text-primary transition-colors">{user.firstName} {user.lastName}</span>
                            <span className="text-[11px] text-neutral/40">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${user.role?.slug === 'mentor_owner' ? 'bg-indigo-50 text-indigo-600' : 'bg-neutral-100 text-neutral/50'}`}>
                            {user.role?.name}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-[11px] text-neutral/40 text-right font-mono">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Branches Table */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/20">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-4 h-4 text-neutral/30" />
                    <h3 className="text-sm font-bold text-neutral uppercase tracking-wider">Sucursales Operativas</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-neutral/30 uppercase">{tenant.branches?.length || 0} Sedes</span>
                    <button 
                      onClick={() => {
                        setEditingBranch(null);
                        setBranchForm({ name: '', address: '' });
                        setBranchModalOpen(true);
                      }}
                      className="p-1.5 bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-neutral-50/30">
                        <th className="px-8 py-3 text-[9px] font-extrabold text-neutral/40 uppercase tracking-widest">Nombre de Sede</th>
                        <th className="px-8 py-3 text-[9px] font-extrabold text-neutral/40 uppercase tracking-widest">Ubicación física</th>
                        <th className="px-8 py-3 text-[9px] font-extrabold text-neutral/40 uppercase tracking-widest text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {(tenant.branches || []).map((branch: any) => (
                        <tr key={branch.id} className="hover:bg-neutral-50/30 transition-colors">
                          <td className="px-8 py-4">
                            <span className="text-sm font-bold text-neutral">{branch.name}</span>
                          </td>
                          <td className="px-8 py-4 text-xs text-neutral/40">
                            {branch.address || 'Pendiente de carga'}
                          </td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={() => {
                                  setEditingBranch(branch);
                                  setBranchForm({ name: branch.name, address: branch.address || '' });
                                  setBranchModalOpen(true);
                                }}
                                className="text-[10px] font-bold text-neutral/30 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                              >
                                Editar
                              </button>
                              <button 
                                onClick={() => handleDeleteBranch(branch.id)}
                                className="text-[10px] font-bold text-neutral/30 uppercase tracking-widest hover:text-red-600 transition-colors"
                              >
                                Borrar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-8">
          {/* Owner Identity */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-neutral-50 bg-neutral-50/20">
              <span className="text-[10px] font-extrabold text-neutral/30 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Dueño de Cuenta
              </span>
            </div>
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4 text-xl font-black">
                {tenant.owner?.firstName?.charAt(0)}{tenant.owner?.lastName?.charAt(0)}
              </div>
              <h3 className="text-sm font-bold text-neutral mb-1">
                {tenant.owner?.firstName} {tenant.owner?.lastName}
              </h3>
              <p className="text-xs text-neutral/40 mb-6">{tenant.owner?.email}</p>
              <button className="w-full py-3 bg-neutral-50 rounded-xl text-[10px] font-extrabold text-neutral/40 uppercase tracking-widest hover:bg-neutral-100 transition-colors border border-neutral-100">
                Contactar mediante Sistema
              </button>
            </div>
          </div>

          {/* Technical Info */}
          <div className="bg-neutral-900 rounded-3xl p-8 text-white shadow-xl shadow-black/10">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-4 h-4 text-white/40" />
              <h3 className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest">Información Técnica</h3>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-white/50 uppercase">ID de Instancia</span>
                <code className="text-[10px] font-mono text-white/30 break-all">{tenant.id}</code>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-white/50 uppercase">Último Acceso</span>
                <span className="text-xs text-white/20 italic">No disponible para este rol</span>
              </div>
              <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-extrabold text-white/40 uppercase tracking-widest hover:bg-white/10 transition-colors">
                Ver Logs de Auditoría
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Modal */}
      {branchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setBranchModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden">
            <div className="p-8 border-b border-neutral-50 bg-neutral-50/20">
              <h3 className="text-xl font-bold text-neutral tracking-tight">
                {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h3>
              <p className="text-xs text-neutral/40 mt-1">Cargá los datos de la sede operativa del mentoría.</p>
            </div>
            <form onSubmit={handleBranchSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-neutral/40 uppercase tracking-widest ml-1">Nombre de Sede</label>
                  <input 
                    type="text"
                    required
                    value={branchForm.name}
                    onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="Ej: Sucursal Centro"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-neutral/40 uppercase tracking-widest ml-1">Dirección Física</label>
                  <input 
                    type="text"
                    value={branchForm.address}
                    onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="Ej: Av. Siempre Viva 742"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setBranchModalOpen(false)}
                  className="flex-1 py-3 bg-neutral-50 text-neutral/40 rounded-xl text-xs font-bold hover:bg-neutral-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  {editingBranch ? 'Guardar Cambios' : 'Crear Sucursal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
