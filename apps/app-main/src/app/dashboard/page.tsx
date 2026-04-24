'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Car, 
  Users, 
  Clock, 
  Bell, 
  Loader2,
  Shield
} from 'lucide-react';


import { Sidebar } from '@/shared/components/Sidebar';
import { apiClient } from '@/core/api/api.client';
import { SubscriptionCard } from '@/features/dashboard/components/SubscriptionCard';

export default function DashboardPage() {

  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiClient.get<any>('/dashboard/metrics');
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const iconMap: Record<string, any> = {
    'Trabajadores Activos': Users,
    'Plan Activo': Shield, // I'll use Wrench as fallback or shield if I import it
    'Uso de Licencia': Clock,
    'Estado Global': Wrench,
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-32 p-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Panel de Control</h1>
            <p className="text-sm text-gray-500 font-medium font-inter mt-1 italic">Métricas y operativa centralizada.</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {metrics?.stats?.map((stat: any, i: number) => {
            const Icon = iconMap[stat.label] || Wrench;
            return (
              <div key={i} className="admin-card p-5 group cursor-default">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-lg bg-emerald-50 text-emerald-600`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline justify-between mt-1">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.trend && (
                    <p className={`text-[10px] font-bold italic ${stat.trend.includes('Próximo') ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {stat.trend}
                    </p>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Work Orders placeholder */}
          <div className="lg:col-span-2 admin-card p-12 flex flex-col items-center justify-center text-center opacity-60">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Car className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Sin Órdenes Activas</h2>
            <p className="text-xs text-gray-400 mt-2 italic">Las reparaciones en curso aparecerán aquí.</p>
          </div>

          {/* Subscription Status Card */}
          <div className="lg:col-span-1">
            <SubscriptionCard subscription={metrics?.subscription} />
          </div>
        </div>
      </main>
    </div>
  );
}



