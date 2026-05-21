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
      gsap.to(beamRef.current, {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: "none"
      });
    }

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

    gsap.to(cardRef.current.querySelectorAll('.parallax-el'), {
      x: (x - 0.5) * 15,
      y: (y - 0.5) * 15,
      duration: 0.6,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)"
    });
    gsap.to(cardRef.current.querySelectorAll('.parallax-el'), {
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
        <div 
          ref={beamRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,#3B82F6_85%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        />

        <div 
          ref={cardRef}
          className="relative w-full h-full bg-white/70 backdrop-blur-3xl rounded-3xl p-8 border border-slate-200/60 flex flex-col shadow-xl shadow-slate-200/50"
        >
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 w-fit mb-8 parallax-el border border-amber-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-[0.2em] text-slate-900 parallax-el">Estado: Desconectado</h3>
          <p className="text-sm text-slate-500 mt-3 font-semibold parallax-el">
            Tu mentoría opera en modo restringido. Activa una suscripción para desbloquear el potencial total.
          </p>
          
          <Link 
            href="/dashboard/subscriptions"
            className="mt-auto flex items-center justify-between w-full h-16 px-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all hover:scale-[1.02] shadow-xl shadow-blue-600/20 group-hover:gap-4 active:scale-95"
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
  });

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`w-full h-full p-[2px] rounded-[2.5rem] overflow-hidden relative group transition-all duration-700`}
      style={{ perspective: '1200px' }}
    >
      <div 
        ref={beamRef}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_60%,#3B82F6_40%,transparent_100%)] opacity-0 group-hover:opacity-40 transition-opacity duration-1000`}
      />

      <div 
        ref={cardRef}
        className={`relative w-full h-full rounded-[2.4rem] p-8 backdrop-blur-3xl border border-white/80 flex flex-col transition-all duration-700 bg-white/80 text-slate-900 shadow-xl shadow-slate-200/50`}
      >
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none opacity-40">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`absolute w-32 h-32 rounded-full blur-[60px] bg-blue-100`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mb-10 parallax-el">
          <div className={`p-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100`}>
            {isPremium ? <Zap className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
          </div>
          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/20`}>
            {subscription.status}
          </div>
        </div>

        <div className="parallax-el">
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-blue-600/40`}>
            Suscripción Vigente
          </p>
          <h3 className={`text-4xl font-black tracking-tighter italic bg-gradient-to-br from-slate-900 to-slate-400 bg-clip-text text-transparent`}>
            {subscription.plan.name}
          </h3>
        </div>

        <div className="mt-10 space-y-6 parallax-el">
          <div className="flex items-center gap-4 group/item">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50`}>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Expira en</p>
              <p className="text-xs font-bold text-slate-700">{expiresDate}</p>
            </div>
          </div>
          
          {Object.entries(subscription.usage || {}).map(([key, usage]: [string, any]) => (
            <div key={key} className={`pt-6 border-t border-slate-100`}>
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
                  {key === 'users' ? 'Capacidad de Staff' : key === 'branches' ? 'Límite de Sedes' : key}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-900">{usage.current || 0}</span>
                  <span className="text-[10px] font-bold text-slate-300">/ {usage.limit || 0}</span>
                </div>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden p-[1px] bg-slate-100`}>
                <div 
                  className="h-full bg-blue-600 transition-all duration-1000 ease-out relative group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${Math.min(100, ((usage.current || 0) / (usage.limit || 1)) * 100)}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link 
          href="/dashboard/subscriptions"
          className={`mt-10 flex items-center justify-center gap-3 w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20`}
        >
          <span className="relative z-10">Optimizar Plan</span>
          <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>

  );
};
