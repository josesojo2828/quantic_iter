import { Branch } from './branch.entity';

export interface BranchQuery {
  skip?: number;
  take?: number;
  orderBy?: string;
  search?: string;
}

export class CreateBranchDto {
  name!: string;
  address?: string;
  phone?: string;
}

export class UpdateBranchDto {
  name?: string;
  address?: string;
  phone?: string;
}

export interface IBranchRepository {
  findAll(tenantId: string, query: BranchQuery): Promise<{ items: Branch[]; total: number }>;
  findById(id: string, tenantId: string): Promise<Branch | null>;
  create(tenantId: string, data: CreateBranchDto): Promise<Branch>;
  update(id: string, tenantId: string, data: UpdateBranchDto): Promise<Branch>;
  softDelete(id: string, tenantId: string): Promise<void>;
  countStaff(id: string, tenantId: string): Promise<number>;
}
