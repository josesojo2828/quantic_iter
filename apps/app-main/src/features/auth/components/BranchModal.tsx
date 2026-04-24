'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, MapPin, Phone, Building2, Loader2, AlertCircle } from 'lucide-react';
import { branchesService, Branch } from '../services/branches.service';
import { toast } from 'react-hot-toast';

const branchSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type BranchValues = z.infer<typeof branchSchema>;

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branchToEdit?: Branch | null;
}

export const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, onSuccess, branchToEdit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<BranchValues>({
    resolver: zodResolver(branchSchema),
  });

  useEffect(() => {
    if (branchToEdit) {
      setValue('name', branchToEdit.name);
      setValue('address', branchToEdit.address || '');
      setValue('phone', branchToEdit.phone || '');
    } else {
      reset({
        name: '',
        address: '',
        phone: '',
      });
    }
  }, [branchToEdit, isOpen, setValue, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: BranchValues) => {
    setIsLoading(true);
    setError(null);
    try {
      if (branchToEdit) {
        await branchesService.updateBranch(branchToEdit.id, data);
        toast.success('Sucursal actualizada con éxito');
      } else {
        await branchesService.createBranch(data);
        toast.success('Sucursal creada con éxito');
      }
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving branch:', err);
      setError(err.message || 'Error al guardar la sucursal. Verificá tu plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-neutral/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral uppercase tracking-tight">
                  {branchToEdit ? 'Actualizar' : 'Crear'} <span className="font-light">Sucursal</span>
                </h3>
                <p className="text-[10px] text-neutral/40 font-black uppercase tracking-widest">
                  {branchToEdit ? 'Modifica los datos de la sede' : 'Añadir nueva sede a tu red de talleres'}
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
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral/40 uppercase tracking-widest ml-1">Nombre de la Sede</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30 group-focus-within:text-primary transition-colors" />
                <input 
                  {...register('name')}
                  className="w-full bg-neutral/5 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-neutral/20 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-neutral"
                  placeholder="Ej. Taller Central - Norte"
                />
              </div>
              {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral/40 uppercase tracking-widest ml-1">Dirección Física</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30 group-focus-within:text-primary transition-colors" />
                <input 
                  {...register('address')}
                  className="w-full bg-neutral/5 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-neutral/20 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-neutral"
                  placeholder="Calle Falsa 123, Ciudad"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral/40 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30 group-focus-within:text-primary transition-colors" />
                <input 
                  {...register('phone')}
                  className="w-full bg-neutral/5 border border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-neutral/20 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-neutral"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
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
                    <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    {branchToEdit ? 'Guardar Cambios' : 'Crear Sucursal'}
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
