'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { apiClient } from '@/core/api/api.client';
import { 
  Trophy, 
  Sparkles, 
  Zap, 
  Users, 
  Medal, 
  Plus, 
  ChevronRight, 
  Star, 
  Crown,
  Target,
  Flame,
  Layout,
  Clock,
  CheckCircle2
} from 'lucide-react';

const getXpThreshold = (lvl: number) => {
  return Math.floor(100 * Math.pow(lvl, 1.5));
};

const getLevelTitle = (lvl: number) => {
  if (lvl >= 10) return 'Maestro Quántico';
  if (lvl >= 5) return 'Experto de Datos';
  if (lvl >= 4) return 'Arquitecto Aura';
  if (lvl >= 3) return 'Iniciado Avanzado';
  if (lvl >= 2) return 'Explorador Aprendiz';
  return 'Novato del Camino';
};

export default function GamificationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<'levels' | 'badges' | 'quests'>('levels');
  const [liveStats, setLiveStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await apiClient.get<any>('/gamification/stats');
        setLiveStats(res);
      } catch (err) {
        console.error('Error fetching live gamification stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchLiveStats();

    const ctx = gsap.context(() => {
      gsap.from('.glass-card', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power4.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { label: 'XP REPARTIDO', val: '1.2M', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50/50', detail: 'Sincronización quántica activa' },
    { label: 'NIVEL PROMEDIO', val: '14', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50/50', detail: 'Crecimiento de cohorte +12%' },
    { label: 'INSIGNIAS ACTIVAS', val: '24', icon: Medal, color: 'text-emerald-600', bg: 'bg-emerald-50/50', detail: 'Reconocimiento táctico' },
    { label: 'ENGAGEMENT', val: '+92%', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50/50', detail: 'Retención de alta fidelidad' },
  ];

  const levels = [
    { id: 1, name: 'INICIADO QUANTIC', xp: '0 - 1000', icon: Star, color: 'bg-slate-100/50 text-slate-500', reward: 'Acceso a Comunidad Base' },
    { id: 2, name: 'EXPLORADOR DE DATOS', xp: '1000 - 5000', icon: Sparkles, color: 'bg-cyan-100/50 text-cyan-600', reward: 'Plantillas de Gestión V1' },
    { id: 3, name: 'ARQUITECTO AURA', xp: '5000 - 15000', icon: Zap, color: 'bg-indigo-100/50 text-indigo-600', reward: 'Sesión Grupal VIP' },
    { id: 4, name: 'MAESTRO DE FLUJOS', xp: '15000 - 50000', icon: Crown, color: 'bg-amber-100/50 text-amber-600', reward: 'Insignia Dorada de Perfil' },
  ];

  // Math bounds for progression
  const currentLevel = liveStats?.level || 1;
  const totalXp = liveStats ? (liveStats.totalXp ?? liveStats.xp ?? 0) : 0;
  const currentStreak = liveStats?.currentStreak || 0;
  const highestStreak = liveStats?.highestStreak || 0;

  const currentLevelMinXp = currentLevel === 1 ? 0 : getXpThreshold(currentLevel);
  const nextLevelMinXp = getXpThreshold(currentLevel + 1);
  const xpInCurrentLevel = totalXp - currentLevelMinXp;
  const xpNeededForNext = nextLevelMinXp - currentLevelMinXp;
  
  // Calculate a beautifully bounded percentage
  const progressPercent = nextLevelMinXp > currentLevelMinXp 
    ? Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100))
    : 0;
  
  const xpRemaining = Math.max(0, nextLevelMinXp - totalXp);

  return (
    <div ref={containerRef} className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Protocolos de Recompensa</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            Consola de <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600">Gamificación</span>
          </h1>
          <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.2em] opacity-60">
            Impulsa el compromiso de tu comunidad a través del reconocimiento estratégico.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-[18px] text-[8px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-amber-200 active:scale-95 border border-amber-400/30 group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Nuevo Desafío
        </button>
      </header>

      {/* Live Student Progression Segment */}
      {loadingStats ? (
        <div className="w-full bg-slate-900/90 h-32 rounded-[32px] animate-pulse flex items-center justify-between px-8 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-800 rounded-[28px]" />
            <div className="space-y-3">
              <div className="w-20 h-2 bg-slate-800 rounded" />
              <div className="w-48 h-5 bg-slate-800 rounded" />
              <div className="w-32 h-1.5 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="w-80 h-3 bg-slate-800 rounded-full hidden lg:block" />
          <div className="w-24 h-16 bg-slate-800 rounded-2xl hidden md:block" />
        </div>
      ) : (
        <div className="glass-card bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group">
          {/* Decorative background glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6366F1]/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-[#6366F1]/15 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/[0.04] blur-[80px] rounded-full -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Level Circle and Title */}
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full lg:w-auto">
              <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-amber-400 via-orange-500 to-indigo-600 p-[3px] shadow-[0_10px_30px_rgba(99,102,241,0.25)] relative group-hover:scale-105 transition-transform duration-700">
                <div className="w-full h-full bg-slate-950 rounded-[29px] flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="text-[8px] font-black text-amber-400 uppercase tracking-[0.2em] leading-none mb-0.5">NIVEL</span>
                  <span className="text-4xl font-black text-white italic tracking-tighter leading-none">{currentLevel}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em] italic">Estudiante de Elite</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none pr-3">
                  {getLevelTitle(currentLevel)}
                </h2>
                <p className="text-slate-400 text-[9.5px] font-black uppercase tracking-[0.15em] opacity-80">
                  Experiencia acumulada: <span className="text-white font-bold">{totalXp.toLocaleString()} XP</span>
                </p>
              </div>
            </div>

            {/* Live Progress Bar Container */}
            <div className="flex-1 w-full max-w-xl space-y-3">
              <div className="flex items-end justify-between">
                <div className="space-y-0.5">
                  <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-[0.25em]">PROGRESO DEL NIVEL</span>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider italic">
                    {xpRemaining > 0 
                      ? `FALTAN ${xpRemaining} XP PARA EL NIVEL ${currentLevel + 1}`
                      : `¡MÁXIMO NIVEL ALCANZADO!`
                    }
                  </p>
                </div>
                <span className="text-xs font-black text-indigo-400 tracking-tighter italic bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full h-4 bg-slate-950/80 rounded-full p-1 border border-white/5 shadow-inner">
                <div 
                  style={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-500 rounded-full relative overflow-hidden transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                />
              </div>
            </div>

            {/* Streak Fire Container */}
            <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-center lg:justify-end border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-rose-500">
                  <Flame className="w-8 h-8 fill-rose-500/10 animate-pulse" />
                  <span className="text-4xl font-black italic tracking-tighter leading-none text-white">{currentStreak}</span>
                </div>
                <span className="block text-[8px] font-black text-rose-400 uppercase tracking-[0.2em] italic">RACHA DE DÍAS</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden md:block" />
              <div className="text-center space-y-1 hidden md:block">
                <span className="block text-xl font-black italic tracking-tighter leading-none text-slate-400">{highestStreak}</span>
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] italic">RÉCORD MÁXIMO</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-soft group hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-12 h-12" />
            </div>
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500 shadow-inner border border-white relative z-10`}>
              <stat.icon className="w-4.5 h-4.5" />
            </div>
            <div className="relative z-10">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1.5 opacity-60 italic">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-1">{stat.val}</p>
              <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em] italic">{stat.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation & Control */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-1.5 p-1.5 bg-white/40 backdrop-blur-md rounded-[18px] border border-white shadow-inner w-full md:w-fit">
          {[
            { id: 'levels', label: 'NIVELES', icon: Crown },
            { id: 'badges', label: 'INSIGNIAS', icon: Medal },
            { id: 'quests', label: 'DESAFÍOS', icon: Target }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center justify-center gap-2 flex-1 md:flex-none px-5 py-2.5 rounded-[14px] text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeView === tab.id ? 'bg-white text-amber-600 shadow-xl shadow-amber-500/10' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="h-px md:w-px md:h-8 bg-slate-100 flex-1 hidden md:block" />
        <div className="flex items-center gap-3 text-[8.5px] font-black text-slate-400 uppercase tracking-widest opacity-60">
          <Clock className="w-3.5 h-3.5" />
          Sincronización de XP Activa
        </div>
      </div>

      {/* High Fidelity Content Area */}
      <div className="glass-card bg-white/60 backdrop-blur-xl rounded-[24px] border border-white p-6 lg:p-8 shadow-soft min-h-[400px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/[0.03] blur-[100px] rounded-full -mr-40 -mt-40 group-hover:bg-amber-500/[0.05] transition-all duration-1000" />
        
        {activeView === 'levels' && (
          <div className="space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100/50">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Escalafón de Maestría</h2>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-70">Define la progresión técnica y recompensas de impacto.</p>
              </div>
              <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-[14px] text-[8px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 italic">
                <Plus className="w-3.5 h-3.5" />
                Añadir Nivel Técnico
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {levels.map((level) => (
                <div key={level.id} className="group glass-card bg-white/40 hover:bg-white border border-white p-6 rounded-[24px] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-700 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                  <div className={`w-16 h-16 ${level.color} rounded-[20px] flex items-center justify-center shrink-0 shadow-inner border border-white group-hover:scale-110 transition-transform duration-700`}>
                    <level.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[7.5px] font-black text-indigo-500 uppercase tracking-[0.3em]">CÓDIGO NIVEL 0{level.id}</span>
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">{level.name}</h4>
                      </div>
                      <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shadow-inner">
                        <span className="text-[8.5px] font-black text-slate-900 uppercase tracking-widest">{level.xp} XP</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-white/50 rounded-xl border border-white shadow-sm group-hover:bg-amber-50 group-hover:border-amber-100 transition-all duration-500">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">
                        RECOMPENSA: <span className="text-slate-900 font-bold">{level.reward}</span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span>Saturación XP</span>
                        <span>100% COMPLETADO</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100/50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                        <div className="w-full h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-[length:200%_auto] animate-gradient-x shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tactical Empty States */}
        {activeView !== 'levels' && (
          <div className="flex flex-col items-center justify-center py-12 text-center max-w-xl mx-auto relative z-10 space-y-6">
            <div className="relative group/icon">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="w-24 h-24 bg-white/80 rounded-[24px] flex items-center justify-center relative z-10 shadow-soft border border-white rotate-12 group-hover/icon:rotate-0 transition-transform duration-700">
                <Sparkles className="w-12 h-12 text-amber-300" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Lienzo en Reposo</h3>
              <p className="text-[8.5px] text-slate-400 font-black uppercase tracking-[0.25em] leading-relaxed opacity-70">
                Estamos configurando los motores de {activeView === 'badges' ? 'RECONOCIMIENTO VISUAL' : 'MISIONES ESTRATÉGICAS'}. La arquitectura Aura está lista para el despliegue.
              </p>
            </div>
            <button className="px-8 py-3.5 bg-slate-900 text-white rounded-[18px] font-black text-[8.5px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 italic">
              Configurar {activeView === 'badges' ? 'Sistema de Insignias' : 'Protocolos de Desafío'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
