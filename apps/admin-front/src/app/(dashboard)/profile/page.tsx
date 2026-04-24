'use client';

import { useAuth } from '@/core/auth/AuthContext';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50/50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral uppercase tracking-tighter">
              Mi <span className="font-light text-primary">Perfil</span>
            </h1>
            <p className="text-[10px] text-neutral/40 font-black uppercase tracking-[0.3em] mt-1">
              Información del Administrador
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 p-10">
          {user ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center text-primary text-2xl font-black uppercase">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-neutral">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-neutral/40 font-medium">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-neutral/20 text-sm font-bold italic text-center">
              Cargando perfil...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
