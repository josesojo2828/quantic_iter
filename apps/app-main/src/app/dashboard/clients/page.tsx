'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/Sidebar';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Car, 
  Calendar, 
  MessageSquare,
  Loader2
} from 'lucide-react';
import { workersService } from '@/features/auth/services/workers.service';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // En Quantic, los clientes son usuarios con el rol 'client' vinculados al tenant.
        // Asumimos un endpoint que devuelva el staff filtrado o una vista de clientes específica.
        const response = await workersService.getWorkers({ role: 'client' });
        setClients(response.items || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar />
      
      <main className="flex-1 ml-32 p-10">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Cartera de Clientes</h1>
            <p className="text-sm text-gray-500 font-medium font-inter mt-1 italic">Base de datos centralizada de propietarios y vehículos.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o patente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input pl-10 w-64"
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-emerald-600 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehículos</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Última Visita</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{client.firstName} {client.lastName}</p>
                          <p className="text-xs text-gray-400">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-300" />
                        <span className="text-xs font-bold text-gray-600">Ver vinculados</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(client.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider">Activo</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center opacity-50 italic text-gray-400 text-sm">
                      No se encontraron clientes vinculados aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
