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

  useEffect(() => {
    loadTenants();
  }, []);

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
      const appMainUrl = 'http://localhost:3000';
      window.location.href = `${appMainUrl}/auth/callback?token=${result.access_token}`;
    } catch (error) {
      console.error('Error impersonating:', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral tracking-tight">Academiaes</h1>
          <p className="text-sm text-neutral/50 mt-1">
            Gestión y monitoreo de instancias activas del ecosistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral/70 hover:bg-neutral-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            Nuevo Academia
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-soft">
          <div className="flex items-center gap-3 text-neutral/40 mb-3">
            <Building2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Estructuras</span>
          </div>
          <div className="text-2xl font-bold text-neutral">{total}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-soft">
          <div className="flex items-center gap-3 text-neutral/40 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Usuarios Globales</span>
          </div>
          <div className="text-2xl font-bold text-neutral">--</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-soft">
          <div className="flex items-center gap-3 text-neutral/40 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Sistemas Online</span>
          </div>
          <div className="text-2xl font-bold text-neutral">{total}</div>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30" />
            <input 
              type="text"
              placeholder="Buscar por ID, nombre o slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </form>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-neutral-200 rounded-lg text-neutral/40 hover:bg-neutral-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-neutral/40 uppercase tracking-wider border-b border-neutral-100">Instancia</th>
                <th className="px-6 py-4 text-[10px] font-bold text-neutral/40 uppercase tracking-wider border-b border-neutral-100">Administrador</th>
                <th className="px-6 py-4 text-[10px] font-bold text-neutral/40 uppercase tracking-wider border-b border-neutral-100">Estado</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-neutral/40 uppercase tracking-wider border-b border-neutral-100">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-sm text-neutral/30 italic">Cargando registros...</td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-sm text-neutral/30">No se encontraron mentoríaes activos.</td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral/40 border border-neutral-200 overflow-hidden shrink-0">
                          {t.logo ? (
                            <img src={t.logo} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            t.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <Link href={`/tenants/${t.id}`} className="text-sm font-semibold text-neutral hover:text-primary transition-colors">
                            {t.name}
                          </Link>
                          <div className="text-[10px] text-neutral/40 font-mono tracking-tight lowercase">{t.slug}.quantic.app</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {t.owner ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-neutral">{t.owner.firstName} {t.owner.lastName}</span>
                          <span className="text-[10px] text-neutral/40">{t.owner.email}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500/50 uppercase tracking-wider">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider border border-green-200">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleImpersonate(t.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral/60 hover:bg-neutral-50 hover:text-primary transition-all group"
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

        <div className="p-4 bg-neutral-50/30 border-t border-neutral-100 text-right">
          <p className="text-[10px] font-bold text-neutral/30 uppercase tracking-widest">
            Total Resultados: {tenants.length} / {total}
          </p>
        </div>
      </div>
    </div>
  );
}
