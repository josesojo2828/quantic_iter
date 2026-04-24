'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { 
  CreditCard, 
  History, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription.service';

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
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-32 p-10">
        <header className="mb-10">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Facturación y Planes</h1>
          <p className="text-sm text-gray-500 font-medium font-inter mt-1 italic">Gestioná tu suscripción y revisá tu historial de pagos.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Plan Card */}
            <div className="admin-card overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8">
                <Receipt className="w-32 h-32 text-emerald-500/5 -rotate-12" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between p-8">
                <div className="space-y-6">
                  <div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                      Plan Actual
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 mt-4 tracking-tighter uppercase">
                      {subscription?.plan?.name || 'Cargando...'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Precio Mensual</p>
                      <p className="text-xl font-bold text-gray-900">${subscription?.plan?.price || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Próximo Cobro</p>
                      <p className="text-xl font-bold text-gray-900">
                        {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 md:mt-0 flex flex-col gap-3">
                  <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">
                    Cambiar de Plan
                  </button>
                  <button className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                    Gestionar Pago
                  </button>
                </div>
              </div>

              <div className="bg-gray-50/50 p-6 border-t border-gray-100 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suscripción Activa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto-renovación ON</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="admin-card overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-gray-400" />
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Historial de Pagos</h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                      <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Concepto</th>
                      <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Monto</th>
                      <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                      <th className="px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5 text-sm font-medium text-gray-600">22 Abr, 2026</td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-900">Suscripción Mensual - Plan {subscription?.plan?.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">ID: INV-827391</p>
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-gray-900">${subscription?.plan?.price || 0}</td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg">Pagado</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {/* Placeholder for others */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
