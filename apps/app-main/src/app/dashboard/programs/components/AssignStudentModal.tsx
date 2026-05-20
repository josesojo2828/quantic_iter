'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Users, Check, GraduationCap, Loader2, Target, Plus, Calendar, ChevronLeft, Award } from 'lucide-react';
import { contactsService, Contact } from '@/features/crm/services/contacts.service';
import { apiClient } from '@/core/api/api.client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
}

export const AssignStudentModal: React.FC<AssignStudentModalProps> = ({ 
  isOpen, 
  onClose, 
  templateId, 
  templateName 
}) => {
  const router = useRouter();
  
  // Paso 1: Selección de estudiantes
  const [students, setStudents] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Paso 2: Asociación de Objetivos (Opcional)
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);
  const [existingObjectives, setExistingObjectives] = useState<any[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('');
  
  // Crear nuevo objetivo al vuelo
  const [isCreatingNewObjective, setIsCreatingNewObjective] = useState(false);
  const [newObjectiveTitle, setNewObjectiveTitle] = useState('');
  const [newObjectiveDescription, setNewObjectiveDescription] = useState('');
  const [newObjectiveTargetDate, setNewObjectiveTargetDate] = useState('');

  const [assigning, setAssigning] = useState(false);

  // Cargar estudiantes
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await contactsService.getContacts({ search });
      setStudents(res.items || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  // Cargar objetivos del estudiante seleccionado
  const fetchObjectives = async (studentId: string) => {
    try {
      setLoadingObjectives(true);
      const res = await apiClient.get<any[]>(`/mentor/objectives/mentee/${studentId}`);
      setExistingObjectives(res || []);
      // Si tiene objetivos existentes, seleccionamos el primero por defecto
      if (res && res.length > 0) {
        setSelectedObjectiveId(res[0].id);
        setIsCreatingNewObjective(false);
      } else {
        setSelectedObjectiveId('');
        setIsCreatingNewObjective(true); // Si no tiene, por defecto abrimos creación
      }
    } catch (error) {
      console.error('Error al cargar objetivos:', error);
    } finally {
      setLoadingObjectives(false);
    }
  };

  useEffect(() => {
    if (isOpen && step === 1) {
      fetchStudents();
    }
  }, [isOpen, search, step]);

  useEffect(() => {
    if (selectedStudent) {
      fetchObjectives(selectedStudent.id);
    }
  }, [selectedStudent]);

  // Reset del modal al cerrar o abrir
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedStudent(null);
      setSearch('');
      setNewObjectiveTitle('');
      setNewObjectiveDescription('');
      setNewObjectiveTargetDate('');
      setIsCreatingNewObjective(false);
      setSelectedObjectiveId('');
    }
  }, [isOpen]);

  const handleAssign = async (withoutObjective: boolean = false) => {
    if (!selectedStudent) return;
    
    try {
      setAssigning(true);
      
      const payload: any = {
        menteeId: selectedStudent.id,
      };

      if (!withoutObjective) {
        if (isCreatingNewObjective) {
          if (!newObjectiveTitle.trim()) {
            toast.error('Por favor, ingresá el título del objetivo');
            setAssigning(false);
            return;
          }
          payload.newObjective = {
            title: newObjectiveTitle,
            description: newObjectiveDescription || undefined,
            targetDate: newObjectiveTargetDate || undefined,
          };
        } else if (selectedObjectiveId) {
          payload.objectiveId = selectedObjectiveId;
        }
      }

      const response = await apiClient.post<any>(`/mentor/programs/${templateId}/assign`, payload);
      toast.success(`Programa asignado a ${selectedStudent.name}`);
      onClose();
      
      if (response && response.id) {
        router.push(`/dashboard/programs/${response.id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al asignar el programa');
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {step === 2 ? (
                <Target className="w-4 h-4 text-indigo-600 animate-pulse" />
              ) : (
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              )}
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                {step === 2 ? 'Paso 2: Objetivos' : 'Asignación Directa'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
              {step === 2 ? 'Establecer Objetivo' : 'Asignar Estudiante'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
              Plantilla: <span className="text-indigo-600">{templateName}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* STEP 1: Search and Select Student */}
        {step === 1 && (
          <>
            {/* Search Area */}
            <div className="p-6 border-b border-slate-50">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o email..."
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {loading ? (
                 <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando Comunidad...</span>
                 </div>
               ) : students.length === 0 ? (
                 <div className="text-center py-20">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No se encontraron estudiantes</p>
                 </div>
               ) : (
                 students.map(student => (
                   <div 
                    key={student.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-3xl transition-all group cursor-pointer border border-transparent hover:border-slate-100"
                    onClick={() => {
                      setSelectedStudent({ id: student.id, name: student.name });
                      setStep(2);
                    }}
                   >
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                           {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{student.name}</div>
                           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.email}</div>
                        </div>
                     </div>
                     <button 
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100 active:scale-95 flex items-center gap-2 group-hover:bg-indigo-600"
                     >
                       <Check className="w-3 h-3" />
                       Asignar
                     </button>
                   </div>
                 ))
               )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/30 text-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Selecciona un estudiante para crear su programa personalizado
               </p>
            </div>
          </>
        )}

        {/* STEP 2: Optional Goal/Objective association */}
        {step === 2 && selectedStudent && (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Mentee Banner */}
              <div className="p-4 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Estudiante seleccionado</span>
                  <div className="text-base font-black text-slate-800 uppercase tracking-tight">{selectedStudent.name}</div>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 hover:border-slate-300 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Cambiar
                </button>
              </div>

              {loadingObjectives ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Analizando metas existentes...</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Selector de modo */}
                  {existingObjectives.length > 0 && (
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewObjective(false)}
                        className={`flex-1 py-3 text-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isCreatingNewObjective ? 'bg-white text-slate-850 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Objetivo Existente
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewObjective(true)}
                        className={`flex-1 py-3 text-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCreatingNewObjective ? 'bg-white text-slate-850 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Crear Nuevo Objetivo
                      </button>
                    </div>
                  )}

                  {/* CASO: Asociar a existente */}
                  {!isCreatingNewObjective && existingObjectives.length > 0 && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Selecciona la Meta del Alumno
                      </label>
                      <div className="relative">
                        <select
                          className="w-full px-5 py-4 bg-slate-55 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer"
                          value={selectedObjectiveId}
                          onChange={(e) => setSelectedObjectiveId(e.target.value)}
                        >
                          {existingObjectives.map((obj) => (
                            <option key={obj.id} value={obj.id}>
                              🎯 {obj.title}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                          <Check className="w-4 h-4 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CASO: Crear nuevo objetivo */}
                  {isCreatingNewObjective && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-indigo-600" /> Título de la Meta
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Bajar 5kg de grasa corporal o Correr 10k"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
                          value={newObjectiveTitle}
                          onChange={(e) => setNewObjectiveTitle(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Fecha Límite (Opcional)
                          </label>
                          <input
                            type="date"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
                            value={newObjectiveTargetDate}
                            onChange={(e) => setNewObjectiveTargetDate(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-indigo-600" /> Descripción (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Entrenar fuerza 3x/semana"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
                            value={newObjectiveDescription}
                            onChange={(e) => setNewObjectiveDescription(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 mt-8">
              <button
                type="button"
                disabled={assigning}
                onClick={() => handleAssign(false)}
                className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {assigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar y Asignar
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={assigning}
                onClick={() => handleAssign(true)}
                className="w-full py-4 bg-slate-100 text-slate-650 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75"
              >
                Omitir y Asignar sin Objetivo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
