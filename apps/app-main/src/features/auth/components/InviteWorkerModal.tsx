'use client';

import React, { useState, useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, UserPlus, Mail, User, Shield, Loader2, AlertCircle, MapPin } from 'lucide-react';
import { workersService, Worker } from '../services/workers.service';
import { branchesService, Branch } from '../services/branches.service';
import { toast } from 'react-hot-toast';

const inviteWorkerSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().min(2, 'El nombre es muy corto'),
  lastName: z.string().min(2, 'El apellido es muy corto'),
  roleSlug: z.enum(['facilitator', 'support']),
  branchId: z.string().optional(),
});

type InviteWorkerValues = z.infer<typeof inviteWorkerSchema>;

interface InviteWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workerToEdit?: Worker | null;
}

export const InviteWorkerModal: React.FC<InviteWorkerModalProps> = ({ isOpen, onClose, onSuccess, workerToEdit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<InviteWorkerValues>({
    resolver: zodResolver(inviteWorkerSchema),
    defaultValues: {
      roleSlug: 'facilitator',
    }
  });

  const selectedRole = watch('roleSlug');

  useEffect(() => {
    const fetchBranches = async () => {
      setIsFetchingBranches(true);
      try {
        const data = await branchesService.getBranches();
        setBranches(data);
      } catch (err) {
        console.error('Error fetching branches:', err);
      } finally {
        setIsFetchingBranches(false);
      }
    };

    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  useEffect(() => {
    if (workerToEdit) {
      setValue('firstName', workerToEdit.firstName);
      setValue('lastName', workerToEdit.lastName);
      setValue('email', workerToEdit.email);
      const roleSlug = typeof workerToEdit.role === 'object' ? (workerToEdit.role as any).slug : workerToEdit.role;
      setValue('roleSlug', roleSlug as any);
      if (workerToEdit.branchId) {
        setValue('branchId', workerToEdit.branchId);
      }
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        roleSlug: 'facilitator',
        branchId: '',
      });
    }
  }, [workerToEdit, isOpen, setValue, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: InviteWorkerValues) => {
    setIsLoading(true);
    setError(null);
    try {
      if (workerToEdit) {
        await workersService.updateWorker(workerToEdit.id, data);
        toast.success('Usuario actualizado con éxito');
      } else {
        await workersService.inviteWorker(data);
        toast.success('Usuario creado con éxito');
      }
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving worker:', err);
      setError(err.message || 'Error al guardar el usuario. Verificá los límites de tu plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral uppercase tracking-tight">
                  {workerToEdit ? 'Actualizar' : 'Crear'} <span className="font-light">Usuario</span>
                </h3>
                <p className="text-[10px] text-neutral/40 font-black uppercase tracking-widest">
                  {workerToEdit ? 'Modifica los datos del colaborador' : 'Añadir nuevo colaborador al mentoría'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-neutral/5 rounded-full transition-colors text-neutral/20 hover:text-neutral"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral/40 uppercase tracking-widest ml-1">Nombre</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30 group-focus-within:text-primary transition-colors" />
                  <input 
                    {...register('firstName')}
                    className="w-full bg-neutral/5 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-neutral/20 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-neutral"
                    placeholder="Ej. Juan"
                  />
                </div>
                {errors.firstName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral/40 uppercase tracking-widest ml-1">Apellido</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30 group-focus-within:text-primary transition-colors" />
                  <input 
                    {...register('lastName')}
                    className="w-full bg-neutral/5 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-neutral/20 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-neutral"
                    placeholder="Ej. Pérez"
                  />
                </div>
                {errors.lastName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral/40 uppercase tracking-widest ml-1">Email Profesional</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30 group-focus-within:text-primary transition-colors" />
                <input 
                  {...register('email')}
                  type="email"
                  disabled={!!workerToEdit}
                  className="w-full bg-neutral/5 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-neutral/20 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-neutral disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="juan.perez@mentoría.map"
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral/40 uppercase tracking-widest ml-1">Rol Operativo</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedRole === 'facilitator' ? 'border-primary bg-primary/5' : 'border-neutral/5 hover:border-neutral/10 bg-neutral/5'
                }`}>
                  <input 
                    type="radio" 
                    value="facilitator" 
                    {...register('roleSlug')}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRole === 'facilitator' ? 'bg-primary text-white' : 'bg-neutral/10 text-neutral/40'}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-black uppercase ${selectedRole === 'facilitator' ? 'text-primary' : 'text-neutral/40'}`}>Facilitador</span>
                </label>

                <label className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedRole === 'support' ? 'border-primary bg-primary/5' : 'border-neutral/5 hover:border-neutral/10 bg-neutral/5'
                }`}>
                  <input 
                    type="radio" 
                    value="support" 
                    {...register('roleSlug')}
                    className="sr-only"
                  />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRole === 'support' ? 'bg-primary text-white' : 'bg-neutral/10 text-neutral/40'}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-black uppercase ${selectedRole === 'support' ? 'text-primary' : 'text-neutral/40'}`}>Gestión</span>
                </label>
              </div>
              {errors.roleSlug && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.roleSlug.message}</p>}
            </div>

            {branches.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral/40 uppercase tracking-widest ml-1">Sede / Sucursal</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30 group-focus-within:text-primary transition-colors" />
                  <select 
                    {...register('branchId')}
                    className="w-full bg-neutral/5 border border-transparent rounded-2xl pl-12 pr-10 py-3.5 text-sm font-bold outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-neutral appearance-none cursor-pointer"
                  >
                    <option value="">Oficina Central / Sin Sede</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Loader2 className={`w-3 h-3 text-neutral/30 transition-opacity ${isFetchingBranches ? 'opacity-100 animate-spin' : 'opacity-0'}`} />
                  </div>
                </div>
                <p className="px-1 text-[9px] text-neutral/30 font-medium leading-tight">
                  Asigná al trabajador a una ubicación física específica.
                </p>
              </div>
            )}

            <div className="pt-4 flex items-center gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-neutral/40 hover:text-neutral transition-colors"
              >
                Cancelar
              </button>
              <button 
                disabled={isLoading}
                className="flex-[2] py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    {workerToEdit ? 'Guardar Cambios' : 'Crear Usuario'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
