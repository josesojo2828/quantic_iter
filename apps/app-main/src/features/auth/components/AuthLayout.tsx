import React from 'react';
import { Logo } from '@/shared/components/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle?: string;
  title?: string;
}

export const AuthLayout = ({ children, subtitle, title }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-gray-50 font-sans antialiased text-gray-900">
      {/* Left Column: Form Section */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white shadow-xl z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
               <Logo size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Quantic<span className="text-emerald-600">Mechanix</span>
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              {children}
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100 italic text-xs text-gray-400">
            Powered by Quantic OS &bull; Pro Edition
          </div>
        </div>
      </div>

      {/* Right Column: Information Section (Clean & Abstract) */}
      <div className="hidden lg:block relative w-0 flex-1 bg-emerald-600">
        <div className="absolute inset-0 h-full w-full object-cover">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-emerald-900 opacity-90" />
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>
        
        <div className="relative h-full flex flex-col justify-center px-16 text-white">
          <div className="max-w-xl">
            <h3 className="text-4xl font-bold leading-tight mb-6">
              Control Total, <br />
              <span className="text-emerald-200">Productividad Absoluta.</span>
            </h3>
            <p className="text-lg text-emerald-100/80 mb-10 leading-relaxed">
              La plataforma de gestión para talleres mecánicos que transforma el caos en eficiencia operativa. Diseñado para equipos que buscan la excelencia.
            </p>
            
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10 text-sm font-semibold tracking-wider uppercase text-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Validación en Tiempo Real
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Métricas Financieras
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Gestión de Inventario
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Reportes Automáticos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

