'use client';

import { CreditCard, Zap, Link as LinkIcon, History, ArrowRight, Loader2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiClient } from '@/core/api/api.client';
import { Sidebar } from '@/shared/components/Sidebar';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await apiClient.get<any>('/subscriptions/my');
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const history = [
    { id: '1', plan: 'Mecánico Pro', amount: '$29.90', date: 'Abr 22, 2026', status: 'Pagado' },
    { id: '2', plan: 'Mecánico Pro', amount: '$29.90', date: 'Mar 22, 2026', status: 'Pagado' },
    { id: '3', plan: 'Gratuito', amount: '$0.00', date: 'Feb 22, 2026', status: 'Completado' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-32 p-10">
        <header className="mb-10">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Suscripción y Plan</h1>
          <p className="text-sm text-gray-500 font-medium font-inter mt-1 italic">Gestioná el crecimiento de tu ecosistema Quantic.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Plan Card */}
          <div className="admin-card p-6 !bg-emerald-600 text-white border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Shield className="w-24 h-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-sm">
                Plan Activo
              </span>
              <h2 className="text-3xl font-black mt-4 tracking-tighter uppercase">{subscription?.plan?.name || 'Mecánico Pro'}</h2>
              <div className="mt-8 flex items-end gap-1">
                <span className="text-4xl font-black">${subscription?.plan?.price || '29.90'}</span>
                <span className="text-xs font-bold opacity-60 mb-2 uppercase tracking-widest">/ Mes</span>
              </div>
            </div>
          </div>
          
            <div className="admin-card p-6 flex flex-col justify-center">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estado de Facturación</h3>
              <div className="text-2xl font-black text-gray-900">
                {subscription?.createdAt ? `Desde ${new Date(subscription.createdAt).toLocaleDateString()}` : 'Activa'}
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tight italic">
                Próximo cobro: {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : '20/05/2026'}
              </p>
            </div>

            {subscription?.nextPlan ? (
              <div className="admin-card p-6 !bg-blue-600 text-white border-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-24 h-24 rotate-12" />
                </div>
                <div className="relative z-10">
                  <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-sm">
                    Plan Siguiente
                  </span>
                  <h2 className="text-2xl font-black mt-2 tracking-tighter uppercase">{subscription.nextPlan.name}</h2>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-2xl font-black">${subscription.nextPlan.price}</span>
                    <span className="text-[10px] font-bold opacity-60 mb-1 uppercase tracking-widest">/ Mes</span>
                  </div>
                  <p className="text-[10px] font-bold mt-2 opacity-80 italic">Inicia el {new Date(subscription.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <div className="admin-card p-6 flex flex-col justify-center">
                 <button 
                  onClick={() => router.push('/dashboard/pricing')}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-900/20 flex items-center justify-center gap-2"
                 >
                    Cambiar de Plan
                    <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
            )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Historial de Suscripciones</h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                  <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ...(subscription?.nextPlan ? [{
                    id: 'next',
                    plan: subscription.nextPlan.name,
                    amount: `$${subscription.nextPlan.price}`,
                    date: new Date(subscription.expiresAt).toLocaleDateString(),
                    status: 'PROGRAMADO'
                  }] : []),
                  ...(subscription?.plan ? [{
                    id: 'current',
                    plan: subscription.plan.name,
                    amount: `$${subscription.plan.price}`,
                    date: new Date(subscription.createdAt).toLocaleDateString(),
                    status: 'ACTIVO'
                  }] : []),
                  ...history
                ].map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-gray-900">{item.plan}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-medium text-gray-600">{item.amount}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        item.status === 'ACTIVO' ? 'bg-emerald-50 text-emerald-600' :
                        item.status === 'PROGRAMADO' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-[10px] font-black text-gray-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">
                        Ver recibo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
