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
    { key: 'tenants', label: 'Organizaciones / Mentorías', icon: 'Globe', path: '/tenants', module: 'admin' },
    { key: 'users', label: 'Usuarios Globales', icon: 'Users', path: '/users', module: 'admin' },
    { key: 'programs', label: 'Programas', icon: 'BookOpen', path: '/dashboard/programs', module: 'mentor', permission: 'mentor:read' },
    // { key: 'groups', label: 'Grupos / Cohortes', icon: 'Users', path: '/dashboard/groups', module: 'mentor', permission: 'mentor:read' },
    // { key: 'tasks', label: 'Tareas y Objetivos', icon: 'CheckSquare', path: '/dashboard/tasks', module: 'mentor', permission: 'tasks:read' },
    { key: 'habits', label: 'Hábitos', icon: 'Calendar', path: '/dashboard/habits', module: 'mentor', permission: 'tasks:read' },
    // { key: 'gamification', label: 'Gamificación', icon: 'Trophy', path: '/dashboard/gamification', module: 'mentor', permission: 'mentor:read' }, // [TEMPORAL] Oculto para todos
    { key: 'branches', label: 'Sedes / Sucursales', icon: 'Map', path: '/dashboard/branches', module: 'branches', permission: 'branches:read' },
    { key: 'staff', label: 'Coaches / Mentores', icon: 'Users', path: '/dashboard/staff', module: 'staff', permission: 'staff:read' },
    { key: 'clients', label: 'Estudiantes / Mentees', icon: 'Users', path: '/dashboard/clients', module: 'crm', permission: 'crm:read' },
    { key: 'subscriptions', label: 'Suscripción', icon: 'CreditCard', path: '/dashboard/subscriptions', module: 'subscriptions' },
    { key: 'settings', label: 'Configuración', icon: 'Settings', path: '/dashboard/settings', module: 'settings' },
  ];

  getModulesForUser(roleSlug: string, permissions: string[], planConfig: any) {
    // 1. Super Admin sees administration modules
    if (roleSlug === 'super_admin') {
      return this.allModules.filter(m => m.module === 'admin' || m.module === 'dashboard' || m.path === '/dashboard/settings');
    }

    // 2. Owner always sees everything enabled by the plan
    if (roleSlug === 'mentor_owner' || roleSlug === 'admin') {
      return this.allModules.filter(m => {
        if (m.module === 'admin') return false;
        if (m.key === 'gamification') return false; // Coach does not see gamification

        // Feature Gating
        if (m.module === 'mentor' && planConfig?.features && !planConfig.features.includes('mentor')) return false;
        if (m.module === 'crm' && planConfig?.features && !planConfig.features.includes('crm')) return false;

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

      if (!m.permission) return true;
      return permissions.includes(m.permission);
    });
  }
}
