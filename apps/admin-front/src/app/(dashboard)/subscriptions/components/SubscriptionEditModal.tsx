'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin.service';
import { X, Calendar, UserPlus, Building, CreditCard, Loader2 } from 'lucide-react';

interface SubscriptionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any;
  onSuccess: () => void;
}

export const SubscriptionEditModal: React.FC<SubscriptionEditModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [planId, setPlanId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [expiresAt, setExpiresAt] = useState('');
  const [extraUsers, setExtraUsers] = useState(0);
  const [extraBranches, setExtraBranches] = useState(0);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
      if (subscription) {
        setPlanId(subscription.plan?.id || '');
        setStatus(subscription.status || 'ACTIVE');
        if (subscription.expiresAt) {
          const dateStr = new Date(subscription.expiresAt).toISOString().split('T')[0];
          setExpiresAt(dateStr);
        }
        const custom = subscription.customConfig || {};
        setExtraUsers(custom.extraUsers || 0);
        setExtraBranches(custom.extraBranches || 0);
      }
      setError(null);
    }
  }, [isOpen, subscription]);

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const plansList = await adminService.getPlans();
      setPlans(plansList);
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('No se pudieron cargar los planes de suscripción.');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await adminService.updateTenantSubscription(subscription.tenantId, {
        planId,
        status,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        customConfig: {
          extraUsers: Number(extraUsers),
          extraBranches: Number(extraBranches),
        },
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating subscription:', err);
      setError(err?.response?.data?.message || 'Error al guardar los cambios de la suscripción.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="aura-glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Editar Suscripción</h3>
            <p className="text-xs text-white/30 uppercase tracking-widest font-black mt-1">
              Instancia: {subscription?.tenant?.name || subscription?.tenantId}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-white/30 hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            {/* Plan Selector */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                Plan de Suscripción
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                  disabled={loadingPlans || saving}
                >
                  <option value="" disabled className="bg-neutral-900 text-white">Seleccionar un Plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                      {p.name} - ${p.price}/mes
                    </option>
                  ))}
                </select>
                {loadingPlans && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/30" />
                )}
              </div>
            </div>

            {/* Expiration and Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                  Fecha de Vencimiento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                  Estado Suscripción
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  disabled={saving}
                >
                  <option value="ACTIVE" className="bg-neutral-900 text-white">Activa (ACTIVE)</option>
                  <option value="PAST_DUE" className="bg-neutral-900 text-white">Vencida/Pendiente Pago (PAST_DUE)</option>
                  <option value="CANCELED" className="bg-neutral-900 text-white">Cancelada (CANCELED)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-white/5 my-4"></div>

            {/* Custom Limits Overrides */}
            <div>
              <h4 className="text-xs font-bold text-white mb-3 tracking-wide">
                Límites Adicionales (Custom Config)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Extra Users Override */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                    Asientos Extra (Usuarios)
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="number"
                      min="0"
                      value={extraUsers}
                      onChange={(e) => setExtraUsers(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Extra Branches Override */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
                    Sucursales Extra
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="number"
                      min="0"
                      value={extraBranches}
                      onChange={(e) => setExtraBranches(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-white/30 mt-2 italic">
                * Los límites adicionales se sumarán a los límites base definidos en el plan de suscripción actual.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-white/[0.01] border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-white/10 hover:bg-white/5 text-white text-xs font-bold rounded-2xl transition-all"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl transition-all border border-white/10 flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
