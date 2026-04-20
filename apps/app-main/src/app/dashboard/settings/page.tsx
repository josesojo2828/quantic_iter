'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
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
  Loader2
} from 'lucide-react';

export default function WorkshopSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    workshopEmail: '',
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
            workshopEmail: data.workshopEmail || '',
            website: data.website || '',
            legalName: data.legalName || '',
            taxId: data.taxId || '',
          });
        }
      } catch (err: any) {
        setError('No se pudo cargar la configuración del taller.');
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
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-10 ml-32">
        <form onSubmit={handleSave} className="max-w-5xl mx-auto">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Configuración del Taller</h1>
              <p className="text-sm text-gray-500 font-medium font-inter mt-1 italic">Gestiona la identidad corporativa y los datos legales de la organización.</p>
            </div>
            <div className="flex items-center gap-4">
              {success && (
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded border border-emerald-100">
                  Cambios Guardados
                </span>
              )}
              <button 
                type="submit"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold uppercase tracking-tight">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Column: Logo & Visibility */}
            <div className="lg:col-span-1 space-y-8">
              <div className="admin-card p-6 flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center group hover:border-emerald-500 transition-all cursor-pointer relative overflow-hidden">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-500 mb-2" />
                  <span className="text-[10px] font-black text-gray-400 uppercase group-hover:text-emerald-600">Subir Logo</span>
                </div>
                <h3 className="mt-6 text-sm font-bold text-gray-900">Logo Corporativo</h3>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">Formatos: SVG, PNG o JPG.<br/>Máx: 2MB (Recomendado: 512x512px)</p>
              </div>

              <div className="admin-card p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
                   Visibilidad Pública
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Visible en Directorio</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Estado Operativo</span>
                    <div className="flex gap-2">
                       <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded border border-emerald-100 uppercase">Abierto</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Identity Section */}
              <div className="admin-card p-8">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Identidad de Marca</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Nombre Comercial</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-11 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                      />
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Dirección Física</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-11 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                      />
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Teléfono Corporativo</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-11 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Email de Contacto</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        name="workshopEmail"
                        value={formData.workshopEmail}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-11 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Sitio Web Oficial</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-11 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                      />
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Section */}
              <div className="admin-card p-8">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                  <div className="w-1.5 h-4 bg-gray-900 rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Información Legal & Fiscal</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Razón Social</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="legalName"
                        value={formData.legalName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-11 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                      />
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter ml-1">Identificación Fiscal (RUT/CUIT)</label>
                    <input 
                      type="text" 
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                    />
                  </div>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex gap-3 md:col-span-2">
                    <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-[10px] text-emerald-700 font-medium leading-relaxed italic">
                      Estos datos se utilizarán para la generación de facturas y reportes legales dirigidos a tus clientes finales. Asegúrate de que sean exactos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

