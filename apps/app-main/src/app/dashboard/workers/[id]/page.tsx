'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import {
  ChevronLeft,
  Mail,
  Calendar,
  Shield,
  Trash2,
  Edit2,
  Zap,
  UserCheck,
  Lock,
  Users
} from 'lucide-react';
import { Sidebar } from '@/shared/components/Sidebar';
import { workersService, Worker } from '@/features/auth/services/workers.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { InviteWorkerModal } from '@/features/auth/components/InviteWorkerModal';

export default function WorkerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const loadWorker = async () => {
    try {
      const data = await workersService.getWorkerById(id as string);
      setWorker(data);
    } catch (error) {
      toast.error('Error al cargar datos del trabajador');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        await loadWorker();
        
        // Initial animation
        const ctx = gsap.context(() => {
          gsap.from('.reveal', {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power4.out',
            delay: 0.2
          });

          gsap.from('.stat-card', {
            scale: 0.8,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'elastic.out(1, 0.75)',
            delay: 0.5
          });
        }, containerRef);

        return () => ctx.revert();
      } catch (error) {
        toast.error('No se pudo encontrar al colaborador');
        router.push('/dashboard/workers');
      }
    };

    initData();
  }, [id, router]);

if (loading) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

if (!worker) return null;

// Real data calculations
const daysInTeam = worker.createdAt
  ? Math.floor((new Date().getTime() - new Date(worker.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  : 0;

const permissions = typeof worker.role === 'object' ? worker.role.permissions : [];
const roleSlug = typeof worker.role === 'object' ? worker.role.slug : worker.role;

return (
  <div className="flex min-h-screen bg-[#f8fafc]" ref={containerRef}>
    <Sidebar />

    <main className="flex-1 ml-32 p-8 lg:p-12 max-w-6xl">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between mb-10 reveal">
        <button
          onClick={() => router.push('/dashboard/workers')}
          className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-neutral/30 hover:text-primary transition-all"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al Equipo
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-white border border-black/5 text-neutral text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral hover:text-white transition-all shadow-sm active:scale-95"
          >
            <Edit2 className="w-3.5 h-3.5" /> Editar
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95">
            <Trash2 className="w-3.5 h-3.5" /> Desactivar
          </button>
        </div>
      </div>

      {/* Compact Hero Section */}
      <div className="mb-12 reveal" ref={headerRef}>
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl font-black text-primary border border-white">
            {worker.firstName[0]}{worker.lastName[0]}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/10`}>
                <Shield className="w-3 h-3 inline-block mr-1.5 -translate-y-0.5" />
                {roleSlug === 'workshop_owner' ? 'Owner / Admin' : 'Technician'}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/5 text-green-600 border border-green-500/10 rounded-lg text-[9px] font-black uppercase tracking-widest">
                <UserCheck className="w-3 h-3" />
                Activo
              </span>
            </div>
            <h1 className="text-3xl font-black text-neutral uppercase tracking-tighter leading-none mb-1">
              {worker.firstName} <span className="text-primary font-light">{worker.lastName}</span>
            </h1>
            <p className="text-[11px] text-neutral/40 font-bold uppercase tracking-widest">
              {worker.email}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Info - Dashboard Style */}
      <div className="reveal">
        <div className="glass-card p-10">
          <div className="flex items-center justify-between mb-10 border-b border-black/5 pb-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/30" />
              Información del Colaborador
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em] block mb-2">Identidad</label>
                <div className="text-xl font-black text-neutral uppercase tracking-tight bg-black/[0.01] p-5 rounded-xl border border-black/5">
                  {worker.firstName} {worker.lastName}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em] block mb-2">Credencial</label>
                <div className="text-base font-bold text-neutral flex items-center gap-3 bg-primary/5 p-5 rounded-xl border border-primary/5">
                  <Mail className="w-4 h-4 text-primary" />
                  {worker.email}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
                  <label className="text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em] block mb-2">Alta</label>
                  <div className="text-[13px] font-black text-neutral flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {worker.createdAt ? format(new Date(worker.createdAt), "dd MMM, yyyy", { locale: es }) : 'N/A'}
                  </div>
                </div>

                <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
                  <label className="text-[10px] font-black text-neutral/30 uppercase tracking-[0.2em] block mb-2">Rango</label>
                  <div className="text-[13px] font-black text-neutral flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    {roleSlug === 'workshop_owner' ? 'Administrator' : 'Specialist'}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-neutral rounded-3xl shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-6 flex items-center gap-3">
                    <Zap className="w-3.5 h-3.5 text-primary" /> Permisos de Sistema
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {permissions.length > 0 ? (
                      permissions.map(p => {
                        const [resource, action] = p.action.split(':');
                        const resourceMap: Record<string, string> = {
                          'staff': 'Equipo',
                          'inventory': 'Inventario',
                          'orders': 'Órdenes',
                          'workshop': 'Taller',
                          'clients': 'Clientes',
                          'billing': 'Facturación'
                        };
                        const actionMap: Record<string, string> = {
                          'READ': 'Lectura',
                          'CREATE': 'Creación',
                          'UPDATE': 'Edición',
                          'DELETE': 'Baja',
                          'MANAGE': 'Gestión Total',
                          'EXPORT': 'Exportación'
                        };
                        const label = `${resourceMap[resource] || resource} • ${actionMap[action] || action}`;
                        return (
                          <span key={p.action} className="px-3.5 py-1.5 bg-white/10 border border-white/5 text-white text-[9px] font-black uppercase rounded-lg hover:bg-white hover:text-neutral transition-all">
                            {label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-white/20 italic">Sin permisos.</span>
                    )}
                  </div>
                </div>
                <Lock className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <InviteWorkerModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      onSuccess={loadWorker} 
      workerToEdit={worker}
    />
  </div>
);
}
