'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral uppercase tracking-tighter">
              Configuración
            </h1>
            <p className="text-[10px] text-neutral/40 font-black uppercase tracking-[0.3em] mt-1">
              Ajustes del Sistema
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 p-16 text-center">
          <p className="text-neutral/20 text-sm font-bold italic">
            Próximamente: configuración global, planes, permisos y parámetros del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
