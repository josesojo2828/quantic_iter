import { User } from './user.entity';

export class RegisterData {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  workshopName!: string;
  planId?: string;
  roleId?: string;
}

export class CreateUserData {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  tenantId!: string;
  roleId!: string;
}

export interface UserData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId: string | null;
  deletedAt: Date | null;
  role: {
    slug: string;
    permissions: Array<{ action: string }>;
  };
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
  findWorkers(tenantId: string): Promise<UserData[]>;
  findRoleBySlug(slug: string): Promise<RoleData | null>;
  findTenantById(id: string): Promise<any>;
  updateTenant(id: string, data: any): Promise<any>;
}

