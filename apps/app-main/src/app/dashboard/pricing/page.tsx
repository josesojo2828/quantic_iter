'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Check,
  Zap,
  Shield,
  Rocket,
  CreditCard,
  ArrowRight,
  Sparkles,
  Loader2,
  Calendar
} from 'lucide-react';
import { Sidebar } from '@/shared/components/Sidebar';
import { subscriptionService, Plan } from '@/services/subscription.service';
import { useAuth } from '@/core/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const { refreshProfile } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansData, subData] = await Promise.all([
          subscriptionService.getPlans(),
          subscriptionService.getMySubscription().catch(() => null)
        ]);
        setPlans(plansData);
        setCurrentSubscription(subData);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
        toast.error('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && plans.length > 0) {
      gsap.fromTo(cardsRef.current,
        { opacity: 0, y: 50, rotateX: -10 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power4.out',
          transformPerspective: 1000
        }
      );
    }
  }, [loading, plans]);

  const handleUpgrade = async (plan: Plan) => {
    if (processingId) return;
    
    const promise = subscriptionService.upgrade(plan.slug);
    setProcessingId(plan.id);

    toast.promise(promise, {
      loading: `Procesando plan ${plan.name}...`,
      success: () => {
        refreshProfile(); 
        setProcessingId(null);
        // Refresh data to show scheduled status
        subscriptionService.getMySubscription().then(setCurrentSubscription);
        return `¡Solicitud de plan ${plan.name} procesada!`;
      },
      error: (err) => {
        setProcessingId(null);
        return err.response?.data?.message || 'Error al actualizar el plan';
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#fafafa]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <main className="flex-1 p-10 lg:ml-32">
        <div className="max-w-7xl mx-auto">
          <header className="mb-20 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" />
              Suscripciones Quánticas
            </div>
            <h1 className="text-5xl font-black text-gray-950 tracking-tighter mb-4 italic">
              Escalá tu Taller
            </h1>
            <p className="text-gray-500 max-w-2xl text-lg font-medium leading-relaxed italic opacity-80">
              Herramientas de nivel industrial para talleres que buscan excelencia. 
              Sencillo, potente y escalable.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => {
              const isActive = currentSubscription?.plan?.slug === plan.slug;
              const isScheduled = currentSubscription?.nextPlan?.slug === plan.slug;
              const isEnterprise = plan.slug.startsWith('enterprise');
              const isProEnterprise = plan.slug === 'enterprise_pro';

              return (
                <div
                  key={plan.id}
                  ref={el => cardsRef.current[index] = el}
                  className={`relative p-[1px] rounded-[2.5rem] overflow-hidden transition-all duration-700 bg-white border border-gray-100 ${
                    isActive ? 'shadow-2xl shadow-emerald-500/20 border-emerald-500/30' : 
                    isScheduled ? 'shadow-2xl shadow-blue-500/20 border-blue-500/30' :
                    isEnterprise ? 'shadow-2xl shadow-emerald-900/20' : 'shadow-sm'
                  }`}
                >
                  {isEnterprise && (
                    <div className="absolute -top-10 -right-10 opacity-5">
                      <Zap className={`w-40 h-40 ${isProEnterprise ? 'text-yellow-500' : 'text-emerald-800'}`} />
                    </div>
                  )}

                  <div className={`h-full w-full rounded-[2.4rem] p-8 flex flex-col ${isEnterprise ? 'bg-[#09090b] text-white' : 'bg-white text-gray-900'}`}>
                    <div className="flex justify-between items-start mb-8">
                      <div className={`p-3 rounded-xl ${isEnterprise ? 'bg-white/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        {plan.slug === 'basico' ? <Shield className="w-5 h-5" /> : (plan.slug === 'pro' ? <Zap className="w-5 h-5" /> : <Rocket className="w-5 h-5" />)}
                      </div>
                      {(isEnterprise || isActive || isScheduled) && (
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg ${
                            isActive ? 'bg-emerald-500 text-black' : 
                            isScheduled ? 'bg-blue-500 text-white' : 
                            isProEnterprise ? 'bg-yellow-500 text-black' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isActive ? 'Activo' : isScheduled ? 'Siguiente' : isProEnterprise ? 'Elite' : 'Premium'}
                          </span>
                          {isActive && currentSubscription.createdAt && (
                            <span className="text-[8px] font-bold opacity-40 uppercase">Desde {new Date(currentSubscription.createdAt).toLocaleDateString()}</span>
                          )}
                          {isScheduled && currentSubscription.expiresAt && (
                            <span className="text-[8px] font-bold opacity-40 uppercase">Inicia {new Date(currentSubscription.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-8 ${isEnterprise ? 'text-gray-500' : 'text-gray-400'}`}>
                      {plan.description}
                    </p>

                    <div className="flex items-baseline mb-10">
                      <span className="text-4xl font-black tracking-tighter">${plan.price}</span>
                      <span className="text-[10px] font-bold opacity-40 ml-2">/ mes</span>
                    </div>

                    <div className="space-y-3 mb-10 flex-1">
                      <Feature text={`${plan.config.maxUsers} Usuarios`} />
                      <Feature text={`${plan.config.maxVehicles} Vehículos`} />
                      {isEnterprise && (
                        <>
                          <Feature text={`${isProEnterprise ? 'Sucursales Ilimitadas' : 'Hasta 5 Sucursales'}`} highlight />
                          {isProEnterprise && <Feature text="Auditoría Forense Avanzada" highlight />}
                        </>
                      )}
                      {plan.slug !== 'basico' && <Feature text="Soporte VIP" />}
                    </div>


                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={!!processingId || isActive || isScheduled}
                      className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:scale-100 ${
                        isActive 
                          ? 'bg-emerald-100/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                          : isScheduled
                            ? 'bg-blue-100/10 text-blue-500 border border-blue-500/20 cursor-default'
                            : isEnterprise
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-500/20'
                              : 'bg-gray-900 text-white hover:bg-black'
                      }`}
                    >
                      {processingId === plan.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isActive ? (
                        <>Plan Actual <Check className="w-5 h-5" /></>
                      ) : isScheduled ? (
                        <>Plan Siguiente <Calendar className="w-5 h-5" /></>
                      ) : (
                        <>Seleccionar Plan <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="mt-24 p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50 transition-opacity group-hover:opacity-100" />
             <div className="flex items-center gap-6 relative z-10">
               <div className="p-5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                 <CreditCard className="w-8 h-8" />
               </div>
               <div className="max-w-md">
                 <h4 className="text-xl font-black text-gray-950 mb-1">Seguridad Quántica</h4>
                 <p className="text-gray-500 text-sm font-medium leading-relaxed opacity-70">
                   Auditado y verificado por Quantic Labs. Encriptación de nivel militar para tus transacciones.
                 </p>
               </div>
             </div>
             <div className="flex items-center gap-8 relative z-10 grayscale group-hover:grayscale-0 transition-all opacity-20 group-hover:opacity-50">
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-10" />
             </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

function Feature({ text, highlight = false }: { text: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-emerald-500 text-black' : 'bg-emerald-500/10 text-emerald-500'}`}>
        <Check className="w-3 h-3 stroke-[4]" />
      </div>
      <span className={`text-[11px] font-bold tracking-tight ${highlight ? 'text-emerald-400' : 'opacity-70'}`}>
        {text}
      </span>
    </div>
  );
}
