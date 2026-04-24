export interface BranchData {
  name: string;
  address?: string;
  phone?: string;
}

export interface Branch extends BranchData {
  id: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchRepository {
  create(tenantId: string, data: BranchData): Promise<Branch>;
  findAll(tenantId: string, branchId?: string): Promise<Branch[]>;
  findById(id: string): Promise<Branch | null>;
  update(id: string, data: Partial<BranchData>): Promise<Branch>;
  delete(id: string): Promise<void>;
}
