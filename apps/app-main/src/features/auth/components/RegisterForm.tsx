'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Nombre muy corto'),
  lastName: z.string().min(2, 'Apellido muy corto'),
  email: z.string().email('Email inválido'),
  workshopName: z.string().min(3, 'Nombre de taller inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const { confirmPassword, ...payload } = data;
      await authService.register(payload);
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Error al registrar taller');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 sm:text-sm transition-all";
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-tighter mb-1.5 ml-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <div className="w-1 h-4 bg-red-500 rounded-full" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Nombre</label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600" />
            <input {...register('firstName')} className={inputClasses} placeholder="Juan" />
          </div>
          {errors.firstName && <p className="mt-1 text-[10px] text-red-500 font-bold ml-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className={labelClasses}>Apellido</label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600" />
            <input {...register('lastName')} className={inputClasses} placeholder="Perez" />
          </div>
          {errors.lastName && <p className="mt-1 text-[10px] text-red-500 font-bold ml-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClasses}>Correo Electrónico</label>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600" />
          <input {...register('email')} type="email" className={inputClasses} placeholder="contacto@taller.com" />
        </div>
        {errors.email && <p className="mt-1 text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className={labelClasses}>Nombre del Taller</label>
        <div className="relative group">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600" />
          <input {...register('workshopName')} className={inputClasses} placeholder="Quantic Motors" />
        </div>
        {errors.workshopName && <p className="mt-1 text-[10px] text-red-500 font-bold ml-1">{errors.workshopName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Contraseña</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600" />
            <input {...register('password')} type={showPassword ? 'text' : 'password'} className={inputClasses} placeholder="••••••" />
          </div>
        </div>
        <div>
          <label className={labelClasses}>Confirmar</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600" />
            <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} className={inputClasses} placeholder="••••••" />
          </div>
        </div>
        {errors.password && <p className="col-span-2 mt-1 text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</p>}
        {errors.confirmPassword && <p className="col-span-2 mt-1 text-[10px] text-red-500 font-bold ml-1">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-4 px-4 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar mi Taller Profesional'}
      </button>

      <p className="text-center text-xs text-gray-500">
         ¿Ya tienes cuenta?{' '}
         <button type="button" onClick={() => router.push('/login')} className="font-bold text-emerald-600 hover:text-emerald-700">
           Inicia Sesión
         </button>
      </p>
    </form>
  );
};
