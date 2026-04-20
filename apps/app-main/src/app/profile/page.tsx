'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { apiClient } from '@/core/api/api.client';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Key, 
  LogOut,
  Camera,
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiClient.get<any>('/auth/me');
        setUser(data);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??';

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-10 ml-32">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Perfil de Usuario</h1>
            <p className="text-sm text-gray-500 font-medium font-inter mt-1 italic">Gestiona tu identidad personal y configuración de seguridad corporativa.</p>
          </header>

          <div className="space-y-8">
            {/* User Hero Section */}
            <div className="admin-card p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-emerald-600/20">
                  {initials}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-500 hover:text-emerald-600 transition-all opacity-0 group-hover:opacity-100">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-black uppercase tracking-wider mb-2 border border-emerald-100">
                  <Shield className="w-3 h-3" /> Nivel {user?.role || 'Usuario'}
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{user?.name || 'Usuario'}</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Colaborador en Quantic Systems</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5" /> ID: {user?.id?.substring(0, 8).toUpperCase() || 'QM-XXXX'}
                  </span>
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {user?.email || 'email@example.com'}
                  </span>
                </div>
              </div>

              <button className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all shadow-md">
                Ver Directorio
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Details */}
              <div className="admin-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Información General</h3>
                </div>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Nombre Completo</label>
                    <input type="text" defaultValue={user?.name} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Correo Electrónico</label>
                    <input type="email" defaultValue={user?.email} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Cargo / Rol</label>
                    <input type="text" readOnly value={user?.role} className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium outline-none cursor-not-allowed" />
                  </div>
                </div>
                <button className="w-full mt-8 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm">
                  Guardar Cambios
                </button>
              </div>

              {/* Security Details */}
              <div className="admin-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-4 bg-gray-900 rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Seguridad & Enlace</h3>
                </div>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Contraseña Actual</label>
                    <div className="relative">
                      <input type="password" value="••••••••" readOnly className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium outline-none italic" />
                      <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg border-dashed">
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                      Habilitar la autenticación de dos factores mejorará la seguridad de tu acceso operativo en un 80%.
                    </p>
                    <button className="mt-2 text-[10px] font-black text-emerald-600 flex items-center gap-1 hover:underline">
                      Activar 2FA <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
                <button className="w-full mt-8 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all shadow-sm">
                  Actualizar Seguridad
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="admin-card p-6 border-red-100 bg-red-50/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Acción de Desconexión</p>
                <h4 className="text-xs font-bold text-gray-900 mt-1">Cerrar Sesión Global</h4>
                <p className="text-[10px] text-gray-400 font-medium font-inter mt-0.5">Finaliza el acceso en todos los dispositivos activos.</p>
              </div>
              <button className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-bold transition-all px-4 py-2 bg-white border border-red-100 rounded-lg shadow-sm">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


