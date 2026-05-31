'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, BookOpen, Clock, Layers, Sparkles, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const programSchema = z.object({
  name: z.string().min(3, 'El nombre es muy corto'),
  description: z.string().min(10, 'La descripción debe ser más detallada'),
  duration: z.string().optional(),
  isTemplate: z.boolean(),
  type: z.enum(['CURRICULUM', 'HABITS', 'ROUTINE']),
  isPublic: z.boolean(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProgramFormData = z.infer<typeof programSchema>;

interface ProgramFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProgramFormData) => Promise<void>;
  defaultIsTemplate?: boolean;
  isHabitOnly?: boolean;
}

export const ProgramForm: React.FC<ProgramFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  defaultIsTemplate = false,
  isHabitOnly = false
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      isTemplate: defaultIsTemplate,
      type: isHabitOnly ? 'HABITS' : 'CURRICULUM',
      isPublic: false,
      isActive: true,
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        description: '',
        duration: '',
        isTemplate: defaultIsTemplate,
        type: isHabitOnly ? 'HABITS' : 'CURRICULUM',
        isPublic: false,
        isActive: true,
      });
    }
  }, [isOpen, defaultIsTemplate, isHabitOnly, reset]);

  const isTemplate = watch('isTemplate');

  const handleFormSubmit = async (data: ProgramFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-500" 
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col h-screen border-l border-slate-200">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Nuevo Diseño</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Crear Programa</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <form id="program-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            
            {/* Main Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nombre del Programa</label>
                <input 
                  {...register('name')}
                  placeholder="Ej: Mentoría Elite de Ventas"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                />
                {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Descripción y Objetivos</label>
                <textarea 
                  {...register('description')}
                  rows={4}
                  placeholder="Explica qué lograrán tus alumnos en este programa..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none resize-none"
                />
                {errors.description && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.description.message as string}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Tipo de Programa</label>
                    <select 
                      {...register('type')}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-[11px] uppercase tracking-wider focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none appearance-none cursor-pointer"
                    >
                      {!isHabitOnly && <option value="CURRICULUM">Curriculum (Pasos)</option>}
                      <option value="HABITS">Hábito (Diario)</option>
                      <option value="ROUTINE">Rutina (Semanal)</option>
                    </select>
                 </div>
                 {isHabitOnly ? (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Estado de Hábito</label>
                      <div 
                        onClick={() => {
                          const currentVal = watch('isActive');
                          setValue('isActive', !currentVal);
                        }}
                        className={`w-full px-5 py-[15px] bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-all duration-300 ${watch('isActive') ? 'border-indigo-500/30 bg-indigo-50/10' : ''}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider select-none leading-none mb-1">Habilitado</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight select-none leading-none">
                            {watch('isActive') ? 'Check-ins Activos' : 'Desactivado'}
                          </span>
                        </div>
                        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center shrink-0 ${watch('isActive') ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${watch('isActive') ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <input type="checkbox" className="hidden" {...register('isActive')} />
                   </div>
                 ) : (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Duración Estimada</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          {...register('duration')}
                          placeholder="Ej: 8 semanas"
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                        />
                      </div>
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Configuración</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl h-[58px] cursor-pointer hover:bg-slate-100 transition-colors">
                      <input 
                        id="isTemplateCheckbox"
                        type="checkbox" 
                        {...register('isTemplate')}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 accent-indigo-600"
                      />
                      <label htmlFor="isTemplateCheckbox" className="text-[11px] font-bold text-slate-600 uppercase tracking-tight cursor-pointer">Es una Plantilla</label>
                    </div>
                 </div>
                 {isTemplate && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Visibilidad</label>
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl h-[58px] cursor-pointer hover:bg-emerald-100 transition-colors">
                        <input 
                          id="isPublicCheckbox"
                          type="checkbox" 
                          {...register('isPublic')}
                          className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-600 accent-emerald-600"
                        />
                        <label htmlFor="isPublicCheckbox" className="text-[11px] font-bold text-emerald-700 uppercase tracking-tight cursor-pointer">Marketplace (Público)</label>
                      </div>
                   </div>
                 )}
              </div>
            </div>

            {/* Tips Section */}
            <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Consejo Aura</h3>
              </div>
              <p className="text-[11px] text-indigo-900/60 font-medium leading-relaxed">
                Recuerda que una vez creado el programa, podrás añadir las **Fases** y **Milestones** 
                desde el panel de detalles para configurar la gamificación.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
          <button 
            type="submit"
            form="program-form"
            disabled={isSubmitting}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              <>
                <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Guardar Programa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
