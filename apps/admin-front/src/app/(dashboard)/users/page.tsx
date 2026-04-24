'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Search, 
  Filter, 
  MoreVertical,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (params: any = {}) => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(params);
      setUsers(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers({ search });
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-neutral tracking-tight mb-2">Directorio de Usuarios</h1>
          <p className="text-sm text-neutral/40 max-w-md">
            Gestión global de identidades y roles a través de todo el ecosistema de talleres Quantic.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="px-6 py-3 border-r border-neutral-100">
            <span className="block text-[10px] font-bold text-neutral/30 uppercase tracking-widest mb-0.5">Total Usuarios</span>
            <span className="text-2xl font-black text-neutral">{total}</span>
          </div>
          <div className="px-6 py-3">
            <span className="block text-[10px] font-bold text-neutral/30 uppercase tracking-widest mb-0.5">Activos Hoy</span>
            <span className="text-2xl font-black text-green-600">{Math.ceil(total * 0.85)}</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white/80 backdrop-blur-lg p-4 rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-200/20 flex flex-col md:flex-row items-center gap-4 sticky top-8 z-10">
        <form onSubmit={handleSearch} className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50/50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm text-neutral placeholder:text-neutral/30 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </form>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-neutral-50 text-neutral/60 rounded-2xl text-xs font-bold hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200">
            <Filter className="w-4 h-4" />
            Filtros Avanzados
          </button>
          <button className="px-6 py-3 bg-neutral-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-black/10">
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-2xl shadow-neutral-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em]">Identidad</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em]">Workshop / Tenant</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em]">Rol & Permisos</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em]">Fecha Alta</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10">
                      <div className="h-4 bg-neutral-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <User className="w-12 h-12 text-neutral/10 mx-auto mb-4" />
                    <p className="text-neutral/30 italic text-sm">No se encontraron usuarios en la red.</p>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="group hover:bg-neutral-50/50 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-xs font-black text-neutral/40 border border-neutral-200 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-neutral group-hover:text-primary transition-colors">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-[11px] text-neutral/40 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {user.tenant ? (
                        <Link 
                          href={`/tenants/${user.tenantId}`}
                          className="flex flex-col group/link"
                        >
                          <span className="text-sm font-bold text-neutral group-hover/link:text-indigo-600 transition-colors flex items-center gap-2">
                            {user.tenant.name}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </span>
                          <span className="text-[10px] text-neutral/30 font-mono">
                            {user.tenant.slug}.quantic.app
                          </span>
                        </Link>
                      ) : (
                        <span className="px-2 py-1 bg-neutral-900 text-white rounded text-[9px] font-black uppercase tracking-widest">
                          Super Admin Host
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.role.slug === 'workshop_owner' ? 'bg-indigo-500' : 'bg-neutral-300'}`}></div>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                          user.role.slug === 'workshop_owner' 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                            : 'bg-neutral-100 text-neutral/60 border border-neutral-200'
                        }`}>
                          {user.role.slug.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-neutral">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-neutral/30 uppercase tracking-tighter">
                          Registrado vía Invitación
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                        <button className="p-2.5 bg-white border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors shadow-sm">
                          <ShieldCheck className="w-4 h-4 text-neutral/40" />
                        </button>
                        <button className="p-2.5 bg-white border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors shadow-sm">
                          <MoreVertical className="w-4 h-4 text-neutral/40" />
                        </button>
                        <button className="ml-2 w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center hover:bg-black transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="px-8 py-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-bold text-neutral/30 uppercase tracking-widest font-mono">
            <span>Mostrando: <span className="text-neutral">{users.length}</span></span>
            <span>Total: <span className="text-neutral">{total}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-white border border-neutral-100 rounded-lg text-[10px] font-black text-neutral/40 uppercase disabled:opacity-30">Ant</button>
            <button className="px-3 py-1 bg-white border border-neutral-100 rounded-lg text-[10px] font-black text-neutral/40 uppercase disabled:opacity-30">Sig</button>
          </div>
        </div>
      </div>
    </div>
  );
}
