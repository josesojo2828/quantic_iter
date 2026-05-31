'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useAuth } from '@/core/contexts/AuthContext';
import gsap from 'gsap';
import Link from 'next/link';
import { useMagnetic } from '@/shared/hooks/useMagnetic';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const magneticButtonRef = useMagnetic(0.2);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { refreshProfile } = useAuth();

  // Entry animation disabled for testing

  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(errorRef.current,
        { x: -10 },
        { x: 10, duration: 0.1, repeat: 5, yoyo: true, ease: "none" }
      );
    }
  }, [error]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(data);
      await refreshProfile();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }}
      method="POST"
      noValidate
      className="space-y-6"
    >
      {error && (
        <div ref={errorRef} className="p-4 bg-red-50/50 border border-red-100 text-red-600 text-xs font-semibold rounded-2xl flex items-center gap-3">
          <div className="w-1.5 h-6 bg-red-500 rounded-full" />
          {error}
        </div>
      )}

      {/* ... fields ... */}
      <div className="space-y-4">
        <div className="form-field">
          <label className="block text-[10px] font-black text-[#6C757D] uppercase tracking-[0.15em] mb-2 ml-1">
            Identidad Digital
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-[#6C757D] group-focus-within:text-[#8A94F4] transition-colors" />
            </div>
            <input
              {...register('email')}
              type="email"
              className="block w-full pl-12 pr-4 py-3.5 border border-[#CBD5E1] rounded-2xl bg-[#F1F5F9] shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)] placeholder-[#6C757D]/60 focus:outline-none focus:ring-4 focus:ring-[#8A94F4]/20 focus:border-[#8A94F4] focus:bg-white text-sm transition-all hover:border-[#94A3B8]"
              placeholder="correo@ejemplo.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-[10px] text-red-500 font-bold uppercase ml-2 tracking-wider">{errors.email.message}</p>
          )}
        </div>

        <div className="form-field">
          <div className="flex items-center justify-between mb-2 ml-1">
            <label className="block text-[10px] font-black text-[#6C757D] uppercase tracking-[0.15em]">
              Acceso Seguro
            </label>
            <Link href="/recover-password" virtual-link="true" className="text-[10px] font-bold text-[#8A94F4] hover:text-[#7A84E4] uppercase tracking-wider transition-colors">
              ¿Olvidaste la clave?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[#6C757D] group-focus-within:text-[#8A94F4] transition-colors" />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="block w-full pl-12 pr-12 py-3.5 border border-[#CBD5E1] rounded-2xl bg-[#F1F5F9] shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)] placeholder-[#6C757D]/60 focus:outline-none focus:ring-4 focus:ring-[#8A94F4]/20 focus:border-[#8A94F4] focus:bg-white text-sm transition-all hover:border-[#94A3B8]"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-[#6C757D] hover:text-[#1A1C1E] transition-colors" />
              ) : (
                <Eye className="h-4 w-4 text-[#6C757D] hover:text-[#1A1C1E] transition-colors" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-[10px] text-red-500 font-bold uppercase ml-2 tracking-wider">{errors.password.message}</p>
          )}
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
                Sincronizar Acceso
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="form-field pt-4">
        <p className="text-center text-xs text-[#6C757D] font-medium">
          ¿Sin credenciales activas?{' '}
          <Link
            href="/register"
            className="font-bold text-[#8A94F4] hover:text-[#7A84E4] transition-colors"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </form>
  );
};
