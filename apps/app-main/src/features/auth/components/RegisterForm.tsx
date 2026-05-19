'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock, Building2, Eye, EyeOff, Loader2, ArrowRight, GraduationCap } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useRouter, useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import Link from 'next/link';
import { useMagnetic } from '@/shared/hooks/useMagnetic';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Nombre muy corto'),
  lastName: z.string().min(2, 'Apellido muy corto'),
  email: z.string().email('Email inválido'),
  mentorName: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationCode = searchParams.get('code');
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const magneticButtonRef = useMagnetic(0.2);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      mentorName: '',
    }
  });

  useEffect(() => {
    if (isMounted && formRef.current) {
      gsap.from(formRef.current.querySelectorAll('.form-field'), {
        y: 20,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.4
      });
    }
  }, [isMounted]);

  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(errorRef.current,
        { x: -10 },
        { x: 10, duration: 0.1, repeat: 5, yoyo: true, ease: "none" }
      );
    }
  }, [error]);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🚀 Submitting registration data:', data);
      const { confirmPassword, ...payload } = data;
      
      // If invitation code exists, add it to payload and set role as mentee
      if (invitationCode) {
        (payload as any).tenantId = invitationCode;
        (payload as any).role = 'mentee';
      }

      // Clean optional fields
      if (!payload.mentorName) delete payload.mentorName;

      console.log('📦 Payload prepared:', payload);
      await authService.register(payload);
      router.push(`/login?registered=true${invitationCode ? '&type=student' : ''}`);
    } catch (err: any) {
      setError(err.message || 'Error al registrar mentoría');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "block w-full pl-12 pr-4 py-3.5 border border-[#CBD5E1] rounded-2xl bg-[#F1F5F9] shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)] placeholder-[#6C757D]/60 focus:outline-none focus:ring-4 focus:ring-[#8A94F4]/20 focus:border-[#8A94F4] focus:bg-white text-sm transition-all hover:border-[#94A3B8]";
  const labelClasses = "block text-[10px] font-black text-[#6C757D] uppercase tracking-[0.15em] mb-2 ml-1";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      method="POST"
      noValidate
      className="space-y-5"
    >
      {error && (
        <div ref={errorRef} className="p-4 bg-red-50/50 border border-red-100 text-red-600 text-xs font-semibold rounded-2xl flex items-center gap-3">
          <div className="w-1.5 h-6 bg-red-500 rounded-full" />
          {error}
        </div>
      )}

      {invitationCode && (
        <div className="p-4 bg-indigo-50/60 backdrop-blur-xl border border-indigo-100 rounded-2xl flex flex-col gap-2 shadow-[0_8px_16px_rgba(99,102,241,0.04)] mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] italic">Invitación Autorizada</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            Estás a punto de unirte a la red quántica del coach. Al registrarte te vincularás de forma inmediata a la academia como estudiante.
          </p>
        </div>
      )}

      {/* ... (fields remain the same) ... */}
      <div className="grid grid-cols-2 gap-4 form-field">
        <div>
          <label className={labelClasses}>Nombre</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C757D] group-focus-within:text-[#8A94F4] transition-colors" />
            <input {...register('firstName')} className={inputClasses} placeholder="Juan" />
          </div>
          {errors.firstName && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className={labelClasses}>Apellido</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C757D] group-focus-within:text-[#8A94F4] transition-colors" />
            <input {...register('lastName')} className={inputClasses} placeholder="Perez" />
          </div>
          {errors.lastName && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="form-field">
        <label className={labelClasses}>Correo Electrónico</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C757D] group-focus-within:text-[#8A94F4] transition-colors" />
          <input {...register('email')} type="email" className={inputClasses} placeholder="contacto@ejemplo.com" />
        </div>
        {errors.email && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider">{errors.email.message}</p>}
      </div>

      {!invitationCode && (
        <div className="form-field">
          <div className="flex items-center justify-between mb-2 ml-1">
            <label className={labelClasses}>Nombre de la Academia</label>
            <span className="text-[9px] font-bold text-[#6C757D]/50 uppercase tracking-wider">Opcional</span>
          </div>
          <div className="relative group">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C757D] group-focus-within:text-[#8A94F4] transition-colors" />
            <input {...register('mentorName')} className={inputClasses} placeholder="Quantic Academy (Opcional)" />
          </div>
          {errors.mentorName && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider">{errors.mentorName.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 form-field">
        <div>
          <label className={labelClasses}>Contraseña</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C757D] group-focus-within:text-[#8A94F4] transition-colors" />
            <input {...register('password')} type={showPassword ? 'text' : 'password'} className={inputClasses} placeholder="••••••" />
          </div>
        </div>
        <div>
          <label className={labelClasses}>Confirmar</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C757D] group-focus-within:text-[#8A94F4] transition-colors" />
            <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} className={inputClasses} placeholder="••••••" />
          </div>
        </div>
        {errors.password && <p className="col-span-2 mt-1.5 text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider">{errors.password.message}</p>}
        {errors.confirmPassword && <p className="col-span-2 mt-1.5 text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider">{errors.confirmPassword.message}</p>}
      </div>

      <div className="form-field pt-2">
        <div ref={magneticButtonRef as any}>
          <button
            type="submit"
            disabled={isLoading}
            className="mq-button-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-3 font-black uppercase tracking-[0.15em] text-[11px]">
                {invitationCode ? 'Unirme a la Academia' : 'Inicializar Academia'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="form-field pt-4">
        <p className="text-center text-xs text-[#6C757D] font-medium">
          ¿Ya tienes acceso activo?{' '}
          <Link href="/login" className="font-bold text-[#8A94F4] hover:text-[#7A84E4] transition-colors">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </form>
  );
};
