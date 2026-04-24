import { User } from './user.entity';

export class RegisterData {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  workshopName!: string;
  planId?: string;
  roleId?: string;
  avatarUrl?: string;
}

export class CreateUserData {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  tenantId!: string;
  roleId!: string;
  branchId?: string;
  avatarUrl?: string;
}

export interface UserData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  lastTenantId: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  avatarUrl?: string | null;

  roles: Array<{
    tenantId: string | null;
    tenantName: string | null;
    tenantSlug: string | null;
    roleSlug: string;
    branchId: string | null;
    permissions: string[]; // List of permission actions
  }>;
}

export interface RoleData {
  id: string;
  slug: string;
}

export interface IAuthRepository {
  findByEmail(email: string): Promise<UserData | null>;
  findById(id: string): Promise<UserData | null>;
  createTenantAndOwner(data: RegisterData): Promise<User>;

  createUser(data: CreateUserData): Promise<User>;
  findWorkers(tenantId: string, filters: { search?: string; page?: number; limit?: number }): Promise<{ workers: UserData[]; total: number }>;

  updateUser(id: string, data: Partial<CreateUserData>): Promise<UserData | null>;
  deleteUser(id: string): Promise<void>;
  findRoleBySlug(slug: string): Promise<RoleData | null>;

  findTenantById(id: string): Promise<any>;
  updateTenant(id: string, data: any): Promise<any>;
  findAllUsers(filters: { search?: string; page?: number; limit?: number; roleId?: string }): Promise<{ items: UserData[]; total: number }>;
}
