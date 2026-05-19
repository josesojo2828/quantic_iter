export * from './enums/permissions.enum';
export * from './enums/subscription-resource.enum';
export * from './nestjs';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  MENTOR_OWNER = 'mentor_owner',
  FACILITATOR = 'facilitator',
  RECEPTIONIST = 'receptionist',
  MENTEE = 'mentee',
}

export * from './types/audit.types';

// Default permissions mapping for roles (Pure TS)
// This serves as a reference and initial seeding logic
export const RolePermissions: Record<string, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.MENTOR_OWNER]: [
    'mentor.*',
    'inventory.*',
    'staff.*',
    'orders.*',
    'branches.*',
    'auth.*',
  ],
  [UserRole.FACILITATOR]: [
    'mentor.read',
    'inventory.*',
    'orders.update',
    'orders.read',
  ],
  [UserRole.RECEPTIONIST]: [
    'mentor.read',
    'orders.*',
    'auth:login',
  ],
  [UserRole.MENTEE]: [
    'mentor.read',
    'orders.read',
  ],
};
