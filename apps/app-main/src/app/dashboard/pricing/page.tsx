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
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full p-6 lg:p-10 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Section */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Suscripciones Quánticas
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Escalá tu <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-emerald-700">Academia</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm font-medium leading-relaxed uppercase tracking-widest opacity-70">
            Herramientas de nivel industrial para mentoríaes que buscan excelencia operativa y escalabilidad total.
          </p>
        </header>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const isActive = currentSubscription?.plan?.slug === plan.slug;
            const isScheduled = currentSubscription?.nextPlan?.slug === plan.slug;
            const isEnterprise = plan.slug.startsWith('enterprise');
            const isProEnterprise = plan.slug === 'enterprise_pro';

            return (
              <div
                key={plan.id}
                ref={el => { cardsRef.current[index] = el; }}
                className={`group glass-card relative flex flex-col rounded-[40px] border transition-all duration-700 hover:-translate-y-2 ${
                  isEnterprise 
                    ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-slate-900/40 text-white' 
                    : 'bg-white/70 backdrop-blur-xl border-white shadow-soft text-slate-900'
                } ${isActive ? 'ring-4 ring-emerald-500/20 border-emerald-500/30' : ''}`}
              >
                {/* Visual Accent */}
                {isEnterprise && (
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className={`w-32 h-32 ${isProEnterprise ? 'text-amber-400' : 'text-emerald-400'}`} />
                   </div>
                )}

                <div className="p-10 flex-1 flex flex-col relative z-10">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                      isEnterprise ? 'bg-white/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {plan.slug === 'basico' ? <Shield className="w-6 h-6" /> : (plan.slug === 'pro' ? <Zap className="w-6 h-6" /> : <Rocket className="w-6 h-6" />)}
                    </div>
                    
                    {(isActive || isScheduled || isProEnterprise) && (
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        isActive ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-200' : 
                        isScheduled ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-200' : 
                        'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-200'
                      }`}>
                        {isActive ? 'Activo' : isScheduled ? 'Siguiente' : 'Elite'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">{plan.name}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-10 ${isEnterprise ? 'text-slate-500' : 'text-slate-400'}`}>
                    {plan.description}
                  </p>

                  <div className="flex items-baseline mb-12">
                    <span className="text-5xl font-black tracking-tighter italic">${plan.price}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ml-3 opacity-40`}>/ mes</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-12 flex-1">
                    <Feature text={`${plan.config.maxUsers} Usuarios Admin`} isDark={isEnterprise} />
                    <Feature text={`${plan.config.maxMentees} Alumnos Activos`} isDark={isEnterprise} />
                    {isEnterprise && (
                      <>
                        <Feature text={`${isProEnterprise ? 'Sucursales Ilimitadas' : 'Hasta 5 Sucursales'}`} highlight isDark={isEnterprise} />
                        <Feature text="Auditoría Forense Quántica" highlight isDark={isEnterprise} />
                      </>
                    )}
                    {plan.slug !== 'basico' && <Feature text="Soporte VIP 24/7" isDark={isEnterprise} />}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={!!processingId || isActive || isScheduled}
                    className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:scale-100 ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                        : isScheduled
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 cursor-default'
                          : isEnterprise
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 border border-emerald-400/30'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 border border-slate-700/30'
                    }`}
                  >
                    {processingId === plan.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isActive ? (
                      <>Plan Actual <Check className="w-5 h-5" /></>
                    ) : isScheduled ? (
                      <>Plan Siguiente <Calendar className="w-5 h-5" /></>
                    ) : (
                      <>Activar Ahora <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Footer */}
        <footer className="glass-card bg-white/70 backdrop-blur-xl p-12 rounded-[40px] border border-white shadow-soft flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-opacity duration-700 group-hover:bg-emerald-500/10" />
           
           <div className="flex items-center gap-8 relative z-10">
             <div className="w-20 h-20 bg-emerald-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-emerald-200 transition-transform group-hover:rotate-12">
               <CreditCard className="w-10 h-10" />
             </div>
             <div className="max-w-md">
               <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2 italic">Seguridad Quántica</h4>
               <p className="text-slate-500 text-xs font-black uppercase tracking-widest leading-relaxed opacity-70">
                 Auditado y verificado por Quantic Labs. Encriptación de nivel militar para proteger tus transacciones operativas.
               </p>
             </div>
           </div>
           
           <div className="flex items-center gap-10 relative z-10 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-10" />
           </div>
        </footer>
      </div>
    </div>
  );
}

function Feature({ text, highlight = false, isDark = false }: { text: string; highlight?: boolean; isDark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/10 text-emerald-400' : 'bg-emerald-500/10 text-emerald-500')}`}>
        <Check className="w-3 h-3 stroke-[4]" />
      </div>
      <span className={`text-[11px] font-black uppercase tracking-tight ${highlight ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-slate-400' : 'text-slate-600 opacity-70')}`}>
        {text}
      </span>
    </div>
  );
}
