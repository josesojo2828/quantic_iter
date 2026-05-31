'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  Zap, 
  History, 
  ArrowRight, 
  Loader2, 
  Shield, 
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/core/api/api.client';
import { toast } from 'react-hot-toast';
import gsap from 'gsap';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.tactical-card', {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.1
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tactical Subscriptions Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <span className="text-[8.5px] font-black uppercase tracking-[0.25em] text-slate-400">Control de Membresía</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            Plan & <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">Crecimiento</span>
          </h1>
          <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.2em] opacity-60 leading-relaxed italic">
            Escala tu infraestructura operativa y desbloquea capacidades tácticas Aura.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button 
            onClick={() => router.push('/dashboard/pricing')}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-[16px] font-black text-[8.5px] uppercase tracking-[0.25em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 border border-white/10 group italic"
          >
            Explorar Planes <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        {/* Active Plan Console - Consistent with Billing UI */}
        <div className="tactical-card xl:col-span-8 bg-slate-900 rounded-[24px] border border-slate-700 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
            <Shield className="w-40 h-40 text-indigo-500 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
          </div>
          
          <div className="bg-white/5 backdrop-blur-3xl p-6 lg:p-8 relative z-10 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[8.5px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20 shadow-sm italic">
                  Estatus: Operativo
                </span>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">
                  {subscription?.plan?.name || 'Aura Master'}
                </h2>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-white tracking-tighter italic">
                    ${subscription?.plan?.price || '29.90'}
                  </span>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">/ Mes (Neto)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                 <div className="flex items-center gap-2 text-[8px] font-black text-white/60 uppercase tracking-widest italic group/item">
                    <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover/item:bg-emerald-500 group-hover/item:text-slate-900 transition-all duration-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    Mentees Ilimitados
                 </div>
                 <div className="flex items-center gap-2 text-[8px] font-black text-white/60 uppercase tracking-widest italic group/item">
                    <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover/item:bg-emerald-500 group-hover/item:text-slate-900 transition-all duration-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    Soporte 24/7 Priority
                 </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-[16px] border border-white/5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] italic">
                Próximo ciclo de facturación: <span className="text-white/80">
                  {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : '20 de Mayo, 2026'}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Upgrade Call to Action */}
        <div className="tactical-card xl:col-span-4 glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[20px] border border-white shadow-soft flex flex-col justify-center items-center text-center group relative overflow-hidden">
           <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
           
           <div className="w-12 h-12 bg-indigo-50 rounded-[16px] flex items-center justify-center text-indigo-600 mb-5 border border-indigo-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-inner relative z-10">
              <Zap className="w-6 h-6 fill-indigo-600" />
           </div>
           
           <h3 className="text-base font-black text-slate-900 uppercase tracking-tighter mb-2 italic relative z-10">¿Escalar Protocolo?</h3>
           <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-5 leading-relaxed max-w-[180px] italic relative z-10">
              Desbloquea analíticas predictivas y límites operativos expandidos.
           </p>
           
           <button 
            onClick={() => router.push('/dashboard/pricing')}
            className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-[16px] text-[8.5px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm flex items-center justify-center gap-2 italic group/btn relative z-10"
           >
              Ver Comparativa 
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>

      {/* Subscription Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-slate-900 rounded-full shadow-sm" />
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Cronología de Membresía</h2>
        </div>

        <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-soft overflow-hidden group">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 backdrop-blur-md border-b border-slate-100">
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Referencia de Plan</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Inversión</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic text-center">Estado de Ciclo</th>
                  <th className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Fecha Emisión</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {[
                  ...(subscription?.nextPlan ? [{
                    id: 'next',
                    plan: subscription.nextPlan.name,
                    amount: `$${subscription.nextPlan.price}`,
                    date: new Date(subscription.expiresAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: 'PROGRAMADO'
                  }] : []),
                  ...(subscription?.plan ? [{
                    id: 'current',
                    plan: subscription.plan.name,
                    amount: `$${subscription.plan.price}`,
                    date: new Date(subscription.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: 'ACTIVO'
                  }] : []),
                  ...history
                ].map((item, index) => (
                  <tr key={index} className="hover:bg-indigo-50/30 transition-all duration-500 group/row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 shadow-sm group-hover/row:scale-110 group-hover/row:text-indigo-600 transition-all duration-500">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight italic group-hover/row:text-indigo-600 transition-colors">Plan {item.plan}</p>
                          <p className="text-[7px] text-slate-300 uppercase font-black tracking-widest mt-0.5">ID Ref: #SUB-QU-{1000 + index}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-black text-slate-900 tracking-tighter italic">{item.amount}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm transition-all duration-500 group-hover/row:bg-white ${
                        item.status === 'ACTIVO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        item.status === 'PROGRAMADO' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {item.status === 'ACTIVO' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                        {item.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[9.5px] font-black text-slate-400 uppercase tracking-widest italic">{item.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="w-8 h-8 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl flex items-center justify-center transition-all shadow-sm group-hover/row:scale-110 active:scale-95 group/dl">
                        <ArrowUpRight className="w-4 h-4 group-hover/dl:translate-x-0.5 group-hover/dl:-translate-y-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-center">
             <p className="text-[8.5px] font-black text-slate-300 uppercase tracking-[0.25em] italic">Fin del Registro Operativo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
