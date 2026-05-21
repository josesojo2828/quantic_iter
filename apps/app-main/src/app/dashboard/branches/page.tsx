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
  Loader2,
  LayoutGrid,
  List,
  X
} from 'lucide-react';
import { Sidebar } from '@/shared/components/Sidebar';
import { branchesService, Branch } from '@/features/auth/services/branches.service';
import { BranchModal } from '@/features/auth/components/BranchModal';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@/core/contexts/AuthContext';

export default function BranchManagementPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProfile, setSelectedProfile] = useState<Branch | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    if (selectedProfile && drawerRef.current) {
      gsap.fromTo(drawerRef.current,
        { x: '100%', opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power4.out', clearProps: 'transform' }
      );
    }
  }, [selectedProfile]);

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

  const branchList = Array.isArray(branches) ? branches : (branches as any)?.items || [];

  const filteredBranches = branchList.filter((b: Branch) => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full p-6 lg:p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster />
      
      {/* Header */}
      <header ref={headerRef} className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enterprise Grid</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Red de <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-indigo-700">Sucursales</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 max-w-2xl text-sm leading-relaxed">
            Administra tu expansión territorial. Gestiona sedes operativas y monitorea el rendimiento regional.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={openCreateModal}
            className="flex-1 xl:flex-none flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> 
            Nueva Sede
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="glass-card bg-white/50 backdrop-blur-md rounded-3xl p-4 border border-white shadow-soft flex items-center justify-between overflow-hidden">
        <div className="relative group w-full max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar sede por nombre o dirección..." 
            className="w-full bg-white/50 border border-transparent rounded-[20px] pl-14 pr-6 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-indigo-600/20 focus:ring-4 focus:ring-indigo-600/5 transition-all text-slate-900 placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-300">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando Sedes...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBranches.map((branch: Branch) => (
                <div 
                  key={branch.id} 
                  className="glass-card bg-white/70 backdrop-blur-xl p-8 rounded-[32px] border border-white shadow-soft hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 p-5 flex gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all z-10 duration-500">
                    <button 
                      onClick={() => handleEdit(branch)}
                      className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(branch)}
                      className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[20px] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform duration-500">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                        {branch.name}
                      </h3>
                      <span className="text-[10px] text-blue-600/60 font-black uppercase tracking-widest italic">Sede Operativa</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-black text-slate-600 uppercase leading-tight tracking-tight">
                        {branch.address || 'Ubicación no registrada'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                      <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                        {branch.phone || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Activo</span>
                    </div>
                    <button 
                      className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:gap-4 transition-all"
                      onClick={() => setSelectedProfile(branch)}
                    >
                      Dashboard <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-soft overflow-hidden group">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 backdrop-blur-md">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sucursal</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dirección Operativa</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contacto</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Estado</th>
                    <th className="px-10 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredBranches.map((branch: Branch) => (
                    <tr key={branch.id} className="hover:bg-blue-50/30 transition-all duration-300 group/row">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center group-hover/row:scale-110 transition-transform shadow-sm text-blue-500">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{branch.name}</p>
                            <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest">Sede Central</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-[11px] text-slate-600 font-black uppercase tracking-tight leading-relaxed max-w-xs">{branch.address || '—'}</p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-[11px] text-slate-600 font-black uppercase tracking-widest">{branch.phone || '—'}</p>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm italic">Operativa</span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all">
                          <button onClick={() => handleEdit(branch)} className="p-2.5 text-slate-400 hover:text-blue-600">
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button onClick={() => handleDelete(branch)} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredBranches.length === 0 && (
            <div className="py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-6 border border-slate-100 shadow-inner">
                <Map className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase italic">Tu mapa está vacío...</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-[200px] mx-auto italic">
                Expandí tu presencia creando tu primera sucursal.
              </p>
            </div>
          )}
        </>
      )}

      <BranchModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadBranches}
        branchToEdit={selectedBranch}
      />

      {/* Slide-over Profile Drawer - High Contrast Dark Variant */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[110] flex justify-end overflow-hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelectedProfile(null)}></div>
          <div ref={drawerRef} className="relative w-full max-w-md bg-[#09090b] h-full shadow-[0_0_100px_rgba(0,0,0,0.5)] border-l border-white/5 flex flex-col text-slate-100 z-50">
            <div className="p-8 border-b border-white/5 flex items-start justify-between bg-white/5">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
                  <Building2 className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{selectedProfile.name}</h2>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] italic mt-1">Sede Operativa</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedProfile(null)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl shadow-sm border border-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-2">Ingresos Mensuales</p>
                  <p className="text-3xl font-black text-white italic">$12.4k</p>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mb-2">Retención</p>
                  <p className="text-3xl font-black text-blue-400 italic">89%</p>
                </div>
              </div>

              <div>
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mb-4">Información Operativa</h3>
                 <div className="space-y-4">
                   <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700">
                     <MapPin className="w-4 h-4 text-blue-400" />
                     <span className="text-xs font-bold text-slate-300">{selectedProfile.address || 'No definida'}</span>
                   </div>
                   <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700">
                     <Phone className="w-4 h-4 text-blue-400" />
                     <span className="text-xs font-bold text-slate-300">{selectedProfile.phone || 'No definido'}</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
