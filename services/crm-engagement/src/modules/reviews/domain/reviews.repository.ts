export interface IReviewsRepository {
  create(data: any): Promise<any>;
  findForTenant(tenantId: string): Promise<any[]>;
  findForContact(contactId: string): Promise<any[]>;
  getStats(tenantId: string): Promise<any>;
}
