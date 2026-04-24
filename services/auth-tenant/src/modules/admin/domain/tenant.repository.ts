export interface TenantData {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  active: boolean;
  logo?: string;
  owner?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  users?: any[];
  branches?: any[];
  subscription?: any;
}

export interface ITenantRepository {
  findAll(filters: { search?: string; page?: number; limit?: number }): Promise<{ items: TenantData[]; total: number }>;
  findById(id: string): Promise<TenantData | null>;
  findOwnerByTenantId(tenantId: string): Promise<any>;
}
