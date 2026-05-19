export interface IContactsRepository {
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  findById(id: string): Promise<any>;
  findByEmail(tenantId: string, email: string): Promise<any>;
  findByPhone(tenantId: string, phone: string): Promise<any>;
  findByGlobalId(tenantId: string, globalUserId: string): Promise<any>;
  findAll(tenantId: string, filters?: any): Promise<any[]>;
  softDelete(id: string): Promise<any>;
}
