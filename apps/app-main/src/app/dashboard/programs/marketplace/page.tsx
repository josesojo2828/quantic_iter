'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Search, 
  Layers, 
  Trophy, 
  Sparkles,
  Clock,
  Users,
  Copy,
  ArrowLeft,
  Filter
} from 'lucide-react';

import { apiClient } from '@/core/api/api.client';
import { toast } from 'react-hot-toast';

export default function MarketplacePage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMarketplace = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any[]>('/mentor/programs/marketplace');
      setPrograms(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error('Error al cargar el marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const handleClone = async (id: string) => {
    try {
      toast.loading('Importando plantilla...', { id: 'cloning' });
      await apiClient.post(`/mentor/programs/${id}/clone`, {});
      toast.success('¡Plantilla importada con éxito!', { id: 'cloning' });
      router.push('/dashboard/programs');
    } catch (error) {
      toast.error('Error al importar la plantilla', { id: 'cloning' });
    }
  };

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button 
            onClick={() => router.push('/dashboard/programs')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-4 transition-colors group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Volver a mis programas
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Ecosistema</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Plantillas <span className="text-emerald-600">Públicas</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 max-w-2xl text-sm md:text-base leading-relaxed">
            Descubrí y utilizá metodologías probadas por otros coaches de la comunidad. 
            Importá estructuras de hábitos, rutinas y cursos con un solo click.
          </p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text"
            placeholder="Buscar metodologías..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none w-full md:w-80 shadow-sm"
          />
        </div>
      </div>

      {/* Categories / Filters Placeholder */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        {['Todos', 'Fitness', 'Negocios', 'Mindset', 'Productividad', 'Hábitos'].map((cat) => (
          <button 
            key={cat}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              cat === 'Todos' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando Marketplace...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-[40px] border border-white/60 p-20 shadow-sm flex flex-col items-center text-center">
          <Search className="w-16 h-16 text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No encontramos plantillas</h3>
          <p className="text-slate-500 text-sm font-medium">Probá con otros términos de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((program) => (
            <div 
              key={program.id} 
              className="bg-white/80 backdrop-blur-sm border border-white p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden flex flex-col"
            >
              {/* Type Badge */}
              <div className="absolute top-6 right-6">
                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                  {program.type || 'CURRICULUM'}
                </div>
              </div>

              <div className="mb-6 flex-1">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                   {program.type === 'HABITS' ? <Clock className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                 </div>
                 <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight line-clamp-1">{program.name}</h4>
                 <p className="text-slate-500 text-xs font-medium mt-2 line-clamp-3 leading-relaxed">
                   {program.description}
                 </p>
              </div>

              <div className="flex items-center gap-4 py-4 border-y border-slate-50 mb-6">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600">{program.phases?.length || 0} Fases</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600">Recompensas XP</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-200 rounded-full" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Coach Expert</span>
                </div>
                <button 
                  onClick={() => handleClone(program.id)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Importar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Motivation Footer */}
      <div className="p-10 bg-slate-900 rounded-[40px] text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
        
        <h2 className="text-2xl font-black text-white uppercase tracking-tight relative z-10">¿Tu metodología es la mejor?</h2>
        <p className="text-slate-400 text-sm font-medium max-w-xl mx-auto relative z-10">
          Hacé que tus plantillas sean públicas al crearlas para ayudar a otros coaches y posicionarte como referente en el ecosistema Quantic.
        </p>
        <button 
          onClick={() => router.push('/dashboard/programs')}
          className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-400 transition-all active:scale-95 relative z-10"
        >
          Ir a mis plantillas
        </button>
      </div>
    </div>
  );
}
