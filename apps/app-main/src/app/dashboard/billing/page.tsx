'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Users,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Sidebar } from '@/shared/components/Sidebar';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription.service';

export default function BillingPage() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await subscriptionService.getStatus();
        setStatus(data);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-10 ml-32 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const usagePercent = status ? (status.usage.users.current / status.usage.users.limit) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-10 ml-32">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Configuración de Facturación</h1>
            <p className="text-sm text-gray-500 font-medium">Gestiona tu suscripción y métodos de pago.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Current Plan Card */}
              <div className="admin-card p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                      Estado: Activo
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mt-4">Plan {status?.plan.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-500 font-medium">
                        Renovación: <span className="text-gray-900 font-bold">{status ? new Date(status.expiresAt).toLocaleDateString() : '-'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-5 bg-gray-900 rounded-xl text-white text-center min-w-[140px]">
                    <span className="block text-2xl font-extrabold tracking-tight">${status?.plan.price}</span>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 block">Costo Mensual</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-bold text-gray-900 text-sm">Capacidad del Equipo</h4>
                      </div>
                      <span className="text-xs font-bold text-gray-400">{status?.usage.users.current} / {status?.usage.users.limit}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]'}`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium italic">Quedan {(status?.usage.users.limit || 0) - (status?.usage.users.current || 0)} cupos disponibles.</p>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-gray-900 text-sm">Estado de Cuenta</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">Al día</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium italic mt-4 leading-relaxed">No se encontraron facturas pendientes de pago.</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">Método de Pago</span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500" />
                </button>
                <button className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">Historial de Facturas</span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600" />
                </button>
              </div>
            </div>

            {/* Sidebar Billing Info */}
            <div className="space-y-6">
              <div className="bg-emerald-600 rounded-xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-600/10">
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <h3 className="text-xl font-bold mb-4">¿Necesitas mas potencia?</h3>
                <p className="text-emerald-50 text-sm mb-8 leading-relaxed font-medium">
                  Optimiza tu operación con el plan Premium para desbloquear límites de vehículos y gestión avanzada.
                </p>
                <button className="w-full py-3 bg-white text-emerald-700 font-black text-xs uppercase tracking-widest rounded-lg hover:bg-emerald-50 transition-colors">
                  Upgrade a Premium
                </button>
              </div>

              <div className="admin-card p-6 border-dashed border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  <h4 className="font-bold text-gray-900 text-sm">Soporte Operativo</h4>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-6 font-medium">
                  Si tienes dudas sobre tu facturación o los límites de tu plan, nuestro equipo está listo para ayudarte.
                </p>
                <a href="mailto:soporte@quantic.com" className="block text-center py-2 text-emerald-600 text-xs font-bold border border-emerald-100 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all">
                  Contactar Soporte
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

