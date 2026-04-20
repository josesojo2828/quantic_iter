'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export const RecoverPasswordForm = () => {
  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2 mb-6">
        <p className="text-sm text-gray-500 font-medium leading-relaxed italic">
          Ingresa tu correo corporativo y te enviaremos un enlace seguro para restaurar tu acceso al sistema.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
          Correo Electrónico
        </label>
        <div className="relative">
          <input
            type="email"
            placeholder="usuario@quantic.com"
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3.5 pl-11 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
          />
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-lg shadow-md shadow-emerald-600/10 transform transition-all active:scale-[0.98] uppercase tracking-wider text-xs">
        Enviar Enlace de Recuperación
      </button>

      <div className="text-center pt-4 border-t border-gray-100 italic">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-emerald-700 font-bold transition-colors uppercase tracking-tighter"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio de Sesión
        </Link>
      </div>
    </form>
  );
};

