'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Users, Check, GraduationCap, Loader2 } from 'lucide-react';
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
  const [students, setStudents] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen, search]);

  const handleAssign = async (studentId: string, studentName: string) => {
    try {
      setAssigning(true);
      const response = await apiClient.post<any>(`/mentor/programs/${templateId}/assign`, { menteeId: studentId });
      toast.success(`Programa asignado a ${studentName}`);
      onClose();
      // Redirigir al nuevo programa clonado
      if (response && response.id) {
        router.push(`/dashboard/programs/${response.id}`);
      }
    } catch (error) {
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
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Asignación Directa</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Asignar Estudiante</h2>
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
                onClick={() => !assigning && handleAssign(student.id, student.name)}
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
                  disabled={assigning}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100 active:scale-95 flex items-center gap-2 group-hover:bg-indigo-600"
                 >
                   {assigning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
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
      </div>
    </div>
  );
};
