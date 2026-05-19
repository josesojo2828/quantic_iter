'use client';

import React, { useState, useEffect } from 'react';
import { X, Target, Zap, Calendar, Users, Loader2, ClipboardList, Check } from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import { contactsService, Contact } from '@/features/crm/services/contacts.service';
import toast from 'react-hot-toast';

interface ObjectiveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ObjectiveFormModal: React.FC<ObjectiveFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  // Form State
  const [assignType, setAssignType] = useState<'mentee' | 'group'>('mentee');
  const [assigneeId, setAssigneeId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [xpReward, setXpReward] = useState(500);
  const [dueDate, setDueDate] = useState('');

  const fetchAssignees = async () => {
    try {
      setLoading(true);
      const [studentsRes, groupsRes] = await Promise.all([
        contactsService.getContacts({}),
        apiClient.get<any[]>('/mentor/groups'),
      ]);
      setStudents(studentsRes.items || []);
      setGroups(Array.isArray(groupsRes) ? groupsRes : []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar alumnos o grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssignees();
      // Reset form fields
      setAssignType('mentee');
      setAssigneeId('');
      setGroupId('');
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setXpReward(500);
      setDueDate('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (assignType === 'mentee' && !assigneeId) {
      toast.error('Debes seleccionar un estudiante');
      return;
    }

    if (assignType === 'group' && !groupId) {
      toast.error('Debes seleccionar un grupo');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        title,
        description,
        priority,
        xpReward: Number(xpReward),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      if (assignType === 'mentee') {
        payload.assigneeId = assigneeId;
      } else {
        payload.groupId = groupId;
      }

      await apiClient.post('/mentor/tasks', payload);
      toast.success('¡Objetivo creado y asignado con éxito!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al crear el objetivo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-indigo-600 animate-spin-slow" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Planificación Táctica</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none italic">Nuevo Objetivo</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
              Asigna metas diarias y semanales de alto impacto
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Assignment Switcher */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asignar a</label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-50 rounded-[20px] border border-slate-100">
              <button
                type="button"
                onClick={() => setAssignType('mentee')}
                className={`py-3.5 rounded-[16px] text-[9.5px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 italic ${assignType === 'mentee' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <Users className="w-4 h-4" />
                Estudiante
              </button>
              <button
                type="button"
                onClick={() => setAssignType('group')}
                className={`py-3.5 rounded-[16px] text-[9.5px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 italic ${assignType === 'group' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <ClipboardList className="w-4 h-4" />
                Grupo / Cohorte
              </button>
            </div>
          </div>

          {/* Recipient Dropdown */}
          {loading ? (
            <div className="flex items-center gap-2 py-4 justify-center">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Buscando destinatarios...</span>
            </div>
          ) : assignType === 'mentee' ? (
            <div className="space-y-2">
              <label htmlFor="student-select" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seleccionar Alumno</label>
              <select
                id="student-select"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-semibold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all uppercase tracking-wide"
              >
                <option value="">-- Elige un Estudiante --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name.toUpperCase()} ({student.email})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="group-select" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seleccionar Grupo</label>
              <select
                id="group-select"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-semibold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all uppercase tracking-wide"
              >
                <option value="">-- Elige un Grupo --</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="task-title" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Título del Objetivo</label>
            <input
              id="task-title"
              type="text"
              placeholder="Ejem: Configuración Inicial de Entorno"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-semibold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="task-description" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descripción Táctica</label>
            <textarea
              id="task-description"
              rows={3}
              placeholder="Define las instrucciones detalladas o entregables clave..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-semibold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Dynamic Grid for Priority, XP, and Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Priority */}
            <div className="space-y-2">
              <label htmlFor="task-priority" className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prioridad</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all uppercase tracking-wider"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>

            {/* XP Reward */}
            <div className="space-y-2">
              <label htmlFor="task-xp" className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500 fill-current" />
                Recompensa XP
              </label>
              <input
                id="task-xp"
                type="number"
                min="0"
                step="50"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label htmlFor="task-due-date" className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500" />
                Fecha Límite
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-xs font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all text-slate-600"
              />
            </div>

          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4.5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.25em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group italic border border-indigo-400/30"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Desplegando Misión...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Asignar Misión
                </>
              )}
            </button>
          </div>

        </form>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/30 text-center">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              El alumno recibirá notificaciones y ganará XP tras tu validación
           </p>
        </div>
      </div>
    </div>
  );
};
