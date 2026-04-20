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
    { key: 'works', label: 'Órdenes de Trabajo', icon: 'Wrench', path: '/dashboard/works', module: 'works', permission: 'works.view' },
    { key: 'staff', label: 'Equipo', icon: 'Users', path: '/dashboard/workers', module: 'staff', permission: 'staff.view' },
    { key: 'inventory', label: 'Inventario', icon: 'Box', path: '/dashboard/inventory', module: 'inventory', permission: 'inventory.view' },
    { key: 'pricing', label: 'Planes', icon: 'CreditCard', path: '/dashboard/pricing', module: 'billing', permission: 'billing.view' },
    { key: 'settings', label: 'Configuración', icon: 'Settings', path: '/dashboard/settings', module: 'settings', permission: 'settings.view' },
  ];

  getModulesForUser(roleSlug: string, permissions: string[], planFeatures: string[]) {
    // 1. Owner always sees everything enabled by the plan
    if (roleSlug === 'workshop_owner' || roleSlug === 'admin') {
       return this.allModules.filter(m => {
         // If module is restricted by plan features (coming soon)
         if (m.module === 'inventory' && !planFeatures.includes('inventory')) return false;
         return true;
       });
    }

    // 2. Filter by permissions for other roles
    return this.allModules.filter(m => {
      if (!m.permission) return true; // Public module for auth users
      return permissions.includes(m.permission);
    });
  }
}
