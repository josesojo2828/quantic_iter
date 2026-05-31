'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Layers, Target, Trophy, Check, Sparkles, Calendar, Clock, ListTodo } from 'lucide-react';

// --- SCHEMAS ---
const phaseSchema = z.object({
  name: z.string().min(3, 'Nombre demasiado corto'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  estimatedWeeks: z.number().optional(),
  color: z.string(),
  order: z.number(),
});

const milestoneSchema = z.object({
  title: z.string().min(3, 'Título demasiado corto'),
  description: z.string().optional(),
  xpReward: z.number().min(0),
  dueDate: z.string().optional(),
  order: z.number(),
  frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY']),
  requiredEvidence: z.enum(['NONE', 'IMAGE', 'TEXT', 'LINK']),
  isHabit: z.boolean(),
  daysOfWeek: z.array(z.number()).optional(),
  subTasks: z.array(z.object({ title: z.string() })).optional(),
});

type PhaseFormData = z.infer<typeof phaseSchema>;
type MilestoneFormData = z.infer<typeof milestoneSchema> & { subTasks?: { title: string }[] };

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- PHASE FORM ---
interface PhaseFormProps extends FormProps {
  onSubmit: (data: PhaseFormData) => Promise<void>;
  initialData?: any;
}

export const PhaseForm: React.FC<PhaseFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<PhaseFormData>({
    resolver: zodResolver(phaseSchema),
    defaultValues: initialData || { order: 0, color: '#6366F1' }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col h-screen border-l border-slate-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Estructura del Programa</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{initialData ? 'Editar Fase' : 'Nueva Fase'}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <form id="phase-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nombre de la Fase</label>
              <input 
                {...register('name')}
                placeholder="Ej: Fundamentos y Mentalidad"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Hora Inicio</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="time"
                    {...register('startTime')}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Hora Fin</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="time"
                    {...register('endTime')}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Fecha Inicio (Calendario)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date"
                    {...register('startDate')}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Fecha Fin (Calendario)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date"
                    {...register('endDate')}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Semanas Estimadas</label>
                <input 
                  type="number"
                  {...register('estimatedWeeks', { valueAsNumber: true })}
                  placeholder="Ej: 4"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Color Identificador</label>
                <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl">
                   <input 
                    type="color"
                    {...register('color')}
                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{watch('color')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Descripción (Opcional)</label>
              <textarea 
                {...register('description')}
                rows={3}
                placeholder="¿Qué logrará el alumno en esta etapa?"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-slate-100 bg-white">
          <button type="submit" form="phase-form" disabled={isSubmitting} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200">
            {isSubmitting ? 'Guardando...' : <><Check className="w-5 h-5" /> Guardar Fase</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MILESTONE FORM ---
interface MilestoneFormProps extends FormProps {
  onSubmit: (data: MilestoneFormData) => Promise<void>;
  initialData?: any;
  isHabitOnly?: boolean;
}

export const MilestoneForm: React.FC<MilestoneFormProps> = ({ isOpen, onClose, onSubmit, initialData, isHabitOnly }) => {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: initialData || { 
      xpReward: isHabitOnly ? 10 : 500, 
      order: 0, 
      frequency: isHabitOnly ? 'DAILY' : 'ONCE', 
      requiredEvidence: 'NONE',
      isHabit: isHabitOnly ? true : false,
      daysOfWeek: [] 
    }
  });

  const frequency = watch('frequency');
  const xpReward = watch('xpReward');
  const daysOfWeek = watch('daysOfWeek') || [];

  const [localSubTasks, setLocalSubTasks] = React.useState<{ title: string }[]>([]);
  const [subTaskInput, setSubTaskInput] = React.useState('');

  React.useEffect(() => {
    if (frequency === 'DAILY' || frequency === 'WEEKLY') {
      if (xpReward === 500 || xpReward > 100) {
        setValue('xpReward', 10);
      }
    } else if (frequency === 'ONCE') {
      if (xpReward <= 15) {
        setValue('xpReward', 500);
      }
    }
  }, [frequency, xpReward, setValue]);

  React.useEffect(() => {
    if (isOpen) {
      setLocalSubTasks(initialData?.subTasks || []);
      setSubTaskInput('');
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          xpReward: isHabitOnly ? 10 : 500, 
          order: 0, 
          frequency: isHabitOnly ? 'DAILY' : 'ONCE', 
          requiredEvidence: 'NONE',
          isHabit: isHabitOnly ? true : false,
          daysOfWeek: [] 
        });
      }
    }
  }, [isOpen, initialData, reset, isHabitOnly]);

  const toggleDay = (day: number) => {
    const current = [...daysOfWeek];
    const index = current.indexOf(day);
    if (index > -1) current.splice(index, 1);
    else current.push(day);
    setValue('daysOfWeek', current);
  };

  const handleAddSubTask = () => {
    if (!subTaskInput.trim()) return;
    setLocalSubTasks([...localSubTasks, { title: subTaskInput.trim() }]);
    setSubTaskInput('');
  };

  const handleRemoveSubTask = (index: number) => {
    setLocalSubTasks(localSubTasks.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: MilestoneFormData) => {
    await onSubmit({
      ...data,
      subTasks: localSubTasks
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col h-screen border-l border-slate-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Hito de Progreso</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{initialData ? 'Editar Hito' : 'Nuevo Hito'}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <form id="milestone-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Título del Hito / Hábito</label>
              <input 
                {...register('title')}
                placeholder="Ej: Tomar 2L de agua"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
              />
              {errors.title && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Frecuencia</label>
                <select 
                  {...register('frequency')}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-[11px] uppercase focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none appearance-none cursor-pointer"
                >
                  {!isHabitOnly && <option value="ONCE">Una vez (Hito)</option>}
                  <option value="DAILY">Diario (Hábito)</option>
                  <option value="WEEKLY">Semanal (Rutina)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Evidencia</label>
                <select 
                  {...register('requiredEvidence')}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-[11px] uppercase focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="NONE">Ninguna</option>
                  <option value="IMAGE">Foto / Imagen</option>
                  <option value="TEXT">Texto / Notas</option>
                  <option value="LINK">Enlace / Link</option>
                </select>
              </div>
            </div>

            {frequency === 'WEEKLY' && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Días de ejecución</label>
                <div className="flex flex-wrap gap-2">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                        daysOfWeek.includes(i) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={`${frequency === 'ONCE' ? 'grid grid-cols-2' : 'grid grid-cols-1'} gap-4`}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Recompensa XP</label>
                {frequency === 'ONCE' ? (
                  <div className="relative">
                    <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <input 
                      type="number"
                      {...register('xpReward', { valueAsNumber: true })}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    {[5, 10, 15].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setValue('xpReward', val)}
                        className={`flex-1 py-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          xpReward === val
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/10'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                        }`}
                      >
                        {val} XP
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {frequency === 'ONCE' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Fecha Objetivo</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date"
                      {...register('dueDate')}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ejercicios / Sub-tareas de la Rutina</label>
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={subTaskInput}
                  onChange={(e) => setSubTaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubTask();
                    }
                  }}
                  placeholder="Ej: Flexiones de pecho 4 series 12 reps"
                  className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none"
                />
                <button 
                  type="button"
                  onClick={handleAddSubTask}
                  className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider shrink-0"
                >
                  Agregar
                </button>
              </div>

              {localSubTasks.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  {localSubTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                      <span className="text-[11px] font-bold text-slate-700">{task.title}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSubTask(idx)}
                        className="text-slate-400 hover:text-red-500 transition-all p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-start gap-4">
               <Sparkles className="w-5 h-5 text-emerald-600 mt-1" />
               <div>
                  <h4 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest mb-1">Estructura Dinámica</h4>
                  <p className="text-[11px] text-emerald-800/60 font-medium leading-relaxed">
                    Este hito se adaptará al tipo de programa. Si es un hábito, se mostrará diariamente para el alumno.
                  </p>
               </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-slate-100 bg-white">
          <button type="submit" form="milestone-form" disabled={isSubmitting} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-100">
            {isSubmitting ? 'Guardando...' : <><Check className="w-5 h-5" /> Guardar Hito</>}
          </button>
        </div>
      </div>
    </div>
  );
};
