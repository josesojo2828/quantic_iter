'use client';

import React, { useState } from 'react';
import { X, Flame, Sparkles, Layers, Check, Zap } from 'lucide-react';

interface HabitTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const HabitTemplateForm: React.FC<HabitTemplateFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formType, setFormType] = useState<'SINGLE' | 'PROTOCOL'>('SINGLE');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [xpReward, setXpReward] = useState(15);
  const [requiredEvidence, setRequiredEvidence] = useState<'NONE' | 'IMAGE' | 'LINK' | 'TEXT'>('NONE');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        formType, // Pass to distinguish in onSubmit
        frequency,
        xpReward,
        requiredEvidence,
      };
      await onSubmit(payload);
      // Reset form
      setName('');
      setDescription('');
      setFrequency('DAILY');
      setXpReward(15);
      setRequiredEvidence('NONE');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="glass-card bg-white/95 backdrop-blur-2xl w-full max-w-lg rounded-[32px] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100/50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/10">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1">Diseñar Hábito</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Ingeniería de Consistencia</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Card Selectors for Form Type */}
          <div className="space-y-2">
            <label className="text-[8px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
              <div className="w-1 h-1 bg-indigo-500 rounded-full" />
              ¿Qué tipo de estructura deseas crear?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormType('SINGLE')}
                className={`p-4 rounded-[20px] border-2 text-left transition-all duration-300 relative group flex flex-col justify-between h-28 ${
                  formType === 'SINGLE' 
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-lg shadow-indigo-500/5' 
                    : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  formType === 'SINGLE' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'
                }`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9.5px] font-black text-slate-900 uppercase tracking-tight italic">Hábito Único</p>
                  <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 opacity-85">Un solo check directo</p>
                </div>
                {formType === 'SINGLE' && (
                  <div className="absolute top-3 right-3 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormType('PROTOCOL')}
                className={`p-4 rounded-[20px] border-2 text-left transition-all duration-300 relative group flex flex-col justify-between h-28 ${
                  formType === 'PROTOCOL' 
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-lg shadow-indigo-500/5' 
                    : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  formType === 'PROTOCOL' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9.5px] font-black text-slate-900 uppercase tracking-tight italic">Protocolo de Hábitos</p>
                  <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 opacity-85">Lista de múltiples hábitos</p>
                </div>
                {formType === 'PROTOCOL' && (
                  <div className="absolute top-3 right-3 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Common field: Name */}
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-950 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                {formType === 'SINGLE' ? 'Nombre del Hábito' : 'Nombre del Protocolo'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={formType === 'SINGLE' ? 'EJ: LEER 20 MINUTOS' : 'EJ: RUTINA MAÑANERA'}
                className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-[18px] text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-800"
              />
            </div>

            {/* Common field: Description */}
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-950 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                Descripción / Propósito
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={formType === 'SINGLE' ? 'EJ: ESTIMULAR EL ENFOQUE PROFUNDO ANTES DE DORMIR.' : 'EJ: PROTOCOLO TÁCTICO PARA MEJORAR EL RENDIMIENTO CORPORAL Y LA ATENCIÓN.'}
                rows={2}
                className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 hover:border-slate-200 focus:border-indigo-500 rounded-[18px] text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-800"
              />
            </div>

            {/* Single Habit Specific Fields */}
            {formType === 'SINGLE' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100/50 animate-in slide-in-from-top-4 duration-300">
                
                {/* Frequency */}
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-950 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                    Frecuencia
                  </label>
                  <select
                    value={frequency}
                    onChange={(e: any) => setFrequency(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-[18px] text-[8.5px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all cursor-pointer"
                  >
                    <option value="DAILY">DIARIO</option>
                    <option value="WEEKLY">SEMANAL</option>
                  </select>
                </div>

                {/* XP Reward */}
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-950 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                    Recompensa de XP
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 15].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setXpReward(val)}
                        className={`flex-1 py-3 rounded-[16px] border text-[9px] font-black uppercase tracking-widest transition-all ${
                          xpReward === val
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                            : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-950'
                        }`}
                      >
                        {val} XP
                      </button>
                    ))}
                  </div>
                </div>

                {/* Evidence Required */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[8px] font-black text-slate-950 uppercase tracking-[0.25em] flex items-center gap-2 px-1">
                    Evidencia Requerida al dar el Check
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'NONE', label: 'NINGUNA' },
                      { value: 'TEXT', label: 'COMENTARIO' },
                      { value: 'IMAGE', label: 'CAPTURA' },
                      { value: 'LINK', label: 'ENLACE' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRequiredEvidence(opt.value as any)}
                        className={`py-2.5 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${
                          requiredEvidence === opt.value
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                            : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100/50 bg-slate-50/20 -mx-6 px-6 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 border border-slate-100 text-slate-400 rounded-[18px] font-black text-[8.5px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all italic"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3.5 bg-slate-900 text-white rounded-[18px] font-black text-[8.5px] uppercase tracking-[0.25em] hover:bg-black transition-all shadow-2xl shadow-indigo-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 italic"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Diseñar Plantilla
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
