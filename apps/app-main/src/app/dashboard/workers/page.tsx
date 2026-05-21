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
  Loader2,
  Mail,
  UserCheck
} from 'lucide-react';
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
    <div className="w-full p-6 lg:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <header ref={headerRef} className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Administrative Console</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-700">Talento</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 max-w-2xl text-sm leading-relaxed">
            Panel administrativo central para el control de accesos, roles y permisos de tu equipo de alto rendimiento.
          </p>
        </div>

        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 group"
        >
          <UserPlus className="w-4 h-4 transition-transform group-hover:rotate-12" /> 
          Crear Usuario
        </button>
      </header>

      {/* Toolbar & Pagination */}
      <div className="glass-card bg-white/50 backdrop-blur-md rounded-3xl p-4 border border-white shadow-soft flex flex-col xl:flex-row items-center justify-between gap-4 overflow-hidden">
        <div className="relative group w-full max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..." 
            className="w-full bg-white/50 border border-transparent rounded-[20px] pl-14 pr-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 transition-all text-slate-900 placeholder:text-slate-300"
          />
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto justify-between px-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Página {page} / {Math.ceil(total / 10) || 1}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={page * 10 >= total || loading}
              onClick={() => setPage(p => p + 1)}
              className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-soft overflow-hidden group">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 backdrop-blur-md">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Colaborador</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rol Asignado</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                <th className="px-10 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody ref={tableRef} className="divide-y divide-slate-100/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-10 py-8"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-indigo-50/30 transition-all duration-300 group/row">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center group-hover/row:scale-110 transition-transform shadow-sm text-indigo-500 font-black text-xs uppercase">
                        {worker.firstName[0]}{worker.lastName[0]}
                      </div>
                      <div>
                        <h4 
                          onClick={() => router.push(`/dashboard/workers/${worker.id}`)}
                          className="text-sm font-black text-slate-900 uppercase tracking-tight cursor-pointer hover:text-indigo-600 transition-colors"
                        >
                          {worker.firstName} {worker.lastName}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{worker.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        worker.role === 'mentor_owner' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        worker.role === 'facilitator' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
                      }`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic">
                        {(worker.role === 'mentor_owner' || (worker.role as any)?.slug === 'mentor_owner') ? 'Owner / Admin' : 
                         (worker.role === 'facilitator' || (worker.role as any)?.slug === 'facilitator') ? 'Facilitador' : 
                         'Administración'}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm">Activo</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all">
                      <button onClick={() => handleEdit(worker)} disabled={!canUpdate} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={() => handleDelete(worker)} disabled={!canDelete || worker.email === currentUser?.email} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {workers.length === 0 && !loading && (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Users className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase italic">Sin resultados</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 max-w-[240px] mx-auto">
                No encontramos colaboradores que coincidan con tu búsqueda estratégica.
              </p>
              <button 
                 onClick={() => setSearch('')}
                 className="mt-8 text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] hover:tracking-[0.4em] transition-all"
              >
                Resetear Búsqueda
              </button>
            </div>
          )}
      </div>

      <InviteWorkerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadWorkers} 
        workerToEdit={selectedWorker}
      />
    </div>
  );
}
