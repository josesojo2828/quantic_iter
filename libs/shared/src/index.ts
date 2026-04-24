export * from './enums/permissions.enum';
export * from './enums/subscription-resource.enum';
export * from './nestjs';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  WORKSHOP_OWNER = 'workshop_owner',
  MECHANIC = 'mechanic',
  RECEPTIONIST = 'receptionist',
  CLIENT = 'client',
}

export * from './types/audit.types';

// Default permissions mapping for roles (Pure TS)
// This serves as a reference and initial seeding logic
export const RolePermissions: Record<string, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.WORKSHOP_OWNER]: [
    'workshop.*',
    'inventory.*',
    'staff.*',
    'orders.*',
    'branches.*',
    'auth.*',
  ],
  [UserRole.MECHANIC]: [
    'workshop.read',
    'inventory.*',
    'orders.update',
    'orders.read',
  ],
  [UserRole.RECEPTIONIST]: [
    'workshop.read',
    'orders.*',
    'auth:login',
  ],
  [UserRole.CLIENT]: [
    'workshop.read',
    'orders.read',
  ],
};
