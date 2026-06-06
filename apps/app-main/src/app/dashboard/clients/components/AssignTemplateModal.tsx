'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Layers, Clock, Check, Loader2, ArrowRight } from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import toast from 'react-hot-toast';

interface AssignTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

export const AssignTemplateModal: React.FC<AssignTemplateModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSuccess,
}) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any[]>('/mentor/programs');
      const filtered = Array.isArray(res) ? res.filter((p) => p.isTemplate) : [];
      setTemplates(filtered);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setSelectedTemplateId(null);
      setSearch('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAssign = async () => {
    if (!selectedTemplateId) {
      toast.error('Por favor, seleccioná una plantilla');
      return;
    }

    try {
      setAssigning(true);
      await apiClient.post(`/mentor/programs/${selectedTemplateId}/assign`, {
        menteeId: studentId,
      });
      toast.success('Plantilla asignada con éxito');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error assigning template:', error);
      toast.error('Error al asignar plantilla');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Asignar Plantilla</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seleccioná un programa para asignar a <span className="font-semibold text-indigo-600">{studentName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar plantilla por nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
              <p className="text-sm">Cargando plantillas disponibles...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Layers className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm">No se encontraron plantillas</p>
            </div>
          ) : (
            filteredTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500/20'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800 text-sm truncate">
                        {template.name}
                      </span>
                      {template.type && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                          {template.type}
                        </span>
                      )}
                    </div>
                    {template.description ? (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {template.description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Sin descripción</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {template.phases?.length || 0} fases
                      </span>
                      {template.durationWeeks && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {template.durationWeeks} semanas
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-200'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={assigning}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={assigning || !selectedTemplateId}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            {assigning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Asignando...
              </>
            ) : (
              <>
                Asignar Programa
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
