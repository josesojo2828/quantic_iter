import { StaffMember } from './staff-member.entity';

export class StaffQuery {
  skip?: number;
  take?: number;
  orderBy?: string;
  search?: string;
  branchId?: string;
  role?: string;
  excludeRole?: string;
  excludeUserId?: string;
}

export class CreateStaffDto {
  email!: string;
  password?: string;
  firstName!: string;
  lastName!: string;
  roleSlug!: string;
  tenantId!: string;
  branchId?: string;
  avatarUrl?: string;
}

export class UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleSlug?: string;
  branchId?: string;
  avatarUrl?: string;
}

export class UpdateFieldDto {
  field!: string;
  value!: unknown;
}

export interface IStaffRepository {
  findAll(
    tenantId: string,
    query: StaffQuery,
  ): Promise<{ items: StaffMember[]; total: number }>;
  findById(id: string, tenantId: string, branchId?: string): Promise<StaffMember | null>;
  create(data: CreateStaffDto): Promise<StaffMember>;
  update(id: string, data: UpdateStaffDto): Promise<StaffMember>;
  softDelete(id: string): Promise<void>;
}
