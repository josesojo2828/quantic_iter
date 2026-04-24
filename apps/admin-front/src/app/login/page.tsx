'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      await login(email, password);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Cargando...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
            top: '-10%',
            right: '-10%',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
            bottom: '-15%',
            left: '-10%',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <div 
          className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 6s ease-in-out infinite',
          }}
        />

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Login Card */}
      <div 
        className={`
          relative z-10 w-full max-w-md mx-4
          transition-all duration-700 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* Glass Card */}
        <div 
          className="relative p-10 rounded-[32px] border border-white/[0.08] overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Card inner glow */}
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

          {/* Header */}
          <div className="relative flex flex-col items-center mb-10">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/[0.08]"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(168,85,247,0.3) 100%)',
                boxShadow: '0 10px 30px rgba(99,102,241,0.15)',
              }}
            >
              <ShieldCheck className="w-8 h-8 text-white/90" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Quantic
            </h1>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] mt-1" style={{ color: 'rgba(99,102,241,0.8)' }}>
              Admin Console
            </span>
            <p className="text-white/20 text-xs mt-4 font-medium text-center">
              Acceso exclusivo para administradores del ecosistema
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="relative flex items-center gap-3 p-4 rounded-2xl mb-6 border border-red-500/20 animate-in fade-in slide-in-from-top-2"
              style={{
                background: 'rgba(239,68,68,0.08)',
              }}
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-xs text-red-300 font-bold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative space-y-5">
            {/* Email */}
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2 ml-1 group-focus-within:text-indigo-400 transition-colors">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@quantic.app"
                  required
                  autoComplete="email"
                  className="
                    w-full pl-12 pr-5 py-4 rounded-2xl text-sm text-white font-medium
                    placeholder:text-white/15 outline-none
                    border border-white/[0.06] 
                    transition-all duration-300
                    focus:border-indigo-500/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.08)]
                  "
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2 ml-1 group-focus-within:text-indigo-400 transition-colors">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="
                    w-full pl-12 pr-14 py-4 rounded-2xl text-sm text-white font-medium
                    placeholder:text-white/15 outline-none
                    border border-white/[0.06]
                    transition-all duration-300
                    focus:border-indigo-500/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.08)]
                  "
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="
                w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white
                transition-all duration-300
                disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none
                hover:-translate-y-0.5
                active:scale-[0.98]
              "
              style={{
                background: submitting 
                  ? 'rgba(99,102,241,0.3)' 
                  : 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(168,85,247,0.8) 100%)',
                boxShadow: submitting 
                  ? 'none' 
                  : '0 10px 30px rgba(99,102,241,0.2)',
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="relative mt-8 pt-6 border-t border-white/[0.04] text-center">
            <p className="text-[10px] text-white/15 font-bold uppercase tracking-[0.2em]">
              Quantic Ecosystem © 2026
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
