export interface IInvitationRepository {
  create(data: {
    email: string;
    token: string;
    roleId: string;
    tenantId: string;
    branchId?: string;
    expiresAt: Date;
  }): Promise<any>;
  
  findByToken(token: string): Promise<any>;
  findByEmailAndTenant(email: string, tenantId: string): Promise<any>;
  delete(id: string): Promise<void>;
  markAsAccepted(id: string): Promise<void>;
}
