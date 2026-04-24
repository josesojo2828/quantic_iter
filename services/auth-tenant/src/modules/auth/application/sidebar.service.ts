import { Injectable } from '@nestjs/common';

export interface ModuleItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  module: string;
  permission?: string;
}

@Injectable()
export class SidebarService {
  private readonly allModules: ModuleItem[] = [
    { key: 'dashboard', label: 'Panel de Control', icon: 'LayoutDashboard', path: '/dashboard', module: 'dashboard' },
    { key: 'tenants', label: 'Talleres / Tenants', icon: 'Ship', path: '/tenants', module: 'admin' },
    { key: 'users', label: 'Usuarios Globales', icon: 'Users', path: '/users', module: 'admin' },
    { key: 'works', label: 'Órdenes de Trabajo', icon: 'Wrench', path: '/dashboard/works', module: 'workshop', permission: 'orders:read' },
    { key: 'branches', label: 'Sucursales', icon: 'Map', path: '/dashboard/branches', module: 'branches', permission: 'branches:read' },
    { key: 'staff', label: 'Equipo', icon: 'Users', path: '/dashboard/staff', module: 'staff', permission: 'staff:read' },
    { key: 'clients', label: 'Clientes', icon: 'Users', path: '/dashboard/clients', module: 'crm', permission: 'crm:read' },
    { key: 'inventory', label: 'Inventario', icon: 'Box', path: '/dashboard/inventory', module: 'inventory', permission: 'inventory:read' },
    { key: 'subscriptions', label: 'Suscripción', icon: 'CreditCard', path: '/dashboard/subscriptions', module: 'subscriptions' },
    { key: 'settings', label: 'Configuración', icon: 'Settings', path: '/dashboard/settings', module: 'settings' },
  ];

  getModulesForUser(roleSlug: string, permissions: string[], planConfig: any) {
    // 1. Super Admin sees administration modules
    if (roleSlug === 'super_admin') {
      return this.allModules.filter(m => m.module === 'admin' || m.module === 'dashboard' || m.path === '/dashboard/settings');
    }

    // 2. Owner always sees everything enabled by the plan
    if (roleSlug === 'workshop_owner' || roleSlug === 'admin') {
       return this.allModules.filter(m => {
         if (m.module === 'admin') return false; // Workshop owners don't see SaaS admin
         // Feature Gating
         if (m.module === 'inventory' && planConfig?.features && !planConfig.features.includes('inventory')) return false;
         if (m.module === 'crm' && planConfig?.features && !planConfig.features.includes('crm')) return false;
         if (m.module === 'billing' && planConfig?.features && !planConfig.features.includes('billing')) return false;
         
         if (m.module === 'branches' && (planConfig?.maxBranches || 1) <= 1) return false;
         
         return true;
       });
    }

    // 3. Filter by permissions for other roles
    return this.allModules.filter(m => {
      if (m.module === 'admin') return false;
      if (m.module === 'branches' && (planConfig?.maxBranches || 1) <= 1) return false;
      
      const isFeatureEnabled = !m.module || !planConfig?.features || planConfig.features.includes(m.module) || ['dashboard', 'settings', 'staff'].includes(m.module);
      if (!isFeatureEnabled) return false;

      if (!m.permission) return true; // Public module for auth users
      return permissions.includes(m.permission);
    });
  }
}

