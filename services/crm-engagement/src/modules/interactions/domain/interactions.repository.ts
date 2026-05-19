export interface IInteractionsRepository {
  create(data: {
    tenantId: string;
    contactId: string;
    type: string;
    content: string;
  }): Promise<any>;
  findByContactId(contactId: string): Promise<any[]>;
}
