'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { useAuth } from '@/core/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/core/api/api.client';
import { 
  Zap, 
  Shield, 
  Rocket, 
  Check, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subscriptionService, Plan } from '@/services/subscription.service';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  console.log('[CRITICAL-LAYOUT] Renderizado del Layout de Dashboard. User:', user, 'loading:', loading);
  if (user) {
    console.log('[CRITICAL-LAYOUT] User JSON:', JSON.stringify(user, null, 2));
  }

  const [hasSubscription, setHasSubscription] = useState<boolean>(true);
  const [checkingSub, setCheckingSub] = useState<boolean>(true);
  const [activating, setActivating] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const plansSectionRef = useRef<HTMLDivElement>(null);

  // Fetch all subscription plans
  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const plansData = await subscriptionService.getPlans();
      setPlans(plansData);
    } catch (err) {
      console.error('Error fetching plans in layout:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Check subscription status if user is the tenant owner
  const checkSubscription = async () => {
    if (!user?.tenantId) {
      setCheckingSub(false);
      return;
    }

    // Only owners need to have a checked subscription to operate the business
    const activeRole = user.roles?.find((r: any) => r.tenantId === user.tenantId);
    const isOwner = activeRole?.roleSlug === 'mentor_owner' || user.role === 'mentor_owner';
    
    if (!isOwner) {
      setHasSubscription(true);
      setCheckingSub(false);
      return;
    }

    try {
      console.log('[DEBUG-SUB] 📡 Consultando estado de suscripción para tenant:', user.tenantId);
      const data = await apiClient.get<any>('/subscriptions/my');
      console.log('[DEBUG-SUB] 📦 Datos recibidos del API:', data);
      
      // Si la API devuelve un objeto de error de NestJS (como 404), no tendrá data.plan
      if (data && data.plan && !data.statusCode) {
        console.log('[DEBUG-SUB] ✅ Suscripción activa y válida encontrada:', data.plan.name);
        setHasSubscription(true);
      } else {
        console.log('[DEBUG-SUB] ⚠️ No se detectó ninguna suscripción activa (Setup State necesario).');
        setHasSubscription(false);
        fetchPlans();
      }
    } catch (error: any) {
      console.error('[DEBUG-SUB] 🔴 Error de red al consultar suscripción:', error);
      // Since apiClient throws a standard JS Error with backend message, check both the message text and custom fields
      if (
        error.message?.includes('Suscripción no encontrada') || 
        error.message?.includes('no encontrada') ||
        error.response?.status === 404
      ) {
        setHasSubscription(false);
        fetchPlans();
      } else {
        // Fallback to true if server is doing initial sync, to prevent locking out on network glitches
        setHasSubscription(true);
      }
    } finally {
      setCheckingSub(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      checkSubscription();
    } else if (!loading && !user) {
      setCheckingSub(false);
    }
  }, [user, loading, pathname]);

  // Handle redirects in useEffect to prevent rendering-time state updates in Next.js Router
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'mentee' && pathname !== '/dashboard') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  // Handle active trial activation
  const handleActivateTrial = async () => {
    if (activating) return;
    setActivating(true);
    const promise = apiClient.post('/subscriptions/upgrade', { planSlug: 'basico' });

    toast.promise(promise, {
      loading: 'Configurando tu entorno de marca personal...',
      success: () => {
        refreshProfile().then(() => {
          setHasSubscription(true);
          setActivating(false);
        });
        return '¡Felicidades! Tu prueba gratuita de 14 días ha sido activada con éxito. 🎉';
      },
      error: (err) => {
        setActivating(false);
        return err.message || 'Error al activar tu periodo de prueba';
      }
    });
  };

  // Handle manual plan upgrade
  const handleSelectPlan = async (plan: Plan) => {
    if (processingId) return;
    setProcessingId(plan.id);
    const promise = subscriptionService.upgrade(plan.slug);

    toast.promise(promise, {
      loading: `Procesando plan ${plan.name}...`,
      success: () => {
        refreshProfile().then(() => {
          setHasSubscription(true);
          setProcessingId(null);
        });
        return `¡Solicitud de plan ${plan.name} procesada con éxito! 🎉`;
      },
      error: (err) => {
        setProcessingId(null);
        return err.message || 'Error al actualizar el plan';
      }
    });
  };

  // Smooth scroll to inline plans section
  const scrollToPlans = () => {
    plansSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // If loading user session or checking subscription status
  if (loading || (checkingSub && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 border-[6px] border-indigo-50 border-t-[#8A94F4] rounded-full animate-spin shadow-2xl" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse italic">Iniciando Sistemas de Comando...</p>
        </div>
      </div>
    );
  }

  // Prevent rendering if user not authenticated
  if (!user) {
    return null;
  }

  // If the user is a mentee/client, we bypass the sidebar layout.
  if (user.role === 'mentee') {
    if (pathname !== '/dashboard') {
      return null;
    }
    return <>{children}</>;
  }

  const isPricingPage = pathname === '/dashboard/pricing';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F8F9FD] to-[#F1F4FF]">
      <Sidebar disabled={!hasSubscription} />
      <main className="flex-1 transition-all duration-500 min-h-screen relative z-10 overflow-y-auto mentor-scroll">
        {!hasSubscription && !isPricingPage ? (
          /* Premium Setup State Paywall - Aura 2.0 Aesthetic */
          <div className="w-full flex flex-col items-center justify-start p-4 lg:p-8 py-16 gap-16 animate-in fade-in zoom-in-95 duration-700">
            
            {/* Main Welcome & Trial Card */}
            <div className="max-w-3xl w-full glass-card bg-white/70 backdrop-blur-2xl p-8 lg:p-12 rounded-[40px] border border-white shadow-[0_20px_50px_rgba(138,148,244,0.08)] relative overflow-hidden group">
              {/* Top ambient light glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8A94F4]/10 rounded-full blur-[120px] pointer-events-none" />
              
              <div className="text-center space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#8A94F4]/10 text-[#8A94F4] rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#8A94F4]/20 shadow-sm animate-bounce">
                  <Sparkles className="w-3.5 h-3.5" />
                  Activación de Marca Personal
                </div>

                <div className="w-20 h-20 bg-gradient-to-br from-[#8A94F4] to-[#B1B8F9] text-white rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-[#8A94F4]/20 relative group-hover:scale-105 transition-transform duration-500">
                  <Lock className="w-8 h-8 text-white animate-pulse" />
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
                  Llevá tu marca al <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#8A94F4] to-[#B1B8F9]">siguiente nivel</span>
                </h1>
                
                <p className="text-slate-500 max-w-xl mx-auto text-[10px] font-black tracking-widest leading-relaxed uppercase opacity-70">
                  Establecé tu ecosistema de mentoría independiente con total control operativo. Iniciá hoy mismo tu periodo de prueba totalmente gratis y sin compromisos.
                </p>

                {/* Trial Benefits Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto bg-slate-50/50 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-inner mt-8 text-left">
                  {[
                    '14 Días de Prueba Sin Costo',
                    'Hasta 5 Entrenadores / Staff',
                    'Hasta 50 Alumnos Activos',
                    'Gestión de Hábitos y Rutinas',
                    'Programas de Entrenamiento',
                    'Dashboard e Informes de Progreso'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#8A94F4]/10 text-[#8A94F4] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[4]" />
                      </div>
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Call to Actions */}
                <div className="flex justify-center mt-10">
                  <button
                     onClick={scrollToPlans}
                     className="w-full sm:w-auto px-10 py-5.5 bg-gradient-to-r from-[#8A94F4] to-[#7C3AED] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-[#8A94F4]/20 active:scale-95 shadow-lg border border-[#8A94F4]/20 italic cursor-pointer animate-pulse"
                  >
                    Elegir Plan y Comenzar Prueba
                    <Zap className="w-4 h-4 fill-white" />
                  </button>
                </div>

                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-6 opacity-60">
                  * No se requiere tarjeta de crédito para iniciar la prueba gratuita de 14 días.
                </p>
              </div>
            </div>

            {/* Inline Scrollable Plans Grid */}
            <div ref={plansSectionRef} className="w-full max-w-5xl space-y-10 pt-10 scroll-mt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#8A94F4]/10 text-[#8A94F4] rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#8A94F4]/20 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ecosistemas Flexibles
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
                  Seleccioná tu <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#8A94F4] to-[#B1B8F9]">Protocolo de Operación</span>
                </h2>
                <p className="text-slate-500 max-w-md mx-auto text-[10px] font-black uppercase tracking-widest leading-relaxed opacity-70">
                  Elegí el nivel de potencia que necesita tu negocio y escala tu marca personal.
                </p>
              </div>

              {loadingPlans ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-12 h-12 text-[#8A94F4] animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                  {plans.map((plan: any) => {
                    const isEnterprise = plan.slug.startsWith('enterprise');
                    const isPro = plan.slug === 'pro';
                    return (
                      <div
                        key={plan.id}
                        className={`group glass-card relative flex flex-col rounded-[40px] border transition-all duration-700 hover:-translate-y-2 p-10 ${
                          isEnterprise
                            ? 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-slate-900/40'
                            : 'bg-white/70 backdrop-blur-xl border-white shadow-soft text-slate-900'
                        }`}
                      >
                        <div className="flex-1 flex flex-col relative z-10">
                          {/* Top Card Icon & Tag */}
                          <div className="flex justify-between items-start mb-8">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
                              isEnterprise ? 'bg-white/10 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'
                             }`}>
                               {plan.slug === 'basico' ? <Shield className="w-5 h-5" /> : (isPro ? <Zap className="w-5 h-5" /> : <Rocket className="w-5 h-5" />)}
                             </div>
                             
                             {isPro && (
                               <span className="px-3.5 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-widest bg-gradient-to-br from-[#8A94F4] to-[#B1B8F9] text-white shadow-lg shadow-[#8A94F4]/20 border border-[#8A94F4]/30">
                                 Recomendado
                               </span>
                             )}
                          </div>

                          <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">{plan.name}</h3>
                          <p className={`text-[9.5px] font-black uppercase tracking-widest mb-8 leading-relaxed ${isEnterprise ? 'text-slate-500' : 'text-slate-400'}`}>
                            {plan.description || 'Potenciá tu control con herramientas avanzadas.'}
                          </p>

                          <div className="flex items-baseline mb-8">
                            <span className="text-4xl font-black tracking-tighter italic">${plan.price}</span>
                            <span className="text-[9.5px] font-black uppercase tracking-widest ml-2.5 opacity-40">/ mes</span>
                          </div>

                          {/* Features Checklist */}
                          <div className="space-y-4 mb-8 flex-1">
                            {plan.slug === 'basico' && (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    1 Coach Independiente
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    Hasta 25 Alumnos Activos
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    Planificación Esencial
                                  </span>
                                </div>
                              </>
                            )}
                            {plan.slug === 'pro' && (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    1 Coach + 1 Staff
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    Hasta 500 Alumnos Activos
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    Página Web Personalizada
                                  </span>
                                </div>
                              </>
                            )}
                            {plan.slug === 'enterprise' && (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    Hasta 20 Coordinadores
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    Hasta 5000 Alumnos Activos
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    Soporte VIP 24/7 Priority
                                  </span>
                                </div>
                              </>
                            )}
                            {plan.slug === 'enterprise_pro' && (
                              <>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    Coaches/Staff Ilimitados
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    Asistencias e Inventario
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isEnterprise ? 'bg-[#8A94F4]/20 text-[#8A94F4]' : 'bg-[#8A94F4]/10 text-[#8A94F4]'}`}>
                                    <Check className="w-3 h-3 stroke-[4]" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-tight ${isEnterprise ? 'text-slate-400' : 'text-slate-600 opacity-80'}`}>
                                    Sitio Web de la Academia
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {plan.config?.disabled ? (
                            <button
                              disabled
                              className="w-full py-5 rounded-2xl font-black text-[9.5px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 border transition-all bg-amber-500/10 text-amber-500 border-amber-500/20 cursor-not-allowed"
                            >
                              Próximamente <Sparkles className="w-4 h-4 animate-pulse" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSelectPlan(plan)}
                              disabled={!!processingId}
                              className={`w-full py-5 rounded-2xl font-black text-[9.5px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
                                isEnterprise
                                  ? 'bg-gradient-to-br from-[#8A94F4] to-[#7C3AED] text-white shadow-lg border border-[#8A94F4]/20 hover:brightness-105'
                                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-slate-700'
                              }`}
                            >
                              {processingId === plan.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>Iniciar Prueba Gratis 14 Días <Zap className="w-3.5 h-3.5 fill-white" /></>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
