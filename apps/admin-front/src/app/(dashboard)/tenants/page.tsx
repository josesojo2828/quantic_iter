'use client';

import React, { useState, useEffect } from 'react';
import { adminService, Tenant } from '@/services/admin.service';
import { 
  Search, 
  Building2, 
  Users, 
  ChevronRight,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [globalUsersCount, setGlobalUsersCount] = useState<number | string>('--');

  useEffect(() => {
    loadTenants();
    loadGlobalStats();
  }, []);

  const loadGlobalStats = async () => {
    try {
      const statsData = await adminService.getStats();
      setGlobalUsersCount(statsData?.users?.total ?? '--');
    } catch (error) {
      console.error('Error loading global stats in tenants page:', error);
    }
  };

  const loadTenants = async (searchTerm = '') => {
    setLoading(true);
    try {
      const data = await adminService.getTenants({ search: searchTerm });
      setTenants(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTenants(search);
  };

  const handleImpersonate = async (tenantId: string) => {
    try {
      const result = await adminService.impersonate(tenantId);
      const appMainUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      window.location.href = `${appMainUrl}/auth/callback?token=${result.access_token}`;
    } catch (error) {
      console.error('Error impersonating:', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gradient tracking-tight mb-2">Academias</h1>
          <p className="text-sm text-white/40 max-w-md">
            Gestión global, monitoreo de estado e impersonación de instancias activas de Quantic.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-white/5 transition-all">
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/10">
            <Plus className="w-3.5 h-3.5" />
            Nueva Academia
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="aura-glass p-6 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-3 text-white/30 mb-3">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Academias</span>
          </div>
          <div className="text-3xl font-black text-white text-glow-primary">{total}</div>
        </div>
        <div className="aura-glass p-6 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-3 text-white/30 mb-3">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Usuarios Globales</span>
          </div>
          <div className="text-3xl font-black text-white" style={{ textShadow: "0 0 15px rgba(157, 80, 187, 0.3)" }}>
            {globalUsersCount}
          </div>
        </div>
        <div className="aura-glass p-6 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-3 text-white/30 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Sistemas Online</span>
          </div>
          <div className="text-3xl font-black text-white">{total}</div>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="aura-glass rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative max-w-sm w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por ID, nombre o slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </form>
          <div className="flex items-center gap-2">
            <button className="p-3 border border-white/10 rounded-2xl text-white/40 hover:bg-white/5 hover:text-white transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Instancia</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Administrador</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Estado</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-sm text-white/30 italic">Cargando registros...</td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-sm text-white/30">No se encontraron academias activas.</td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-white/40 border border-white/10 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                          {t.logo ? (
                            <img src={t.logo} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            t.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <Link href={`/tenants/${t.id}`} className="text-sm font-bold text-white hover:text-primary transition-colors">
                            {t.name}
                          </Link>
                          <div className="text-[10px] text-white/30 font-mono tracking-tight lowercase">{t.slug}.quantic.app</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {t.owner ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{t.owner.firstName} {t.owner.lastName}</span>
                          <span className="text-[10px] text-white/40">{t.owner.email}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest">Sin Propietario</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {t.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-black bg-green-500/10 text-green-400 uppercase tracking-widest border border-green-500/20">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-black bg-red-500/10 text-red-400 uppercase tracking-widest border border-red-500/20">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleImpersonate(t.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-2xl text-[10px] font-black text-white/60 hover:bg-white/5 hover:text-primary transition-all group"
                      >
                        Gestionar
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 bg-white/[0.01] border-t border-white/5 text-right">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
            Total Resultados: {tenants.length} / {total}
          </p>
        </div>
      </div>
    </div>
  );
}
