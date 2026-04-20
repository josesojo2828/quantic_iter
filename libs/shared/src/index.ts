export * from './enums/permissions.enum';
export * from './nestjs';

export enum UserRole {
  ADMIN = 'ADMIN',
  TALLER = 'TALLER',
  CLIENTE = 'CLIENTE',
  PERSONALIZADO = 'PERSONALIZADO',
}

export * from './types/audit.types';

// Default permissions mapping for roles (Pure TS)
export const RolePermissions: Record<string, string[]> = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.TALLER]: [
    'workshop.*',
    'inventory.*',
    'vehicles.*',
    'appointments.*',
    'user.*',
    'finance.view',
  ],
  [UserRole.CLIENTE]: [
    'vehicles.view',
    'appointments.create',
    'feedback.submit',
  ],
  [UserRole.PERSONALIZADO]: [],
};
