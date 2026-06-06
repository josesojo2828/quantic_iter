'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { 
  Package, 
  Plus, 
  Settings2, 
  Trash2, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Users, 
  Building2,
  DollarSign,
  Save,
  X
} from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    config: {
      maxUsers: 5,
      maxBranches: 1,
      maxMentees: 100,
      features: [] as string[]
    }
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este plan maestro?')) {
      try {
        await adminService.deletePlan(id);
        loadPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  const handleOpenModal = (plan: any = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        slug: plan.slug,
        description: plan.description || '',
        price: plan.price,
        config: {
          maxUsers: plan.config?.maxUsers || 0,
          maxBranches: plan.config?.maxBranches || 0,
          maxMentees: plan.config?.maxMentees || 0,
          features: plan.config?.features || []
        }
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: 0,
        config: { 
          maxUsers: 5, 
          maxBranches: 1, 
          maxMentees: 100, 
          features: ['inventory'] 
        }
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await adminService.updatePlan(editingPlan.id, formData);
      } else {
        await adminService.createPlan(formData);
      }
      setIsModalOpen(false);
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const toggleFeature = (feature: string) => {
    const features = [...(formData.config.features || [])];
    const index = features.indexOf(feature);
    if (index > -1) {
      features.splice(index, 1);
    } else {
      features.push(feature);
    }
    setFormData({ ...formData, config: { ...formData.config, features } });
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gradient tracking-tight mb-2">Gestión de Oferta</h1>
          <p className="text-sm text-white/40 max-w-lg font-medium">
            Define los planes de suscripción, límites de recursos y capacidades técnicas para las academias Quantic.
          </p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold uppercase tracking-widest border border-white/10 transition-all active:scale-95 shadow-xl shadow-black/10"
        >
          <Plus className="w-4 h-4 text-primary" />
          Nuevo Plan Maestro
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 bg-white/5 border border-white/5 rounded-[32px] animate-pulse"></div>
          ))
        ) : plans.map((plan) => (
          <div 
            key={plan.id}
            className="group relative aura-glass rounded-[40px] p-10 border border-white/5 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden"
          >
            {/* Plan Badge */}
            <div className="absolute top-10 right-10 flex items-center gap-2">
              <div className={`p-2.5 rounded-xl ${plan.price > 100 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                {plan.price > 100 ? <Zap className="w-5 h-5" /> : <Package className="w-5 h-5" />}
              </div>
            </div>

            <div className="relative z-10">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 block italic">Plan Suscripción</span>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-4">{plan.name}</h2>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">/ mes</span>
              </div>

              <div className="space-y-4 mb-10 pb-10 border-b border-white/5">
                <div className="flex items-center gap-3 text-xs font-bold text-white/70">
                  <Users className="w-4 h-4 text-primary animate-pulse" />
                  <span>Hasta {plan.config?.maxUsers || 0} Usuarios</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-white/70">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>{plan.config?.maxBranches || 0} Sucursal{plan.config?.maxBranches > 1 ? 'es' : ''}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-white/70">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="capitalize">{plan.config?.features?.length || 0} Módulos Activos</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenModal(plan)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all shadow-lg shadow-black/10"
                >
                  <Settings2 className="w-4 h-4 text-primary" />
                  Editar Plan
                </button>
                <button 
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/20 transition-all"
                  title="Eliminar Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Decorative BG Blur */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-all duration-700"></div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/85 animate-in fade-in duration-300">
          <div className="aura-glass w-full max-w-2xl rounded-[32px] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/5">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Configuración de Plan</h2>
                <p className="text-xs text-white/30 font-bold tracking-widest uppercase mt-1">Límites y Restricciones Técnicas</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 bg-white/5 rounded-2xl text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Nombre del Plan</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-white text-sm font-bold placeholder:text-white/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Ej: Plan Professional"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Slug Identificador</label>
                  <input 
                    type="text" 
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-white text-sm font-mono font-bold placeholder:text-white/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="plan_professional"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Precio Mensual ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-12 py-4 bg-white/5 rounded-2xl border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Límite Usuarios</label>
                  <div className="relative">
                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="number" 
                      value={formData.config.maxUsers}
                      onChange={(e) => setFormData({ ...formData, config: { ...formData.config, maxUsers: parseInt(e.target.value) } })}
                      className="w-full px-12 py-4 bg-white/5 rounded-2xl border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Límite Sucursales</label>
                  <div className="relative">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="number" 
                      value={formData.config.maxBranches}
                      onChange={(e) => setFormData({ ...formData, config: { ...formData.config, maxBranches: parseInt(e.target.value) } })}
                      className="w-full px-12 py-4 bg-white/5 rounded-2xl border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Límite Mentees</label>
                  <div className="relative">
                    <Package className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="number" 
                      value={formData.config.maxMentees}
                      onChange={(e) => setFormData({ ...formData, config: { ...formData.config, maxMentees: parseInt(e.target.value) } })}
                      className="w-full px-12 py-4 bg-white/5 rounded-2xl border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4 block mb-4">Módulos y Funcionalidades Maestro</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'inventory', label: 'Inventario' },
                    { id: 'accounting', label: 'Contabilidad' },
                    { id: 'reports', label: 'Reportes Avanzados' },
                    { id: 'multibranch', label: 'Multi-sucursal' },
                    { id: 'api_access', label: 'Acceso API' },
                    { id: 'custom_branding', label: 'White Label' },
                    { id: 'hr_management', label: 'Gestión RRHH' },
                    { id: 'marketing', label: 'Email Marketing' },
                    { id: 'mobile_app', label: 'App Mobile' },
                    { id: 'whatsapp_bot', label: 'Chatbot WhatsApp' },
                    { id: 'automations', label: 'Automatizaciones' },
                    { id: 'pos_system', label: 'Punto de Venta' },
                  ].map((feature) => (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => toggleFeature(feature.id)}
                      className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-tight border transition-all ${
                        (formData.config.features || []).includes(feature.id)
                          ? 'bg-primary/20 text-white border-primary shadow-[0_0_15px_rgba(0,210,255,0.15)]'
                          : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {feature.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-white/10 hover:bg-white/20 text-white rounded-3xl text-xs font-bold uppercase tracking-[0.2em] border border-white/10 transition-all shadow-2xl active:scale-95"
                >
                  <Save className="w-5 h-5 text-primary" />
                  {editingPlan ? 'Actualizar Definición' : 'Publicar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
