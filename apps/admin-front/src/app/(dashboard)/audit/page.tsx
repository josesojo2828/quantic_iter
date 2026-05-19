'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  Activity, 
  Database,
  Filter
} from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [moduleFilter]);

  const loadData = async (searchTerm = search) => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs({ 
        tenantId: searchTerm || undefined, 
        module: moduleFilter || undefined,
        take: 50
      });
      // The API might return { items: [] } or just the array directly depending on the backend response formatting
      setLogs(data.items || data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-indigo-500" />
          Registros de Auditoría
        </h1>
        <p className="text-sm text-neutral/50 mt-1">
          Monitoreo global de operaciones críticas del Ecosistema Quantic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-soft">
           <div className="flex items-center gap-3 text-neutral/40 mb-3">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Eventos Recientes</span>
          </div>
          <div className="text-2xl font-bold text-neutral">{logs.length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-soft">
           <div className="flex items-center gap-3 text-neutral/40 mb-3">
            <Database className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Módulo Más Activo</span>
          </div>
          <div className="text-2xl font-bold text-neutral">-</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative max-w-sm w-full flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30" />
              <input 
                type="text"
                placeholder="Filtrar por Tenant ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 transition-colors">
              Aplicar
            </button>
          </form>

          <div className="flex items-center gap-3">
             <Filter className="w-4 h-4 text-neutral/40" />
             <select 
               value={moduleFilter} 
               onChange={e => setModuleFilter(e.target.value)}
               className="bg-white border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
             >
               <option value="">Todos los módulos</option>
               <option value="auth-tenant">Auth Tenant</option>
               <option value="crm-engagement">CRM Engagement</option>
               <option value="system">System</option>
             </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 text-[10px] font-bold text-neutral/40 uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-neutral-100">Timestamp</th>
                <th className="px-6 py-4 border-b border-neutral-100">Acción</th>
                <th className="px-6 py-4 border-b border-neutral-100">Módulo</th>
                <th className="px-6 py-4 border-b border-neutral-100">Tenant / User</th>
                <th className="px-6 py-4 border-b border-neutral-100">Metadatos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-sm text-neutral/30 italic">Obteniendo registros...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-sm text-neutral/30 italic">No hay registros de auditoría para estos filtros.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id || log._id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral/60 text-xs font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-100">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-mono text-neutral/50 flex flex-col gap-0.5">
                        {log.tenantId && <span><b className="text-neutral/70">TEN:</b> {log.tenantId}</span>}
                        {log.userId && <span><b className="text-neutral/70">USR:</b> {log.userId}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="text-[10px] font-mono text-neutral/40 bg-neutral-50/50 p-2 rounded border border-neutral-100 overflow-x-auto">
                        {JSON.stringify(log.payload)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
