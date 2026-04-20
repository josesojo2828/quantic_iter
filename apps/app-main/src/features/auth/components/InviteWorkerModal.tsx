'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, UserPlus, Mail, User, Shield, Loader2, AlertCircle } from 'lucide-react';
import { workersService } from '../services/workers.service';
import { toast } from 'react-hot-toast';

const inviteWorkerSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().min(2, 'El nombre es muy corto'),
  lastName: z.string().min(2, 'El apellido es muy corto'),
  roleSlug: z.enum(['mechanic', 'receptionist']),
});

type InviteWorkerValues = z.infer<typeof inviteWorkerSchema>;

interface InviteWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteWorkerModal: React.FC<InviteWorkerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InviteWorkerValues>({
    resolver: zodResolver(inviteWorkerSchema),
    defaultValues: {
      roleSlug: 'mechanic',
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: InviteWorkerValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await workersService.inviteWorker(data);
      toast.success('Colaborador invitado con éxito');
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error inviting worker:', err);
      setError(err.message || 'Error al invitar al colaborador. Verificá los límites de tu plan.');
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
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral uppercase tracking-tight">Invitar Miembro</h3>
                <p className="text-[10px] text-neutral/40 font-black uppercase tracking-widest">Añadir nuevo colaborador al taller</p>
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
                  className="w-full bg-neutral/5 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-neutral/20 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-neutral"
                  placeholder="juan.perez@taller.map"
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral/40 uppercase tracking-widest ml-1">Rol en el Taller</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  register('roleSlug').name && 'hover:bg-neutral/5'
                }`}>
                  <input 
                    type="radio" 
                    value="mechanic" 
                    {...register('roleSlug')}
                    className="sr-only"
                  />
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-neutral">Mecánico</span>
                </label>

                <label className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  register('roleSlug').name && 'hover:bg-neutral/5'
                }`}>
                  <input 
                    type="radio" 
                    value="receptionist" 
                    {...register('roleSlug')}
                    className="sr-only"
                  />
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-neutral">Recepción</span>
                </label>
              </div>
              {errors.roleSlug && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.roleSlug.message}</p>}
            </div>

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
                    <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                  </>
                ) : (
                  <>
                    Enviar Invitación
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
