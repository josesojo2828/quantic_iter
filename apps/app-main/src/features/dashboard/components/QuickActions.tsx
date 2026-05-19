'use client';

import React from 'react';
import { 
  PlusCircle, 
  UserPlus, 
  FileText, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const ACTIONS = [
  {
    label: 'Nueva Mentoría',
    description: 'Inicia un programa',
    icon: PlusCircle,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    href: '/dashboard/programs'
  },
  {
    label: 'Crear Grupo',
    description: 'Nueva cohorte',
    icon: UserPlus,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    href: '/dashboard/groups'
  },
  {
    label: 'Agendar Sesión',
    description: 'Calendario maestro',
    icon: Zap,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    href: '/dashboard/agenda'
  },
  {
    label: 'Gamificación',
    description: 'Premios y XP',
    icon: FileText,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    href: '/dashboard/gamification'
  }
];

export const QuickActions = () => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <button 
            key={i}
            onClick={() => action.href !== '#' && router.push(action.href)}
            className="bg-white p-5 flex items-center gap-4 group text-left transition-all hover:border-indigo-200 border border-slate-200 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <div className={`p-3 rounded-xl ${action.color} border transition-transform group-hover:scale-110`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider leading-none mb-1">{action.label}</h4>
              <p className="text-[10px] text-slate-400 font-medium">{action.description}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </button>
        );
      })}
    </div>
  );
};
