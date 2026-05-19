'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/core/api/api.client';
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
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MentorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    mentorEmail: '',
    website: '',
    legalName: '',
    taxId: '',
  });

  useEffect(() => {
    const fetchTenant = async () => {
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
        setError('No se pudo cargar la configuración del mentoría.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await apiClient.put('/tenant/me', formData);
      setSuccess(true);
      toast.success('Configuración actualizada');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios.');
      toast.error('Fallo en la sincronización');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <form onSubmit={handleSave} className="max-w-[1400px] mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <span className="text-[8.5px] font-black uppercase tracking-[0.25em] text-slate-400">Panel de Configuración</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
              Identidad <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">Académica</span>
            </h1>
            <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.2em] opacity-60">
              Gestiona la infraestructura global y los parámetros de marca de tu ecosistema Quantic.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            {success && (
              <div className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in zoom-in-95 duration-500">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest italic">Sincronizado</span>
              </div>
            )}
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-5 py-3 bg-slate-900 text-white rounded-[16px] text-[8.5px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 border border-white/10 group italic disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              )}
              {isSaving ? 'Sincronizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </header>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-[16px] flex items-center gap-2 text-red-600 text-[8.5px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 duration-500 shadow-sm shadow-red-50">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar: Media & Operational Status */}
          <div className="lg:col-span-4 space-y-4">
            {/* Logo Section */}
            <div className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[20px] border border-white shadow-soft flex flex-col items-center text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-full -mr-8 -mt-8 group-hover:bg-indigo-100/50 transition-colors duration-700" />
              
              <div className="w-32 h-32 bg-white rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group-hover:border-indigo-500 group-hover:bg-indigo-50/30 transition-all cursor-pointer relative overflow-hidden shadow-inner group/upload">
                <Upload className="w-8 h-8 text-slate-200 group-hover/upload:text-indigo-600 group-hover/upload:scale-110 transition-all duration-500 mb-2" />
                <span className="text-[7.5px] font-black text-slate-300 uppercase tracking-widest group-hover/upload:text-indigo-700 transition-colors">Subir Logo Académico</span>
                <div className="absolute inset-0 bg-indigo-600/0 group-hover/upload:bg-indigo-600/5 transition-all duration-500" />
              </div>
              
              <h3 className="mt-4 text-sm font-black text-slate-900 uppercase tracking-tighter italic">Identidad Visual</h3>
              <p className="text-[8px] text-slate-400 mt-1.5 leading-relaxed font-black uppercase tracking-[0.2em] opacity-60">SVG, PNG o JPG (Máx 2MB)</p>
            </div>

            {/* Status Section */}
            <div className="glass-card bg-white/70 backdrop-blur-xl p-5 rounded-[20px] border border-white shadow-soft group">
              <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
                <div className="w-1 h-5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-900 italic">Estatus de Operación</h3>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer group p-3 hover:bg-white rounded-[16px] transition-all border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors italic">Directorio Público</span>
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">Visibilidad en Aura Marketplace</span>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                  </div>
                </label>
                
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-[16px] shadow-inner group/status">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8.5px] font-black text-emerald-700 uppercase tracking-widest italic">Servicio</span>
                    <span className="text-[7px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Sincronizado</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm border border-emerald-100 group-hover/status:scale-105 transition-transform duration-500">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest italic leading-none">Operativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form: Brand & Legal */}
          <div className="lg:col-span-8 space-y-4">
            {/* Identity Panel */}
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

            {/* Legal Panel */}
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
          </div>
        </div>
      </form>
    </div>
  );
}
