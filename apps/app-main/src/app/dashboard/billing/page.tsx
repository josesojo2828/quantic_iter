'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  TrendingUp,
  Receipt,
  ArrowRight,
  Zap,
  DollarSign,
  History
} from 'lucide-react';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription.service';
import { toast } from 'react-hot-toast';

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await subscriptionService.getMySubscription();
        setSubscription(data);
      } catch (err) {
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tactical Financial Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
            <span className="text-[8.5px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Central de Tesorería Quántica</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            Planes & <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-emerald-700">Facturación</span>
          </h1>
          <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.25em] opacity-60 italic leading-relaxed">
            Administración centralizada de activos, suscripciones y flujos de capital Aura. Mantén tu infraestructura operativa al 100%.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="px-5 py-3 bg-white/70 backdrop-blur-xl border border-white rounded-[16px] shadow-soft flex items-center gap-2.5 group hover:shadow-xl transition-all">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform" />
            <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Estatus: <span className="text-emerald-600">INFRAESTRUCTURA AL DÍA</span></span>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* Active Plan Dashboard Card */}
        <div className="glass-card bg-slate-900 p-0.5 rounded-[24px] border border-white/10 shadow-2xl relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none">
            <Receipt className="w-40 h-40 text-emerald-500 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
          </div>
          
          <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[23px] p-6 lg:p-10 relative z-10">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
              <div className="space-y-6 flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[8.5px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20 shadow-sm italic">
                      Suscripción Operativa
                    </span>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">
                    {subscription?.plan?.name || 'Standard'} <span className="text-emerald-500">Aura</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="p-5 bg-white/5 rounded-[20px] border border-white/10 shadow-inner group/stat relative overflow-hidden">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 italic opacity-60">Inversión Mensual</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white tracking-tighter italic">${subscription?.plan?.price || 49}</span>
                      <span className="text-[9px] font-black text-white/20 uppercase italic">/ Ciclo</span>
                    </div>
                  </div>
                  <div className="p-5 bg-white/5 rounded-[20px] border border-white/10 shadow-inner group/stat relative overflow-hidden">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 italic opacity-60">Próxima Renovación</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white tracking-tighter italic">
                        {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '12 JUN'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full xl:w-auto min-w-[280px]">
                <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500 text-slate-900 rounded-[16px] text-[8.5px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 italic group/btn">
                  <TrendingUp className="w-4.5 h-4.5 group-hover/btn:scale-125 transition-transform duration-500" />
                  Escalar Infraestructura
                </button>
                <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/10 border border-white/10 text-white rounded-[16px] text-[8.5px] font-black uppercase tracking-[0.3em] hover:bg-white/20 transition-all active:scale-95 italic group/btn">
                  <CreditCard className="w-4.5 h-4.5 group-hover/btn:rotate-12 transition-transform duration-500" />
                  Protocolo de Pago
                </button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 group/info">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[8.5px] font-black text-white/50 uppercase tracking-[0.3em] italic">Protocolo Activo</span>
                </div>
                <div className="flex items-center gap-2 group/info">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <span className="text-[8.5px] font-black text-white/50 uppercase tracking-[0.3em] italic">Sincronización Auto</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                 <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[8.5px] font-black text-white/20 uppercase tracking-[0.3em] italic leading-none">
                  Aura Finance Monitor v2.0
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Console */}
        <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-soft overflow-hidden group">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-slate-900 rounded-full shadow-sm" />
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic leading-none">Registro de Transacciones</h3>
            </div>
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
              <History className="w-5 h-5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 backdrop-blur-md border-b border-slate-100">
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] italic">Despliegue</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] italic">Concepto Operativo</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] italic text-right">Inversión</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] italic text-center">Validación</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {[1, 2, 3].map((_, i) => (
                  <tr key={i} className="hover:bg-indigo-50/30 transition-all duration-700 group/row">
                    <td className="px-6 py-4">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{22 - i} ABR, 2026</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover/row:text-indigo-600 transition-colors italic leading-none">
                          Suscripción Aura - {subscription?.plan?.name || 'Standard'}
                        </p>
                        <p className="text-[7px] text-slate-300 uppercase font-black tracking-[0.2em] italic opacity-60">REF ID: #QU-FIN-{827391 + i}-TX</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                         <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                         <span className="text-xl font-black text-slate-900 tracking-tighter italic leading-none">${subscription?.plan?.price || 49}.00</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[7px] font-black uppercase tracking-[0.25em] rounded-full border border-emerald-100 shadow-sm group-hover/row:bg-white transition-all italic">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        COMPLETO
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="w-9 h-9 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-500 hover:shadow-xl rounded-xl inline-flex items-center justify-center transition-all shadow-sm group-hover/row:scale-110 active:scale-95 group/dl">
                        <Download className="w-4.5 h-4.5 group-hover/dl:translate-y-1 transition-transform duration-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
            <button className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] hover:text-indigo-600 transition-all italic group/all">
              Ver Historial de Despliegue
              <ArrowRight className="w-4 h-4 group-hover/all:translate-x-1 transition-transform duration-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
