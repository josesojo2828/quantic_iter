'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { 
  Users, 
  Search, 
  Shield, 
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Loader2,
  Mail,
  UserCheck
} from 'lucide-react';
import { Sidebar } from '@/shared/components/Sidebar';
import { workersService, Worker } from '@/features/auth/services/workers.service';
import { InviteWorkerModal } from '@/features/auth/components/InviteWorkerModal';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@/core/contexts/AuthContext';


export default function WorkersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const canUpdate = currentUser?.permissions.includes('staff:update');
  const canDelete = currentUser?.permissions.includes('staff:delete');

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWorkers();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, page, currentUser]);


  useEffect(() => {
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

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const data = await workersService.getWorkers({ search, page, limit: 10 });
      
      // Filtramos para que el usuario actual (el dueño) no se vea a sí mismo en la lista administrativa
      const filteredWorkers = data.items.filter((w: any) => w.id !== currentUser?.id);
      
      setWorkers(filteredWorkers);
      setTotal(data.total);

    } catch (error) {
      toast.error('Error al cargar el equipo');
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  const handleDelete = async (worker: Worker) => {
    if (!confirm(`¿Estás seguro de que querés dar de baja a ${worker.firstName}?`)) return;
    
    try {
      await workersService.deleteWorker(worker.id);
      toast.success('Colaborador desactivado');
      loadWorkers();
    } catch (error) {
      toast.error('Error al desactivar colaborador');
    }
  };

  const openCreateModal = () => {
    setSelectedWorker(null);
    setIsModalOpen(true);
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
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md">ADMIN</span>
              <p className="text-[10px] text-neutral/40 font-bold uppercase tracking-widest">
                Panel Administrativo • {total} Colaboradores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 group"
            >
              <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
              Crear Usuario
            </button>
          </div>
        </header>

        {/* Dynamic Table Section */}
        <div className="glass-card overflow-hidden flex flex-col border border-black/[0.03]">
          {/* Table Toolbar */}
          <div className="p-6 border-b border-black/[0.03] flex items-center justify-between bg-white/50 backdrop-blur-md">
            <div className="relative group w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral/30 w-4 h-4 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o email..." 
                className="w-full bg-neutral/5 border border-transparent rounded-2xl pl-12 pr-4 py-3 text-[11px] font-bold outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-neutral/20 uppercase tracking-widest mr-2">
                Página {page} de {Math.ceil(total / 10) || 1}
              </span>
              <div className="flex gap-1">
                <button 
                  disabled={page === 1 || loading}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 bg-white border border-black/5 rounded-xl text-neutral hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  disabled={page * 10 >= total || loading}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 bg-white border border-black/5 rounded-xl text-neutral hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral/[0.02] text-[10px] font-black uppercase tracking-widest text-neutral/40 border-b border-black/[0.03]">
                  <th className="px-8 py-5">Colaborador</th>
                  <th className="px-8 py-5">Rol / Sistema</th>
                  <th className="px-8 py-5">Estado</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody ref={tableRef}>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-black/[0.02]">
                      <td colSpan={4} className="px-8 py-8"><div className="h-8 bg-neutral/5 rounded-xl w-full"></div></td>
                    </tr>
                  ))
                ) : workers.map((worker) => (
                  <tr key={worker.id} className="group border-b border-black/[0.02] hover:bg-primary/[0.01] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-primary font-black text-xs shadow-sm group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                          <span className="relative z-10">{worker.firstName[0]}{worker.lastName[0]}</span>
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <h4 
                            onClick={() => router.push(`/dashboard/workers/${worker.id}`)}
                            className="text-xs font-black text-neutral uppercase tracking-tight flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                          >
                            {worker.firstName} {worker.lastName}
                            {worker.email === currentUser?.email && (
                              <span className="bg-neutral/10 text-neutral/40 text-[7px] px-1.5 py-0.5 rounded uppercase">Eres tú</span>
                            )}
                          </h4>
                          <p className="text-[10px] text-neutral/40 font-bold flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3" /> {worker.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          worker.role === 'workshop_owner' ? 'bg-amber-500/10 text-amber-500' :
                          worker.role === 'mechanic' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                        }`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-wider block">
                              {(worker.role === 'workshop_owner' || (worker.role as any)?.slug === 'workshop_owner') ? '👑 Dueño / Admin' : 
                               (worker.role === 'mechanic' || (worker.role as any)?.slug === 'mechanic') ? '🛠️ Técnico Taller' : 
                               '📁 Gestión / Recepción'}
                            </span>
                            <span className="text-[9px] text-neutral/40 uppercase tracking-tighter block mt-0.5">
                              Workshop App V1.0
                            </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                          <UserCheck className="w-3 h-3" />
                          Activo
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(worker)}
                          disabled={!canUpdate}
                          className="p-2 text-neutral/30 hover:text-primary hover:bg-primary/10 rounded-xl transition-all disabled:opacity-10"
                          title="Editar Perfil"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(worker)}
                          disabled={!canDelete || worker.email === currentUser?.email}
                          className="p-2 text-neutral/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-10"
                          title="Dar de baja"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-black/5 mx-1" />
                        <button 
                          onClick={() => router.push(`/dashboard/workers/${worker.id}`)}
                          className="p-2 text-neutral/30 hover:text-neutral hover:bg-neutral/5 rounded-xl transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {workers.length === 0 && !loading && (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-neutral/5 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-6">
                  <Users className="w-10 h-10 text-neutral/10" />
                </div>
                <h3 className="text-lg font-black text-neutral uppercase italic">Silencio en el taller...</h3>
                <p className="text-[10px] text-neutral/40 font-bold uppercase tracking-widest mt-2 max-w-[200px] mx-auto">
                  No encontramos colaboradores que coincidan con tu búsqueda.
                </p>
                <button 
                   onClick={() => setSearch('')}
                   className="mt-6 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all"
                >
                  Ver todo el equipo
                </button>
              </div>
            )}
          </div>
        </div>

        <InviteWorkerModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={loadWorkers} 
          workerToEdit={selectedWorker}
        />
      </main>
    </div>
  );
}



