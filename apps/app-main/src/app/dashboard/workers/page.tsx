'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Users, 
  PlusCircle, 
  Search, 
  Bell, 
  MoreVertical,
  Mail,
  Shield,
  Clock,
  UserPlus
} from 'lucide-react';
import { Sidebar } from '@/shared/components/Sidebar';
import { workersService, Worker } from '@/features/auth/services/workers.service';
import { InviteWorkerModal } from '@/features/auth/components/InviteWorkerModal';
import { Toaster } from 'react-hot-toast';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWorkers();
    
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!loading && tableRef.current) {
      gsap.from(tableRef.current.children, {
        y: 20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }, [loading]);

  const loadWorkers = async () => {
    try {
      const data = await workersService.getWorkers();
      setWorkers(data);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <main className="flex-1 ml-32 p-8">
        {/* Header */}
        <header ref={headerRef} className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-neutral uppercase tracking-tighter">
              Gestión de <span className="text-primary font-light">Equipo</span>
            </h1>
            <p className="text-xs text-neutral/40 font-bold uppercase tracking-[0.2em] mt-1">
              Administración de personal y roles • {workers.length} Miembros
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4" /> Invitar Miembro
            </button>
            <div className="w-12 h-12 bg-white border border-black/5 rounded-full p-1 shadow-sm">
              <div className="w-full h-full bg-neutral/10 rounded-full flex items-center justify-center font-black text-xs text-neutral/40">
                JS
              </div>
            </div>
          </div>
        </header>

        {/* Filters & Search */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral/30 w-4 h-4 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              className="w-full bg-white border border-black/5 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Workers List */}
        <div className="glass-card p-8">
          <div className="grid grid-cols-12 gap-4 pb-4 mb-4 border-b border-black/5 text-[10px] font-black uppercase tracking-widest text-neutral/30 px-4">
            <div className="col-span-5">Miembro</div>
            <div className="col-span-3">Rol / Nivel</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          <div ref={tableRef} className="space-y-3">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="animate-pulse flex items-center h-16 bg-neutral/5 rounded-2xl"></div>
              ))
            ) : workers.map((worker) => (
              <div key={worker.id} className="grid grid-cols-12 gap-4 p-4 bg-white border border-black/5 rounded-2xl items-center hover:border-primary/20 transition-all group hover:shadow-sm">
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    {worker.firstName[0]}{worker.lastName[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral">{worker.firstName} {worker.lastName}</h4>
                    <p className="text-[10px] text-neutral/40 font-medium flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {worker.email}
                    </p>
                  </div>
                </div>

                <div className="col-span-3 flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${worker.role === 'mechanic' ? 'bg-blue-500/5 text-blue-500' : 'bg-purple-500/5 text-purple-500'}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral">
                      {worker.role === 'mechanic' ? 'Mecánico' : 'Recepcionista'}
                    </p>
                    <p className="text-[8px] text-neutral/40 font-bold uppercase">Nivel Senior</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-wider">
                    <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                    Activo
                  </span>
                </div>

                <div className="col-span-2 text-right">
                  <button className="p-2 text-neutral/20 hover:text-neutral hover:bg-neutral/5 rounded-lg transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {!loading && workers.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-neutral/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-neutral/20 w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-neutral">Aún no hay equipo</h3>
                <p className="text-[10px] text-neutral/40 font-black uppercase mt-1">Comienza invitando a tu primer colaborador</p>
              </div>
            )}
          </div>
        </div>

        
        <InviteWorkerModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={loadWorkers} 
        />
        <Toaster position="bottom-right" />
      </main>
    </div>
  );
}

