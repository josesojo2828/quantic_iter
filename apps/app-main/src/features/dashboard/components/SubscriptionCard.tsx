import React, { useEffect, useRef } from 'react';
import { Shield, Sparkles, AlertTriangle, ArrowRight, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';
import gsap from 'gsap';

interface SubscriptionCardProps {
  subscription: any;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (beamRef.current) {
      // Endless border beam animation
      gsap.to(beamRef.current, {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: "none"
      });
    }

    // Floating particles animation
    if (particlesRef.current) {
      const particles = particlesRef.current.children;
      gsap.to(particles, {
        y: "-=20",
        x: "+=10",
        opacity: 0.1,
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        stagger: {
          amount: 2,
          from: "random"
        },
        ease: "sine.inOut"
      });
    }
  }, [subscription]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !containerRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (clientX - left) / width;
    const y = (clientY - top) / height;
    
    const rotateX = (y - 0.5) * 15;
    const rotateY = (x - 0.5) * -15;

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      duration: 0.6,
      ease: "power3.out",
      transformPerspective: 1200
    });

    // Subtle parallax for content
    gsap.to(cardRef.current.querySelectorAll('.parallax-el'), {
      x: (x - 0.5) * 15,
      y: (y - 0.5) * 15,
      duration: 0.6,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)"
    });
    gsap.to(cardRef.current?.querySelectorAll('.parallax-el'), {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  };

  if (!subscription) {
    return (
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full p-[2px] rounded-3xl overflow-hidden relative group"
        style={{ perspective: '1200px' }}
      >
        {/* Border Beam */}
        <div 
          ref={beamRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,#f59e0b_85%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        />

        <div 
          ref={cardRef}
          className="relative w-full h-full bg-amber-50/80 backdrop-blur-3xl rounded-3xl p-8 border border-amber-200/50 flex flex-col shadow-2xl shadow-amber-900/10"
        >
          <div className="p-4 bg-amber-100 rounded-2xl text-amber-600 w-fit mb-8 parallax-el">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-[0.2em] text-amber-950 parallax-el">Estado: Desconectado</h3>
          <p className="text-sm text-amber-900/40 mt-3 font-semibold parallax-el">
            Tu taller opera en modo restringido. Activa una suscripción para desbloquear el potencial total.
          </p>
          
          <Link 
            href="/dashboard/subscriptions"
            className="mt-auto flex items-center justify-between w-full h-16 px-6 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all hover:scale-[1.02] shadow-xl shadow-amber-600/30 group-hover:gap-4 active:scale-95"
          >
            Configurar Suscripción
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  const isPremium = subscription.plan.price > 0;
  const expiresDate = new Date(subscription.expiresAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`w-full h-full p-[2px] rounded-[2.5rem] overflow-hidden relative group transition-all duration-700 ${
        isPremium ? 'shadow-[0_40px_80px_-20px_var(--quantic-glow)]' : 'shadow-xl shadow-emerald-900/5'
      }`}
      style={{ perspective: '1200px' }}
    >
      {/* Border Beam */}
      <div 
        ref={beamRef}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_60%,var(--quantic-primary)_85%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000`}
      />

      <div 
        ref={cardRef}
        className={`relative w-full h-full rounded-[2.4rem] p-8 backdrop-blur-3xl border border-white/10 flex flex-col transition-all duration-700 ${
          isPremium ? 'bg-[var(--quantic-dark)] text-white' : 'bg-emerald-50/90 text-emerald-950 border-emerald-100'
        }`}
      >
        {/* Background Particles */}
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none opacity-40">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`absolute w-32 h-32 rounded-full blur-[60px] ${isPremium ? 'bg-[var(--quantic-primary)]/10' : 'bg-emerald-400/20'}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mb-10 parallax-el">
          <div className={`p-4 rounded-2xl ${isPremium ? 'bg-[var(--quantic-primary)]/10 text-[var(--quantic-primary)] border border-[var(--quantic-primary)]/20' : 'bg-emerald-100 text-emerald-700'}`}>
            {isPremium ? <Zap className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
          </div>
          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${
            isPremium 
              ? 'bg-[var(--quantic-primary)] text-black border-[var(--quantic-primary)] shadow-[0_0_20px_var(--quantic-glow)]' 
              : 'bg-emerald-200/50 text-emerald-800 border-emerald-300'
          }`}>
            {subscription.status}
          </div>
        </div>

        <div className="parallax-el">
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isPremium ? 'text-[var(--quantic-primary)]/50' : 'text-emerald-600'}`}>
            Suscripción Vigente
          </p>
          <h3 className={`text-4xl font-black tracking-tighter italic ${isPremium ? 'bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent' : ''}`}>
            {subscription.plan.name}
          </h3>
        </div>

        <div className="mt-10 space-y-6 parallax-el">
          <div className="flex items-center gap-4 group/item">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPremium ? 'bg-white/5' : 'bg-emerald-100'}`}>
              <Calendar className="w-4 h-4 text-[var(--quantic-primary)]" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Expira en</p>
              <p className="text-xs font-bold">{expiresDate}</p>
            </div>
          </div>
          
          {Object.entries(subscription.usage || {}).map(([key, usage]: [string, any]) => (
            <div key={key} className={`pt-6 border-t ${isPremium ? 'border-white/5' : 'border-emerald-100'}`}>
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">
                  {key === 'users' ? 'Capacidad de Staff' : key === 'branches' ? 'Límite de Sedes' : key}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black">{usage.current || 0}</span>
                  <span className="text-[10px] font-bold opacity-30">/ {usage.limit || 0}</span>
                </div>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden p-[1px] ${isPremium ? 'bg-white/5' : 'bg-emerald-100'}`}>
                <div 
                  className="h-full bg-[var(--quantic-primary)] transition-all duration-1000 ease-out relative group-hover:shadow-[0_0_25px_var(--quantic-primary)]" 
                  style={{ width: `${Math.min(100, ((usage.current || 0) / (usage.limit || 1)) * 100)}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>
          ))}

          {subscription.nextPlan && (
            <div className={`mt-6 p-4 rounded-2xl border flex items-center gap-4 parallax-el transition-all duration-700 hover:scale-[1.02] ${
              isPremium ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={`text-[9px] font-black uppercase tracking-widest ${isPremium ? 'text-blue-400' : 'text-blue-600'}`}>Siguiente ciclo</p>
                  <span className="text-[8px] font-black px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20">Programado</span>
                </div>
                <p className={`text-xs font-black ${isPremium ? 'text-white' : 'text-blue-950'}`}>{subscription.nextPlan.name}</p>
              </div>
            </div>
          )}
        </div>

        <Link 
          href="/dashboard/subscriptions"
          className={`mt-10 flex items-center justify-center gap-3 w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn ${
            isPremium 
              ? 'bg-[var(--quantic-primary)] text-black hover:bg-[var(--quantic-primary)]/80 shadow-2xl shadow-[var(--quantic-glow)]' 
              : 'bg-[var(--quantic-dark)] text-white hover:bg-black shadow-xl shadow-emerald-950/20'
          }`}
        >
          <span className="relative z-10">Optimizar Plan</span>

          <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
