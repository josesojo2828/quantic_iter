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
  Clock,
  Edit2
} from 'lucide-react';
import { SubscriptionEditModal } from './components/SubscriptionEditModal';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenantHistory, setSelectedTenantHistory] = useState<any[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gradient tracking-tight mb-2">Suscripciones</h1>
          <p className="text-sm text-white/40 max-w-md">
            Historial de ingresos, evolución de planes y auditoría comercial del ecosistema.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="aura-glass p-6 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-3 text-white/30 mb-3">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">MRR Actual</span>
          </div>
          <div className="text-3xl font-black text-white text-glow-primary">${calculateMRR().toLocaleString()}</div>
        </div>
        
        <div className="aura-glass p-6 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-3 text-white/30 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Activas</span>
          </div>
          <div className="text-3xl font-black text-white">{stats?.activeSubscriptions || 0}</div>
        </div>

        <div className="aura-glass p-6 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-3 text-white/30 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Vencidas</span>
          </div>
          <div className="text-3xl font-black text-white">{stats?.expiredSubscriptions || 0}</div>
        </div>

        <div className="aura-glass p-6 rounded-[24px] border border-white/5">
          <div className="flex items-center gap-3 text-white/30 mb-3">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Planes</span>
          </div>
          <div className="text-3xl font-black text-white" style={{ textShadow: "0 0 15px rgba(157, 80, 187, 0.3)" }}>
            {stats?.totalSubscriptions || 0}
          </div>
        </div>
      </div>

      {/* Revenue by Plan Chart */}
      <div className="aura-glass p-8 rounded-[32px] border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-white/50 uppercase tracking-[0.25em]">Distribución de Ingresos</h3>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Revenue Dinámico</span>
        </div>
        
        <div className="flex items-end gap-8 h-48 pt-4">
          {stats?.revenueByPlan?.map((p: any) => {
            const maxVal = Math.max(...stats.revenueByPlan.map((rp: any) => rp.total), 1);
            const heightPerc = (p.total / maxVal) * 100;
            return (
              <div key={p.planName} className="flex-1 flex flex-col items-center group">
                <div className="w-full relative flex flex-col items-center">
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 border border-white/10 text-white text-[10px] px-3 py-1.5 rounded-xl shadow-xl font-bold">
                    ${p.total}
                  </div>
                  <div 
                    style={{ height: `${heightPerc}%` }}
                    className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-all rounded-t-xl border-t-2 border-primary min-h-[6px] shadow-[0_0_15px_rgba(0,210,255,0.15)]"
                  ></div>
                </div>
                <div className="mt-4 text-[10px] font-black text-white/40 uppercase tracking-widest truncate w-full text-center">
                  {p.planName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Section */}
      <div className="aura-glass rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative max-w-sm w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Buscar academia o ID de instancia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Instancia</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Plan Actual</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Expiración</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-widest border-b border-white/5 text-right">Monto</th>
                <th className="px-8 py-5 border-b border-white/5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-sm text-white/30 italic">Cargando datos maestros...</td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{s.tenant?.name || s.tenantId}</span>
                        <span className="text-[10px] text-white/30 font-mono">Context: {s.tenantId}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"></div>
                        <span className="text-xs font-bold text-white">{s.plan?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-white/40 text-[11px] font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(s.expiresAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        s.status === 'ACTIVE' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-bold text-white">${s.plan?.price}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedSubscription(s);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
                          title="Editar Suscripción"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleFetchHistory(s.tenantId)}
                          className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
                          title="Ver Historial"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="aura-glass w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Historial de Evolución</h3>
                <p className="text-xs text-white/30 uppercase tracking-widest font-black mt-1">Tenant ID: {selectedTenantId}</p>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <XCircle className="w-5 h-5 text-white/30 hover:text-white" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {selectedTenantHistory.length === 0 ? (
                <div className="py-20 text-center">
                  <Clock className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-sm text-white/30 italic">No se han registrado cambios históricos para este tenant.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedTenantHistory.map((entry, idx) => (
                    <div key={entry.id} className="relative pl-8 pb-6 border-l border-white/10 last:border-0 last:pb-0">
                      <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-black border border-white/30 flex items-center justify-center">
                        <div className={`w-1 h-1 rounded-full ${idx === 0 ? 'bg-primary shadow-[0_0_8px_var(--primary)]' : 'bg-white/20'}`}></div>
                      </div>
                      
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/5 text-white/60 border border-white/5">
                              {entry.action}
                            </span>
                            <span className="text-[10px] font-semibold text-white/30">
                              {new Date(entry.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{entry.plan?.name}</h4>
                          <p className="text-xs text-white/40 mt-1">
                            Periodo: {new Date(entry.startDate).toLocaleDateString()} al {new Date(entry.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">${entry.price}</div>
                          <div className="text-[9px] text-green-400 uppercase font-black tracking-widest">Liquidado</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 bg-white/[0.01] border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-all border border-white/10"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      <SubscriptionEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
        onSuccess={() => loadData(search)}
      />
    </div>
  );
}
