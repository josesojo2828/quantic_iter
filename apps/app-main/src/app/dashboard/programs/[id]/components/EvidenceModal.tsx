'use client';

import React, { useState } from 'react';
import { X, Camera, FileText, Link, Upload, Check, Zap, Trophy } from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: any;
  onSubmit: (evidence: string) => Promise<void>;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ 
  isOpen, 
  onClose, 
  milestone, 
  onSubmit 
}) => {
  const [evidence, setEvidence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !milestone) return null;

  const handleSubmit = async () => {
    if (milestone.requiredEvidence !== 'NONE' && !evidence) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(evidence);
      setEvidence('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = () => {
    switch (milestone.requiredEvidence) {
      case 'IMAGE': return <Camera className="w-5 h-5" />;
      case 'TEXT': return <FileText className="w-5 h-5" />;
      case 'LINK': return <Link className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getPlaceholder = () => {
    switch (milestone.requiredEvidence) {
      case 'IMAGE': return 'URL de la imagen o captura de pantalla...';
      case 'TEXT': return 'Escribí tus reflexiones o notas de cumplimiento...';
      case 'LINK': return 'https://ejemplo.com/tu-evidencia';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
        {/* Header Decor */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                {getIcon()}
              </div>
              <div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Cargar Evidencia</span>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{milestone.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          <div className="space-y-6">
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Para completar este hito, el coach requiere una evidencia de tipo <strong className="text-slate-900">{milestone.requiredEvidence}</strong>. 
              Esto nos ayuda a trackear tu progreso real.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Tu Evidencia</label>
              {milestone.requiredEvidence === 'TEXT' ? (
                <textarea 
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder={getPlaceholder()}
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none resize-none"
                />
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                    {getIcon()}
                  </div>
                  <input 
                    type="text"
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder={getPlaceholder()}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex items-start gap-4">
               <Trophy className="w-5 h-5 text-amber-500 mt-1" />
               <div>
                  <h4 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-1">¡Casi lo tenés!</h4>
                  <p className="text-[11px] text-amber-800/60 font-medium leading-relaxed">
                    Al subir la evidencia, ganarás automáticamente <strong className="text-amber-600">+{milestone.xpReward} XP</strong> y el hito quedará marcado.
                  </p>
               </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !evidence}
              className="w-full py-5 bg-slate-900 text-white rounded-3xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Subir Evidencia
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
