'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  Activity, 
  Database,
  Filter,
  Loader2,
  Terminal
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

  // Dynamic calculations for premium metrics
  const getMostActiveModule = () => {
    if (!logs || logs.length === 0) return '-';
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      if (log.module) {
        counts[log.module] = (counts[log.module] || 0) + 1;
      }
    });
    let maxModule = '-';
    let maxCount = 0;
    Object.entries(counts).forEach(([mod, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxModule = mod;
      }
    });
    return maxModule;
  };

  const getUniqueTenantsCount = () => {
    if (!logs || logs.length === 0) return 0;
    const uniqueTenants = new Set(logs.map(log => log.tenantId).filter(Boolean));
    return uniqueTenants.size;
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gradient tracking-tight mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary animate-pulse" />
            Registros de Auditoría
          </h1>
          <p className="text-sm text-white/40 max-w-lg font-medium">
            Monitoreo global en tiempo real de operaciones críticas y auditoría del Ecosistema Quantic.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="aura-glass rounded-3xl p-6 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Eventos Analizados</span>
            <div className="text-3xl font-black text-white tracking-tight">{loading ? '...' : logs.length}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-primary">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="aura-glass rounded-3xl p-6 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Módulo Más Activo</span>
            <div className="text-xl font-bold text-white tracking-tight capitalize truncate max-w-[200px]">
              {loading ? '...' : getMostActiveModule()}
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-primary">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="aura-glass rounded-3xl p-6 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">Tenants Involucrados</span>
            <div className="text-3xl font-black text-white tracking-tight">{loading ? '...' : getUniqueTenantsCount()}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-primary">
            <Terminal className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Logs Table Container */}
      <div className="aura-glass rounded-[32px] border border-white/5 overflow-hidden">
        {/* Filters bar */}
        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative max-w-sm w-full flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text"
                placeholder="Filtrar por Tenant ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition-colors">
              Aplicar
            </button>
          </form>

          <div className="flex items-center gap-3">
             <Filter className="w-4 h-4 text-white/30" />
             <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center">
               <select 
                 value={moduleFilter} 
                 onChange={e => setModuleFilter(e.target.value)}
                 className="bg-transparent text-sm text-white outline-none cursor-pointer pr-4 focus:ring-0 border-none"
               >
                 <option value="" className="bg-neutral-900 text-white">Todos los módulos</option>
                 <option value="auth-tenant" className="bg-neutral-900 text-white">Auth Tenant</option>
                 <option value="crm-engagement" className="bg-neutral-900 text-white">CRM Engagement</option>
                 <option value="system" className="bg-neutral-900 text-white">System</option>
               </select>
             </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] text-[10px] font-black text-white/40 uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-white/5">Timestamp</th>
                <th className="px-6 py-4 border-b border-white/5">Acción</th>
                <th className="px-6 py-4 border-b border-white/5">Módulo</th>
                <th className="px-6 py-4 border-b border-white/5">Tenant / User</th>
                <th className="px-6 py-4 border-b border-white/5">Metadatos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-sm text-white/30 italic">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <span>Obteniendo registros...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-sm text-white/30 italic">
                    No hay registros de auditoría para estos filtros.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id || log._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-white">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-white/5 text-white text-[10px] font-black uppercase tracking-wider rounded-lg border border-white/10">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-mono text-white/40 flex flex-col gap-0.5">
                        {log.tenantId && <span><b className="text-white/60">TEN:</b> {log.tenantId}</span>}
                        {log.userId && <span><b className="text-white/60">USR:</b> {log.userId}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="text-[10px] font-mono text-white/50 bg-black/40 p-3 rounded-xl border border-white/5 overflow-x-auto max-h-[80px] scrollbar-thin">
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
