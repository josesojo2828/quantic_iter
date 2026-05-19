'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  Search,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenantHistory, setSelectedTenantHistory] = useState<any[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (searchTerm = '') => {
    setLoading(true);
    try {
      const [subsData, statsData] = await Promise.all([
        adminService.getSubscriptions({ search: searchTerm }),
        adminService.getSubscriptionStats()
      ]);
      setSubscriptions(subsData.items);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading subscriptions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchHistory = async (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setIsHistoryModalOpen(true);
    try {
      const history = await adminService.getTenantSubscriptionHistory(tenantId);
      setSelectedTenantHistory(history);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(search);
  };

  const calculateMRR = () => {
    if (!stats) return 0;
    return stats.revenueByPlan.reduce((acc: number, curr: any) => acc + curr.total, 0);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral tracking-tight">Ecosistema de Suscripciones</h1>
        <p className="text-sm text-neutral/50 mt-1">
          Historial de ingresos, evolución de planes y auditoría comercial.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-soft">
          <div className="flex items-center gap-3 text-neutral/40 mb-3">
            <CreditCard className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">MRR Actual</span>
          </div>
          <div className="text-2xl font-bold text-neutral">${calculateMRR().toLocaleString()}</div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-600">
            <TrendingUp className="w-3 h-3" /> +8.4%
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-soft">
          <div className="flex items-center gap-3 text-neutral/40 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Activas</span>
          </div>
          <div className="text-2xl font-bold text-neutral">{stats?.activeSubscriptions || 0}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-soft">
          <div className="flex items-center gap-3 text-neutral/40 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Vencidas</span>
          </div>
          <div className="text-2xl font-bold text-neutral">{stats?.expiredSubscriptions || 0}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-soft">
          <div className="flex items-center gap-3 text-neutral/40 mb-3">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Planes</span>
          </div>
          <div className="text-2xl font-bold text-neutral">{stats?.totalSubscriptions || 0}</div>
        </div>
      </div>

      {/* Revenue by Plan Chart */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-soft mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-neutral">Distribución de Ingresos</h3>
          <span className="text-[10px] font-bold text-neutral/30 uppercase tracking-widest">Revenue Dinámico</span>
        </div>
        
        <div className="flex items-end gap-8 h-48 pt-4">
          {stats?.revenueByPlan.map((p: any) => {
            const maxVal = Math.max(...stats.revenueByPlan.map((rp: any) => rp.total), 1);
            const heightPerc = (p.total / maxVal) * 100;
            return (
              <div key={p.planName} className="flex-1 flex flex-col items-center group">
                <div className="w-full relative flex flex-col items-center">
                  <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white text-[10px] px-2 py-1 rounded">
                    ${p.total}
                  </div>
                  <div 
                    style={{ height: `${heightPerc}%` }}
                    className="w-full max-w-[40px] bg-indigo-500/20 group-hover:bg-indigo-500 transition-all rounded-t-lg border-t-2 border-indigo-500 min-h-[4px]"
                  ></div>
                </div>
                <div className="mt-4 text-[10px] font-bold text-neutral/40 uppercase truncate w-full text-center">
                  {p.planName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30" />
            <input 
              type="text"
              placeholder="Buscar mentoría o ID de instancia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 text-[10px] font-bold text-neutral/40 uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-neutral-100">Instancia</th>
                <th className="px-6 py-4 border-b border-neutral-100">Plan Actual</th>
                <th className="px-6 py-4 border-b border-neutral-100">Expiración</th>
                <th className="px-6 py-4 border-b border-neutral-100">Estado</th>
                <th className="px-6 py-4 border-b border-neutral-100 text-right">Monto</th>
                <th className="px-6 py-4 border-b border-neutral-100"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-sm text-neutral/30 italic">Cargando datos maestros...</td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-neutral">{s.tenant?.name || s.tenantId}</span>
                        <span className="text-[10px] text-neutral/40">Context: {s.tenantId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="text-xs font-semibold text-neutral">{s.plan?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-neutral/50 text-[11px] font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(s.expiresAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        s.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-neutral">${s.plan?.price}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleFetchHistory(s.tenantId)}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-all text-neutral/40 hover:text-neutral group-hover:scale-110"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="text-lg font-bold text-neutral tracking-tight">Historial de Evolución</h3>
                <p className="text-xs text-neutral/40 uppercase tracking-widest font-black mt-1">Tenant ID: {selectedTenantId}</p>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-xl transition-all"
              >
                <XCircle className="w-5 h-5 text-neutral/30" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {selectedTenantHistory.length === 0 ? (
                <div className="py-20 text-center">
                  <Clock className="w-12 h-12 text-neutral/10 mx-auto mb-4" />
                  <p className="text-sm text-neutral/30 italic">No se han registrado cambios históricos para este mentoría.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedTenantHistory.map((entry, idx) => (
                    <div key={entry.id} className="relative pl-8 pb-6 border-l-2 border-neutral-100 last:border-0 last:pb-0">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center">
                        <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-neutral-300'}`}></div>
                      </div>
                      
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral/60">
                              {entry.action}
                            </span>
                            <span className="text-[10px] font-medium text-neutral/30">
                              {new Date(entry.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-neutral">{entry.plan?.name}</h4>
                          <p className="text-xs text-neutral/50 mt-1">
                            Periodo: {new Date(entry.startDate).toLocaleDateString()} al {new Date(entry.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-neutral">${entry.price}</div>
                          <div className="text-[9px] text-neutral/40 uppercase font-bold tracking-tight">Liquidado</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 bg-neutral-50 border-t border-neutral-100 flex justify-end">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-6 py-3 bg-neutral-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-black/10"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
