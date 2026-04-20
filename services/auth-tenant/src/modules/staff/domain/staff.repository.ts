import { StaffMember } from './staff-member.entity';

export class StaffQuery {
  skip?: number;
  take?: number;
  orderBy?: string;
  search?: string;
}

export class CreateStaffDto {
  email!: string;
  password?: string;
  firstName!: string;
  lastName!: string;
  roleSlug!: string;
  tenantId!: string;
}

export class UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleSlug?: string;
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
  findById(id: string, tenantId: string): Promise<StaffMember | null>;
  create(data: CreateStaffDto): Promise<StaffMember>;
  update(id: string, data: UpdateStaffDto): Promise<StaffMember>;
  softDelete(id: string): Promise<void>;
}
