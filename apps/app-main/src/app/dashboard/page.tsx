'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Car, 
  Users, 
  Clock, 
  Search, 
  Bell, 
  PlusCircle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Shield
} from 'lucide-react';

import { Sidebar } from '@/shared/components/Sidebar';
import { apiClient } from '@/core/api/api.client';

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
            <p className="text-sm text-gray-500 font-medium font-inter mt-1 italic">Gestión operativa centralizada Quantic Mechanix.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar por placa o cliente..." 
                className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 w-72 transition-all shadow-sm"
              />
            </div>
            <button className="relative p-2.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
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
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${stat.trendType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stat.trend}
                    {stat.trendType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Reparaciones en Curso</h2>
                <p className="text-[10px] text-gray-500 font-medium font-inter mt-1 italic">Estado actual de los vehículos en taller.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-all shadow-md">
                <PlusCircle className="w-4 h-4" /> Registrar Ingreso
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 italic">
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Vehículo / Cliente</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Tiempo</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {metrics?.recentRepairs?.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 text-xs font-mono font-bold text-gray-400">#{row.id.split('-')[1]}</td>
                      <td className="py-4">
                        <p className="text-sm font-bold text-gray-900">{row.vehicle}</p>
                        <p className="text-xs text-gray-500 font-medium">{row.client}</p>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          row.status === 'Finalizado' ? 'bg-emerald-100 text-emerald-700' : 
                          row.status === 'Diagnóstico' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs font-bold text-gray-600">{row.time}</td>
                      <td className="py-4 text-right">
                        <button className="p-1 text-gray-400 hover:text-gray-900">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Panel: Schedule */}
          <div className="admin-card p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Agenda del Día</h2>
            <div className="space-y-6">
              {[
                { time: '14:30', task: 'Cambio de Aceite', sub: 'VW Golf GTI', priority: 'high' },
                { time: '16:00', task: 'Revisión Frenos', sub: 'Honda CR-V', priority: 'medium' },
                { time: '17:30', task: 'Alineación', sub: 'BMW M2', priority: 'low' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i < 2 && <div className="absolute left-[7px] top-6 bottom-[-24px] w-0.5 bg-gray-100"></div>}
                  <div className={`w-4 h-4 rounded-full border-2 bg-white z-10 mt-1 ${
                    item.priority === 'high' ? 'border-red-500' : item.priority === 'medium' ? 'border-amber-500' : 'border-emerald-500'
                  }`}></div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.time}</span>
                    <h4 className="text-sm font-bold text-gray-900 leading-none mt-0.5">{item.task}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all">
              Ver Agenda Completa
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

