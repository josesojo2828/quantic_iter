"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import gsap from "gsap";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Aura Entrance Animation
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power4.out", delay: 0.2 }
      );
      
      gsap.from(".reveal-item", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.6
      });
    });
    
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const success = await login(email, password);
      if (success) {
        gsap.to(cardRef.current, { 
          opacity: 0, 
          scale: 1.05, 
          filter: "blur(20px)",
          duration: 0.5, 
          onComplete: () => router.push("/dashboard") 
        });
      } else {
        setError("Credenciales inválidas o sin permisos");
        gsap.to(cardRef.current, { 
          x: 10, 
          duration: 0.1, 
          repeat: 3, 
          yoyo: true, 
          ease: "linear" 
        });
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-transparent">
      {/* Dynamic Grid Background (Aura Style) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05]" 
           style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

      <div ref={cardRef} className="relative z-10 w-full max-w-md">
        {/* Aura Glass Card */}
        <div className="aura-glass p-10 rounded-[32px] aura-border-glow overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="relative flex flex-col items-center mb-10 reveal-item">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 aura-glass-light border border-white/10 shadow-[0_0_30px_rgba(0,210,255,0.2)]">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-gradient uppercase tracking-tight">
              Quantic
            </h1>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] mt-1 text-primary text-glow-primary">
              Admin Console
            </span>
            <p className="text-white/30 text-xs mt-4 font-medium text-center">
              Acceso exclusivo para administradores Aura
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl mb-6 bg-red-500/10 border border-red-500/20 reveal-item">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-xs text-red-300 font-bold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2 reveal-item">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@quantic.app"
                  required
                  className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm bg-white/5 border border-white/10 outline-none focus:border-primary/40 focus:bg-white/10 transition-all text-white"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 reveal-item">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-14 py-4 rounded-2xl text-sm bg-white/5 border border-white/10 outline-none focus:border-primary/40 focus:bg-white/10 transition-all text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-gradient-to-r from-primary to-secondary text-white shadow-[0_10px_30px_rgba(0,210,255,0.3)] hover:shadow-[0_15px_40px_rgba(0,210,255,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed reveal-item"
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
          <div className="mt-8 pt-6 border-t border-white/5 text-center reveal-item">
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
              Quantic Ecosystem © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
