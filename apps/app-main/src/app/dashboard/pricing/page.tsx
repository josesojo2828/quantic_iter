'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Check,
  Zap,
  Shield,
  Rocket,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { Sidebar } from '@/shared/components/Sidebar';
import { subscriptionService, Plan } from '@/services/subscription.service';

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await subscriptionService.getPlans();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    if (!loading && plans.length > 0) {
      gsap.fromTo(cardsRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out'
        }
      );
    }
  }, [loading, plans]);

  return (
    <div className="flex min-h-screen bg-gray-50" ref={containerRef}>
      <Sidebar />

      <main className="flex-1 p-10 ml-32">
        <div className="max-w-6xl mx-auto">
          <header className="mb-14">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Planes de Suscripción
            </h1>
            <p className="text-gray-500 max-w-2xl text-base font-medium">
              Escala tu taller con herramientas profesionales. Cambia de plan en cualquier momento según tus necesidades operativas.
            </p>
          </header>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  ref={el => cardsRef.current[index] = el}
                  className="admin-card p-8 flex flex-col relative overflow-hidden group"
                >
                  {plan.slug === 'premium' && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-bl-lg">
                        Recomendado
                      </div>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500 font-medium italic">Gestión Profesional</p>
                  </div>

                  <div className="flex items-baseline mb-10">
                    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">${plan.price}</span>
                    <span className="text-gray-400 text-sm font-semibold ml-2">/ mes</span>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    <FeatureItem text={`${plan.config.maxUsers} Trabajadores incluidos`} />
                    <FeatureItem text="Gestión de Vehículos ilimitada" />
                    <FeatureItem text="Facturación Digital y Reportes" />
                    <FeatureItem text="Soporte Técnico Especializado" />
                    <FeatureItem text="Módulo de Inventario Básico" />
                  </div>

                  <button className="w-full py-3.5 rounded-xl bg-gray-900 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-emerald-600 active:scale-[0.98]">
                    Seleccionar Plan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Billing Info Footer */}
          <div className="mt-16 admin-card p-8 bg-white flex flex-col md:flex-row items-center justify-between gap-6 border-dashed">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Seguridad Quántica en Pagos</h4>
                <p className="text-gray-500 text-sm font-medium">Transacciones procesadas bajo protocolos de alta seguridad industrial.</p>
              </div>
            </div>
            <div className="flex gap-6 opacity-30">
              <Shield className="w-7 h-7 text-gray-400" />
              <Zap className="w-7 h-7 text-gray-400" />
              <Rocket className="w-7 h-7 text-gray-400" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 p-0.5 bg-emerald-100 rounded-md">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      </div>
      <span className="text-gray-600 text-sm font-medium">{text}</span>
    </div>
  );
}

