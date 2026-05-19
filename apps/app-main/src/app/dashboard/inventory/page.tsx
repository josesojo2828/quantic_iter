'use client';

import React, { useRef } from 'react';
import { 
  Box, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Plus, 
  ChevronRight,
  RefreshCcw,
  BarChart3
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function InventoryPage() {
  const headerRef = useRef<HTMLDivElement>(null);

  const mockInventory = [
    { id: 1, name: 'Suministros de Oficina Premium', stock: 124, status: 'Full', category: 'General' },
    { id: 2, name: 'Hardware de Diagnóstico V3', stock: 12, status: 'Low Stock', category: 'Equipamiento' },
    { id: 3, name: 'Licencias de Software Aura', stock: 50, status: 'Full', category: 'Digital' },
  ];

  return (
    <div className="w-full p-6 lg:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster />
      
      {/* Header */}
      <header ref={headerRef} className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Control</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Inventario <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-emerald-700">Industrial</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 max-w-2xl text-sm leading-relaxed">
            Control integral de activos físicos y digitales. Gestiona el stock con precisión cuántica.
          </p>
        </div>

        <button className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 group">
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> 
          Registrar Activo
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Activos', value: '2.4k', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Valor Estimado', value: '$124k', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Alertas Stock', value: '04', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card bg-white/70 backdrop-blur-xl p-8 rounded-[32px] border border-white shadow-soft flex items-center justify-between group hover:scale-[1.02] transition-transform duration-500">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{kpi.value}</p>
            </div>
            <div className={`w-14 h-14 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Inventory List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
            Control de Existencias
          </h3>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5" />
                <input type="text" placeholder="BUSCAR ACTIVO..." className="bg-white/50 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-emerald-600/20 transition-all w-64 shadow-sm" />
              </div>
              <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                <RefreshCcw className="w-4 h-4" />
              </button>
          </div>
        </div>

        <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-soft overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 backdrop-blur-md">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activo</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoría</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Estado</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {mockInventory.map((item) => (
                <tr key={item.id} className="hover:bg-emerald-50/30 transition-all duration-300 group/row">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center group-hover/row:scale-110 transition-transform shadow-sm">
                        <Box className="w-6 h-6 text-emerald-500" />
                      </div>
                      <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{item.category}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                       <BarChart3 className="w-4 h-4 text-slate-300" />
                       <span className="text-sm font-black text-slate-900">{item.stock} Unidades</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                      item.status === 'Full' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                    }`}>
                      {item.status === 'Full' ? 'Abundante' : 'Stock Bajo'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="p-2.5 text-slate-400 hover:text-emerald-600 transition-all opacity-0 group-hover/row:opacity-100">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
