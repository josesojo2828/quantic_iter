'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layers, 
  Plus, 
  Search, 
  Sparkles, 
  Clock, 
  Users,
  Trophy,
  Layout,
  Globe,
  Lock,
  ArrowRight
} from 'lucide-react';

import { ProgramForm } from '../programs/components/ProgramForm';
import { AssignStudentModal } from '../programs/components/AssignStudentModal';
import { apiClient } from '@/core/api/api.client';
import { toast } from 'react-hot-toast';

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-templates' | 'marketplace'>('my-templates');
  const [templates, setTemplates] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{id: string, name: string} | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'my-templates') {
        const response = await apiClient.get<any[]>('/mentor/programs');
        setTemplates(Array.isArray(response) ? response.filter(p => p.isTemplate) : []);
      } else {
        const response = await apiClient.get<any[]>('/mentor/programs/marketplace');
        setTemplates(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateTemplate = async (data: any) => {
    try {
      const response = await apiClient.post<any>('/mentor/programs', { ...data, isTemplate: true });
      toast.success('Plantilla creada correctamente');
      setIsFormOpen(false);
      
      if (response && response.id) {
        router.push(`/dashboard/programs/${response.id}`);
      } else {
        fetchData();
      }
    } catch (error) {
      toast.error('Error al guardar la plantilla');
      throw error;
    }
  };

  const handleImport = async (templateId: string) => {
    try {
      setLoading(true);
      await apiClient.post(`/mentor/programs/${templateId}/clone`, {});
      toast.success('Plantilla importada correctamente a tu biblioteca');
      setActiveTab('my-templates');
    } catch (error) {
      toast.error('Error al importar la plantilla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 lg:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProgramForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleCreateTemplate}
        defaultIsTemplate={true}
      />

      {selectedTemplate && (
        <AssignStudentModal 
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
        />
      )}

      {/* Header Section */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <span className="text-[8.5px] font-black uppercase tracking-[0.25em] text-slate-400">Bóveda de Activos</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
            {activeTab === 'my-templates' ? 'Mis ' : 'Explorar '} 
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">{activeTab === 'my-templates' ? 'Plantillas' : 'Marketplace'}</span>
          </h1>
          <p className="text-slate-500 font-black mt-2 max-w-xl text-[9px] uppercase tracking-[0.25em] opacity-60 leading-relaxed italic">
            {activeTab === 'my-templates' 
              ? 'Diseña estructuras reutilizables para tus mentorías. Una vez lista, podrás asignarla a cualquier alumno en segundos.'
              : 'Descubre metodologías compartidas por otros mentores y la comunidad global de ITER.'}
          </p>
        </div>

        {activeTab === 'my-templates' && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[16px] text-[8.5px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-indigo-200 active:scale-95 border border-indigo-400/30 group italic"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            Nueva Plantilla
          </button>
        )}
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white/40 backdrop-blur-md border border-white rounded-[16px] w-fit shadow-inner">
        <button 
          onClick={() => setActiveTab('my-templates')}
          className={`px-6 py-2.5 rounded-[12px] text-[8.5px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'my-templates' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10' : 'text-slate-400 hover:text-slate-900'}`}
        >
          Mis Plantillas
        </button>
        <button 
          onClick={() => setActiveTab('marketplace')}
          className={`px-6 py-2.5 rounded-[12px] text-[8.5px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'marketplace' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10' : 'text-slate-400 hover:text-slate-900'}`}
        >
          Marketplace
        </button>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px] flex flex-col items-center justify-start relative">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-lg" />
            <p className="text-[8px] text-slate-400 font-black tracking-[0.3em] uppercase animate-pulse">Sincronizando Biblioteca...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="py-16 w-full text-center glass-card bg-white/40 backdrop-blur-md rounded-[24px] border border-white flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 rotate-12 shadow-inner">
               <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Bóveda Vacía</h3>
              <p className="text-[8.5px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-60 max-w-sm mx-auto">
                {activeTab === 'my-templates' 
                  ? 'Empieza creando tu primera estructura maestra para escalar tus mentorías.'
                  : 'El marketplace está siendo actualizado. Vuelve pronto para descubrir nuevas plantillas.'}
              </p>
            </div>
            {activeTab === 'my-templates' && (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-slate-900 text-white rounded-[16px] text-[8.5px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 italic"
              >
                Crear Mi Primera Plantilla
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="group glass-card bg-white/70 hover:bg-white border border-white rounded-[24px] p-5 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-700 flex flex-col relative overflow-hidden"
              >
                {/* Status Indicator Badge */}
                <div className="absolute top-4.5 right-4.5 z-20">
                  {template.isPublic ? (
                    <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[7px] font-black uppercase tracking-widest shadow-sm">
                      Público
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100 text-[7px] font-black uppercase tracking-widest">
                      Privado
                    </div>
                  )}
                </div>

                <div className="mb-4 flex-1 relative z-10">
                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner border border-white">
                     <Layout className="w-4.5 h-4.5" />
                   </div>
                   <h4 className="text-base font-black text-slate-900 uppercase tracking-tighter italic line-clamp-1 group-hover:text-indigo-600 transition-colors leading-none mb-2">
                    {template.name}
                   </h4>
                   <p className="text-[8.5px] text-slate-400 font-black uppercase tracking-[0.1em] line-clamp-2 leading-relaxed opacity-80 h-8">
                     {template.description || 'Sin descripción técnica del activo.'}
                   </p>
                </div>

                {/* Technical Indicators */}
                <div className="flex items-center gap-4 py-3 border-y border-slate-100/50 mb-4 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{template.duration || 'Flexible'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{template.phases?.length || 0} Fases</span>
                  </div>
                </div>

                {/* Tactical Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2 relative z-10">
                  <button 
                    onClick={() => router.push(`/dashboard/programs/${template.id}`)}
                    className="w-full sm:flex-1 py-3 bg-slate-50 text-slate-900 rounded-[12px] text-[8px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm italic"
                  >
                    {activeTab === 'marketplace' ? 'Detalles' : 'Diseño'}
                  </button>
                  {activeTab === 'marketplace' ? (
                    <button 
                      onClick={() => handleImport(template.id)}
                      className="w-full sm:flex-1 py-3 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[12px] text-[8px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xl shadow-indigo-100 border border-indigo-400/30 italic"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Importar
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setSelectedTemplate({ id: template.id, name: template.name });
                        setIsAssignModalOpen(true);
                      }}
                      className="w-full sm:flex-1 py-3 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[12px] text-[8px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xl shadow-indigo-100 border border-indigo-400/30 italic"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Asignar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
