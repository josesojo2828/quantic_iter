'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { 
  Map, 
  MapPin, 
  Phone, 
  Plus, 
  Edit2, 
  Trash2, 
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2
} from 'lucide-react';
import { Sidebar } from '@/shared/components/Sidebar';
import { branchesService, Branch } from '@/features/auth/services/branches.service';
import { BranchModal } from '@/features/auth/components/BranchModal';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@/core/contexts/AuthContext';

export default function BranchManagementPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBranches();
  }, []);

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

  const loadBranches = async () => {
    setLoading(true);
    try {
      const data = await branchesService.getBranches();
      setBranches(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar las sucursales');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleDelete = async (branch: Branch) => {
    if (!confirm(`¿Estás seguro de que querés eliminar la sucursal "${branch.name}"?`)) return;
    
    try {
      await branchesService.deleteBranch(branch.id);
      toast.success('Sucursal eliminada');
      loadBranches();
    } catch (error) {
      toast.error('Error al eliminar sucursal');
    }
  };

  const openCreateModal = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <main className="flex-1 ml-32 p-8">
        <Toaster />
        
        {/* Header */}
        <header ref={headerRef} className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-neutral uppercase tracking-tighter">
              Red de <span className="text-primary font-light">Sucursales</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md">ENTERPRISE</span>
              <p className="text-[10px] text-neutral/40 font-bold uppercase tracking-widest">
                Gestión Centralizada • {branches.length} Sedes Activas
              </p>
            </div>
          </div>

          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> 
            Nueva Sede
          </button>
        </header>

        {/* Toolbar */}
        <div className="glass-card mb-6 p-4 border border-black/[0.03] flex items-center justify-between bg-white/50 backdrop-blur-md overflow-hidden">
          <div className="relative group w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral/30 w-4 h-4 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar sede por nombre o dirección..." 
              className="w-full bg-neutral/5 border border-transparent rounded-2xl pl-12 pr-4 py-3 text-[11px] font-bold outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-neutral/20">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando Sedes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => (
              <div 
                key={branch.id} 
                className="glass-card p-6 border border-black/[0.03] hover:border-primary/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleEdit(branch)}
                    className="p-2 bg-white/80 backdrop-blur-md border border-black/5 rounded-xl text-neutral/40 hover:text-primary transition-colors shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(branch)}
                    className="p-2 bg-white/80 backdrop-blur-md border border-black/5 rounded-xl text-neutral/40 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-neutral uppercase tracking-tight group-hover:text-primary transition-colors">
                      {branch.name}
                    </h3>
                    <p className="text-[10px] text-neutral/40 font-bold uppercase tracking-widest mt-0.5">
                      Sede Operativa
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-neutral/60 leading-tight">
                      {branch.address || 'Sin dirección registrada'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-[11px] font-bold text-neutral/60">
                      {branch.phone || 'Sin teléfono'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-black/[0.03] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-neutral/40 uppercase tracking-widest">En Línea</span>
                  </div>
                  <button 
                    className="text-[9px] font-black text-primary uppercase tracking-widest hover:tracking-[0.2em] transition-all"
                    onClick={() => toast.success('Módulo de detalle de sede en desarrollo')}
                  >
                    Ver Dashboard Sede →
                  </button>
                </div>
              </div>
            ))}

            {filteredBranches.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-neutral/5 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-6">
                  <Map className="w-10 h-10 text-neutral/10" />
                </div>
                <h3 className="text-lg font-black text-neutral uppercase italic">Tu mapa está vacío...</h3>
                <p className="text-[10px] text-neutral/40 font-bold uppercase tracking-widest mt-2 max-w-[200px] mx-auto">
                  Expandí tu presencia creando tu primera sucursal.
                </p>
              </div>
            )}
          </div>
        )}

        <BranchModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadBranches}
          branchToEdit={selectedBranch}
        />
      </main>
    </div>
  );
}
