'use client';

import React from 'react';
import { 
  CheckCircle2, 
  UserPlus, 
  Calendar,
  AlertCircle
} from 'lucide-react';

const ACTIVITIES = [
  {
    type: 'success',
    icon: CheckCircle2,
    content: 'Mentoría "Intro a Quantic" completada',
    time: 'Hace 5 min',
    color: 'text-emerald-500 bg-emerald-50 border-emerald-100'
  },
  {
    type: 'user',
    icon: UserPlus,
    content: 'Nuevo estudiante: Maria Garcia',
    time: 'Hace 1 hora',
    color: 'text-blue-500 bg-blue-50 border-blue-100'
  },
  {
    type: 'event',
    icon: Calendar,
    content: 'Sesión grupal agendada para mañana',
    time: 'Hace 3 horas',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
  },
  {
    type: 'warning',
    icon: AlertCircle,
    content: 'Hito crítico: 3 alumnos sin actividad',
    time: 'Hace 1 día',
    color: 'text-amber-500 bg-amber-50 border-amber-100'
  }
];

export const RecentActivity = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Actividad Reciente</h3>
        <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider transition-all">Ver todo</button>
      </div>
      
      <div className="space-y-6">
        {ACTIVITIES.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <div key={i} className="flex gap-4 group cursor-default">
              <div className="relative flex flex-col items-center">
                <div className={`p-2 rounded-lg border shadow-sm z-10 ${activity.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {i !== ACTIVITIES.length - 1 && (
                  <div className="w-px flex-1 bg-slate-100 mt-2" />
                )}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[13px] font-bold text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                  {activity.content}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
