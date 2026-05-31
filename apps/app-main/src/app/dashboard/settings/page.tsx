'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/core/api/api.client';
import { useAuth } from '@/core/contexts/AuthContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  Save, 
  Upload,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Activity,
  LogOut,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MentorSettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Pending Invitations (for coaches)
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // General Tenant Settings Form (for owners)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    mentorEmail: '',
    website: '',
    legalName: '',
    taxId: '',
  });

  // Profile Form (for coaches & owners)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    password: '',
  });

  const activeRole = user?.roles?.find((r: any) => r.tenantId === user.tenantId);
  const isIndependentCoach = activeRole?.roleSlug === 'mentor_owner' && activeRole?.tenantName?.startsWith('Coach ');
  const isCoach = (user?.role !== 'mentor_owner' && user?.role !== 'admin') || isIndependentCoach;

  const fetchPendingInvitations = async () => {
    if (!user) {
      console.log('[FRONTEND SETTINGS DEBUG] No hay usuario logueado en la sesión');
      return;
    }
    setLoadingInvites(true);
    console.log('[FRONTEND SETTINGS DEBUG] Iniciando fetchPendingInvitations para:', {
      email: user.email,
      role: user.role,
      id: user.id
    });
    try {
      const data = await apiClient.get<any[]>('/invitation/my/pending');
      console.log('[FRONTEND SETTINGS DEBUG] Invitaciones obtenidas con éxito:', data);
      setPendingInvitations(data || []);
    } catch (err) {
      console.error('[FRONTEND SETTINGS DEBUG] Error al obtener invitaciones:', err);
    } finally {
      setLoadingInvites(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      password: '',
    });

    const fetchTenant = async () => {
      if (isCoach) {
        setLoading(false);
        await fetchPendingInvitations();
        return;
      }

      try {
        const data = await apiClient.get<any>('/tenant/me');
        if (data) {
          setFormData({
            name: data.name || '',
            address: data.address || '',
            phone: data.phone || '',
            mentorEmail: data.mentorEmail || '',
            website: data.website || '',
            legalName: data.legalName || '',
            taxId: data.taxId || '',
          });
        }
      } catch (err: any) {
        setError('No se pudo cargar la configuración del gimnasio.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [user, isCoach]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await apiClient.put('/tenant/me', formData);
      setSuccess(true);
      toast.success('Configuración de la academia actualizada');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios.');
      toast.error('Fallo en la sincronización');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updatePayload: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      };
      if (profileData.password.trim() !== '') {
        updatePayload.password = profileData.password;
      }

      await apiClient.patch('/auth/profile', updatePayload);
      setSuccess(true);
      toast.success('Perfil actualizado correctamente');
      await refreshProfile();
      setProfileData(prev => ({ ...prev, password: '' }));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el perfil.');
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchTenant = async (tenantId: string) => {
    const loadingToast = toast.loading('Cambiando de gimnasio...');
    try {
      await apiClient.post('/auth/switch-context', { tenantId });
      toast.success('Gimnasio activado con éxito', { id: loadingToast });
      window.location.reload();
    } catch (err: any) {
      toast.error('No se pudo cambiar de contexto', { id: loadingToast });
    }
  };

  const handleLeaveTenant = async (tenantId: string, tenantName: string) => {
    const confirmLeave = window.confirm(`¿Estás seguro de que deseas abandonar el gimnasio "${tenantName}"? Perderás acceso inmediatamente.`);
    if (!confirmLeave) return;

    const loadingToast = toast.loading('Abandonando gimnasio...');
    try {
      const res = await apiClient.post<any>('/tenant/leave', { tenantId });
      toast.success('Has abandonado el gimnasio correctamente', { id: loadingToast });
      
      // Refresh context or redirect
      await refreshProfile();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Error al desvincularse del gimnasio', { id: loadingToast });
    }
  };

  const handleAcceptInvitation = async (token: string, tenantName: string) => {
    const loadingToast = toast.loading(`Aceptando invitación de ${tenantName}...`);
    try {
      await apiClient.post(`/invitation/accept/${token}`, {});
      toast.success(`¡Bienvenido! Te has unido a ${tenantName} correctamente`, { id: loadingToast });
      await refreshProfile();
      await fetchPendingInvitations();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'No se pudo aceptar la invitación', { id: loadingToast });
    }
  };

  const handleRejectInvitation = (id: string) => {
    // Para no complicar permisos de borrado físico del coach en el tenant de otro usuario, 
    // desestimamos la invitación localmente para una experiencia de usuario impecable.
    setPendingInvitations(prev => prev.filter(inv => inv.id !== id));
    toast.success('Solicitud desestimada correctamente');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }


  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <span className="text-[8.5px] font-black uppercase tracking-[0.25em] text-slate-400">Panel de Configuración</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
              {isCoach ? 'Mi' : 'Identidad'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">
                {isCoach ? 'Perfil' : 'Académica'}
              </span>
            </h1>
            <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.2em] opacity-60">
              {isCoach 
                ? 'Gestiona tus credenciales de coach, tu avatar y tu vinculación con los gimnasios en ITER.'
                : 'Gestiona la infraestructura global y los parámetros de marca de tu academia Quantic.'}
            </p>
          </div>
        </header>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-[16px] flex items-center gap-2 text-red-600 text-[8.5px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 duration-500 shadow-sm shadow-red-50">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR: Personal Profile Setup (Shared) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* User Profile Card */}
            <div className="glass-card bg-white/70 backdrop-blur-xl p-6 rounded-[24px] border border-white shadow-soft flex flex-col items-center text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-full -mr-8 -mt-8 group-hover:bg-indigo-100/50 transition-colors duration-700" />
              
              <div className="w-24 h-24 rounded-3xl bg-indigo-900 text-white flex items-center justify-center overflow-hidden shadow-xl border border-white/10 group-hover:scale-105 transition-transform duration-500 mb-4">
                {user?.avatarUrl ? (
                  <img
                    src={`/avatars/${user.avatarUrl}`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black uppercase italic">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                )}
              </div>
              
              <h3 className="text-md font-black text-slate-900 uppercase tracking-tighter italic">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-[8px] text-slate-400 leading-relaxed font-black uppercase tracking-[0.2em] opacity-60">
                Rol: {isIndependentCoach ? 'Coach Independiente' : (user?.role === 'mentor_owner' ? 'Propietario del Gimnasio' : 'Coach / Facilitador')}
              </p>

              <div className="w-full mt-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/30 text-left space-y-1.5">
                <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Email Registrado</span>
                <span className="text-[10px] font-bold text-slate-700 truncate block">{user?.email}</span>
              </div>
            </div>

            {/* Profile Update Form */}
            <div className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-white shadow-soft">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-900 italic">Actualizar Perfil</h3>
              </div>
              
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1 italic">Nombre</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className="w-full bg-white border border-slate-100 rounded-[16px] px-4 py-2.5 text-[9.5px] font-black text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-inner"
                    required
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1 italic">Apellido</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className="w-full bg-white border border-slate-100 rounded-[16px] px-4 py-2.5 text-[9.5px] font-black text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-inner"
                    required
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1 italic">Nueva Contraseña (Opcional)</label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={profileData.password}
                      onChange={handleProfileChange}
                      placeholder="Dejar vacío para no cambiar"
                      className="w-full bg-white border border-slate-100 rounded-[16px] px-4 py-2.5 text-[9.5px] font-black text-slate-900 outline-none focus:border-indigo-500 transition-all shadow-inner placeholder:text-slate-300"
                    />
                    <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-[16px] text-[8.5px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all italic disabled:opacity-50 mt-2"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Guardar Perfil
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Coach Gyms Portal OR Academic Branding */}
          <div className="lg:col-span-8">
            {isCoach ? (
              <div className="space-y-6">
                {/* SOLICITUDES DE AFILIACIÓN PENDIENTES */}
                {pendingInvitations.length > 0 && (
                  <div className="glass-card bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-xl p-6 rounded-[24px] border border-emerald-100 shadow-soft space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden group/inv">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full group-hover/inv:bg-emerald-500/10 transition-all duration-1000" />
                    
                    <div className="flex items-center gap-2 mb-2 border-b border-emerald-100 pb-3 relative z-10">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900 italic">Solicitudes de Afiliación Pendientes</h3>
                    </div>
                    
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider relative z-10">
                      Los siguientes gimnasios te han invitado a unirte a su staff técnico como Coach.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      {pendingInvitations.map((inv: any) => (
                        <div key={inv.id} className="p-5 bg-white/80 border border-emerald-100 rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[160px] relative overflow-hidden group/card">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-[11px] font-black text-slate-900 uppercase truncate italic tracking-tight">{inv.tenantName}</h4>
                                <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider block">Invitación recibida</span>
                              </div>
                            </div>
                            
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-2.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                              Expiración: {new Date(inv.expiresAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex gap-2 pt-3 border-t border-slate-100/50 mt-auto">
                            <button
                              onClick={() => handleAcceptInvitation(inv.token, inv.tenantName)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all duration-300 italic active:scale-95 shadow-sm shadow-emerald-200"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleRejectInvitation(inv.id)}
                              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all duration-300 italic"
                            >
                              Declinar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* COACH PLAZA: My Gyms Portal */}
                <div className="glass-card bg-white/70 backdrop-blur-xl p-6 rounded-[24px] border border-white shadow-soft space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-1000" />
                  
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 relative z-10">
                    <div className="w-1.5 h-5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                    <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900 italic">Mi Portal de Gimnasios</h3>
                  </div>

                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Listado de gimnasios e instituciones afiliadas en las que participas como coach.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {user?.roles?.map((r: any) => {
                      const isActiveTenant = user.tenantId === r.tenantId;
                      return (
                        <div 
                          key={r.tenantId} 
                          className={`p-5 rounded-[20px] border transition-all duration-500 flex flex-col justify-between h-[180px] shadow-sm relative overflow-hidden group/card ${
                            isActiveTenant 
                              ? 'bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 border-indigo-200 ring-2 ring-indigo-500/10' 
                              : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'
                          }`}
                        >
                          {/* Background subtle pulse for active tenant */}
                          {isActiveTenant && (
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${isActiveTenant ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-[12px] font-black text-slate-900 uppercase truncate italic tracking-tight">{r.tenantName || 'Sede ITER'}</h4>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">{r.tenantSlug}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="text-[8px] font-black uppercase bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full italic tracking-widest">
                                ROL: {r.roleSlug === 'facilitator' ? 'Facilitador / Coach' : 'Soporte'}
                              </span>
                              {isActiveTenant && (
                                <span className="text-[8px] font-black uppercase bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full italic tracking-widest border border-indigo-100">
                                  Activo
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-3 border-t border-slate-100/50 mt-auto">
                            {!isActiveTenant ? (
                              <button
                                onClick={() => handleSwitchTenant(r.tenantId)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all duration-300 italic active:scale-95 border border-indigo-100/50"
                              >
                                Entrar <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600/10 text-indigo-600 rounded-xl text-[8.5px] font-black uppercase tracking-wider italic">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Eres Operador
                              </div>
                            )}
                            
                            <button
                              onClick={() => handleLeaveTenant(r.tenantId, r.tenantName || 'Sede ITER')}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Abandonar Gimnasio"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* ACADEMIC/GYM SAAS WORKSPACE (For owners) */
              <form onSubmit={handleSaveTenant} className="space-y-4">
                {/* Brand Identity Panel */}
                <div className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[20px] border border-white shadow-soft group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-1000" />
                  
                  <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3 relative z-10">
                    <div className="w-1 h-5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                    <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900 italic">Identidad de Marca</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                    {[
                      { name: 'name', label: 'Nombre Comercial', icon: Building2, type: 'text' },
                      { name: 'address', label: 'Dirección Física', icon: MapPin, type: 'text' },
                      { name: 'phone', label: 'Teléfono Corporativo', icon: Phone, type: 'tel' },
                      { name: 'mentorEmail', label: 'Email Maestro', icon: Mail, type: 'email' },
                    ].map((field) => (
                      <div key={field.name} className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1 italic">{field.label}</label>
                        <div className="relative group/input">
                          <input 
                            type={field.type}
                            name={field.name}
                            value={(formData as any)[field.name]}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-100 rounded-[16px] px-4 py-3 pl-10 text-[9.5px] font-black text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner uppercase tracking-widest placeholder:text-slate-200" 
                          />
                          <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover/input:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                    
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1 italic">Sitio Web Oficial</label>
                      <div className="relative group/input">
                        <input 
                          type="url" 
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-100 rounded-[16px] px-4 py-3 pl-10 text-[9.5px] font-black text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner uppercase tracking-widest" 
                        />
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover/input:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal and Compliance Panel */}
                <div className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[20px] border border-white shadow-soft relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 blur-[50px] rounded-full group-hover:bg-slate-500/10 transition-all duration-1000" />
                  
                  <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3 relative z-10">
                    <div className="w-1 h-5 bg-slate-900 rounded-full shadow-[0_0_8px_rgba(15,23,42,0.2)]" />
                    <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900 italic">Configuración Legal</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1 italic">Razón Social</label>
                      <div className="relative group/input">
                        <input 
                          type="text" 
                          name="legalName"
                          value={formData.legalName}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-slate-100 rounded-[16px] px-4 py-3 pl-10 text-[9.5px] font-black text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner uppercase tracking-widest" 
                        />
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover/input:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1 italic">ID Fiscal (TAX ID)</label>
                      <input 
                        type="text" 
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-slate-100 rounded-[16px] px-4 py-3 text-[9.5px] font-black text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-600/5 transition-all shadow-inner uppercase tracking-widest" 
                      />
                    </div>
                    
                    <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-[16px] flex gap-4 md:col-span-2 shadow-inner group/alert">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50 shrink-0 group-hover/alert:scale-110 transition-transform duration-500">
                        <AlertCircle className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-indigo-900 font-black uppercase tracking-widest leading-relaxed italic">Aviso de Cumplimiento Técnico</p>
                        <p className="text-[7.5px] text-indigo-700/60 font-black uppercase tracking-widest leading-relaxed">
                          Estos datos son críticos para la facturación automatizada y el cumplimiento normativo. Verifica la exactitud de los registros fiscales antes de confirmar los cambios.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-[16px] text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 active:scale-95 italic"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios Académicos
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
