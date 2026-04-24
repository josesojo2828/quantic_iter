'use client';

import React from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { Wrench, Construction } from 'lucide-react';

export default function WorksPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-32 p-10">
        <header className="mb-10">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Órdenes de Trabajo</h1>
          <p className="text-sm text-gray-500 font-medium font-inter mt-1 italic">Seguimiento de reparaciones y servicios en tiempo real.</p>
        </header>

        <div className="admin-card py-20 flex flex-col items-center justify-center text-center opacity-80 border-dashed border-2">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6">
            <Wrench className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-2">Módulo en Construcción</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto italic">
            El motor de gestión de servicios está siendo calibrado. Muy pronto vas a poder digitalizar cada reparación de tu taller.
          </p>
          
          <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Construction className="w-3 h-3" />
            En Desarrollo
          </div>
        </div>
      </main>
    </div>
  );
}
