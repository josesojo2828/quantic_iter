'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Layers, Clock, ArrowRight, Loader2, Plus } from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: { id: string; name: string }) => void;
}

export const TemplateSelectModal: React.FC<TemplateSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any[]>('/mentor/programs');
      const filtered = Array.isArray(res) ? res.filter((p) => p.isTemplate) : [];
      setTemplates(filtered);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Paso 1 de 2</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none italic">Seleccionar Plantilla</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
              Elige el programa maestro que deseas desplegar
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-50">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar plantilla por nombre..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abriendo Bóveda Quántica...</span>
             </div>
           ) : filteredTemplates.length === 0 ? (
             <div className="text-center py-16 px-6 space-y-4">
                <Layers className="w-12 h-12 text-slate-200 mx-auto" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No se encontraron plantillas</p>
                <button
                  onClick={() => {
                    onClose();
                    router.push('/dashboard/templates');
                  }}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 mx-auto shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Crear Mi Primera Plantilla
                </button>
             </div>
           ) : (
             filteredTemplates.map((template) => (
               <div 
                 key={template.id}
                 className="flex flex-col p-5 hover:bg-slate-50 rounded-3xl transition-all group cursor-pointer border border-transparent hover:border-slate-100 space-y-3"
                 onClick={() => onSelect({ id: template.id, name: template.name })}
               >
                 <div className="flex items-start justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner border border-white">
                         <Layers className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none mb-1">
                           {template.name}
                         </div>
                         <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1">
                           {template.description || 'SIN DETALLES ADICIONALES.'}
                         </div>
                      </div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                     <ArrowRight className="w-4 h-4" />
                   </div>
                 </div>
                 
                 {/* Metrics */}
                 <div className="flex items-center gap-4 pt-2 border-t border-slate-100/50">
                   <div className="flex items-center gap-1">
                     <Clock className="w-3.5 h-3.5 text-indigo-400" />
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{template.duration || 'Flexible'}</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <Layers className="w-3.5 h-3.5 text-indigo-400" />
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{template.phases?.length || 0} Fases</span>
                   </div>
                 </div>
               </div>
             ))
           )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/30 text-center">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Selecciona una plantilla para proceder con el estudiante
           </p>
        </div>
      </div>
    </div>
  );
};
