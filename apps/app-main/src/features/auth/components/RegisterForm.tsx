'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock, Building2, Eye, EyeOff, Loader2, ArrowRight, GraduationCap, X } from 'lucide-react';
import { authService } from '../services/auth.service';
import { apiClient } from '@/core/api/api.client';
import { useAuth } from '@/core/contexts/AuthContext';
import { toast } from 'react-hot-toast';
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
  const token = searchParams.get('token');
  
  const { user: authUser, refreshProfile } = useAuth();

  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const magneticButtonRef = useMagnetic(0.2);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [accountType, setAccountType] = useState<'academy' | 'independent'>('academy');
  const [gender, setGender] = useState<'male' | 'female' | 'neutral'>('male');

  // Invitation token validation states
  const [invitationData, setInvitationData] = useState<{ email: string; tenantName: string; roleName: string } | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      mentorName: '',
    }
  });

  // Validate token on mount
  useEffect(() => {
    if (token) {
      setIsValidatingToken(true);
      setTokenError(null);
      apiClient.get(`/invitation/validate/${token}`)
        .then((res: any) => {
          setInvitationData({
            email: res.email,
            tenantName: res.tenantName || 'la organizacion',
            roleName: res.roleName || 'Colaborador',
          });
          setValue('email', res.email);
        })
        .catch(() => {
          setTokenError('El enlace de invitacion es invalido o ha expirado.');
        })
        .finally(() => {
          setIsValidatingToken(false);
        });
    }
  }, [token, setValue]);

  // Entry animation disabled for testing

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
      
      // Handle invitation flow
      if (token) {
        (payload as any).invitationToken = token;
      } else if (invitationCode) {
        (payload as any).tenantId = invitationCode;
        (payload as any).role = 'mentee';
      }

      // Auto-complete mentorName for independent coaches if not provided
      if (accountType === 'independent' && !token && !invitationCode) {
        payload.mentorName = `Coach ${data.firstName} ${data.lastName}`;
      } else {
        if (!payload.mentorName) delete payload.mentorName;
      }

      // Inyectar el género seleccionado por el usuario para asignarle un avatar dinámico en el backend
      (payload as any).gender = gender;
      
      console.log('📦 Payload prepared:', payload);
      await authService.register(payload);
      router.push(`/login?registered=true${token ? '&type=staff' : (invitationCode ? '&type=student' : '')}`);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Loading state during token validation
  if (token && isValidatingToken) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 text-[#8A94F4] animate-spin" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Validando invitacion...</span>
      </div>
    );
  }

  // 2. Token error handling
  if (token && tokenError) {
    return (
      <div className="space-y-6 text-center py-10">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500 border border-red-100 shadow-sm">
          <X className="w-8 h-8" /> {/* Wait, X is not imported, let's make sure we use an icon that is imported or simple svg */}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Enlace Invalido</h3>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{tokenError}</p>
        </div>
        <Link href="/login" className="block w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
          Ir al Login
        </Link>
      </div>
    );
  }

  // 3. User is already logged in - Direct one-click join action
  if (token && authUser) {
    return (
      <div className="space-y-6 text-center py-10 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mx-auto border border-emerald-100 shadow-md">
          <Building2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">¡Hola, {authUser.firstName}!</h2>
          <p className="text-slate-500 text-sm font-medium">
            Fuiste invitado a unirte a <span className="font-bold text-slate-800">{invitationData?.tenantName || 'la organizacion'}</span> como <span className="font-bold text-slate-800">{invitationData?.roleName || 'Colaborador'}</span>.
          </p>
        </div>
        
        <button
          onClick={async () => {
            setIsLoading(true);
            try {
              await apiClient.post(`/invitation/accept/${token}`, {});
              toast.success('Te has unido con exito');
              await refreshProfile();
              router.push('/dashboard');
            } catch (err: any) {
              setError(err.message || 'Error al aceptar la invitacion');
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          type="button"
          className="w-full py-5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aceptar Invitacion y Entrar'}
        </button>

        <p className="text-xs text-slate-400 font-medium">
          ¿No eres tu? <button onClick={() => authService.logout().then(() => window.location.reload())} type="button" className="font-bold text-indigo-500 hover:underline">Cerrar Sesion</button>
        </p>
      </div>
    );
  }

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
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] italic">Invitacion Autorizada</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            Estas a punto de unirte a la red del coach. Al registrarte te vincularas de forma inmediata a la academia como estudiante.
          </p>
        </div>
      )}

      {token && invitationData && (
        <div className="p-4 bg-emerald-50/60 backdrop-blur-xl border border-emerald-100 rounded-2xl flex flex-col gap-2 shadow-[0_8px_16px_rgba(16,185,129,0.04)] mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] italic">Invitacion de Colaborador</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            Te has invitado a unirte a <span className="font-bold text-slate-700">{invitationData.tenantName}</span> como <span className="font-bold text-slate-700">{invitationData.roleName}</span>. Completa tus datos para activar tu cuenta.
          </p>
        </div>
      )}

      {/* ... (fields remain the same) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 form-field">
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
        <label className={labelClasses}>Correo Electronico</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C757D] group-focus-within:text-[#8A94F4] transition-colors" />
          <input
            {...register('email')}
            type="email"
            disabled={!!token}
            className={`${inputClasses} disabled:opacity-60 disabled:cursor-not-allowed`}
            placeholder="contacto@ejemplo.com"
          />
        </div>
        {errors.email && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-2 uppercase tracking-wider">{errors.email.message}</p>}
      </div>

      {!invitationCode && !token && (
        <div className="form-field space-y-3">
          <label className={labelClasses}>Tipo de Cuenta / Registro</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OPCION ACADEMIA */}
            <button
              type="button"
              onClick={() => setAccountType('academy')}
              className={`p-4 rounded-[20px] border flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 group/card ${
                accountType === 'academy'
                  ? 'bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm'
                  : 'bg-[#F1F5F9] border-[#CBD5E1] hover:border-indigo-300'
              }`}
            >
              <Building2 className={`w-6 h-6 transition-all duration-500 ${accountType === 'academy' ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover/card:text-indigo-500'}`} />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block text-slate-900 italic">Centro / Gimnasio</span>
                <span className="text-[7.5px] text-[#6C757D]/70 font-semibold block mt-0.5 leading-tight">Para centros con múltiples coaches</span>
              </div>
            </button>

            {/* OPCION INDEPENDIENTE */}
            <button
              type="button"
              onClick={() => setAccountType('independent')}
              className={`p-4 rounded-[20px] border flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 group/card ${
                accountType === 'independent'
                  ? 'bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm'
                  : 'bg-[#F1F5F9] border-[#CBD5E1] hover:border-indigo-300'
              }`}
            >
              <User className={`w-6 h-6 transition-all duration-500 ${accountType === 'independent' ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover/card:text-indigo-500'}`} />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block text-slate-900 italic">Coach Independiente</span>
                <span className="text-[7.5px] text-[#6C757D]/70 font-semibold block mt-0.5 leading-tight">Para entrenadores de marca personal</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* CAMPO NOMBRE DE ACADEMIA (SOLO SE MUESTRA SI ES ACADEMIA) */}
      {!invitationCode && !token && accountType === 'academy' && (
        <div className="form-field animate-in fade-in slide-in-from-top-3 duration-500">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 form-field">
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

      {/* SELECCIÓN DE GÉNERO / IDENTIDAD */}
      <div className="form-field space-y-3">
        <label className={labelClasses}>Género / Identidad</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'male', label: 'Masculino', desc: 'Coach Chico' },
            { id: 'female', label: 'Femenino', desc: 'Coach Chica' },
            { id: 'neutral', label: 'Neutral / Otro', desc: 'Sin Preferencia' },
          ].map((option) => {
            const isSelected = gender === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setGender(option.id as any)}
                className={`py-3.5 px-3 rounded-[20px] border flex flex-col items-center justify-center text-center gap-1 transition-all duration-300 group/gender ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm scale-102'
                    : 'bg-[#F1F5F9] border-[#CBD5E1] hover:border-indigo-300'
                }`}
              >
                <span className={`text-[9.5px] font-black uppercase tracking-wider block transition-colors duration-300 ${
                  isSelected ? 'text-indigo-600' : 'text-slate-950'
                }`}>
                  {option.label}
                </span>
                <span className="text-[7px] text-[#6C757D]/70 font-semibold block uppercase tracking-wider leading-tight">
                  {option.desc}
                </span>
              </button>
            );
          })}
        </div>
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
