export interface IAgendaRepository {
  // Events
  createEvent(data: any): Promise<any>;
  findEvents(filter: { 
    tenantId: string; 
    resourceId?: string; 
    start?: { gte?: Date; lte?: Date };
    status?: string;
  }): Promise<any[]>;
  findEventById(id: string): Promise<any>;
  updateEvent(id: string, data: any): Promise<any>;
  deleteEvent(id: string): Promise<any>;
  
  // Specific queries
  findEventsByContact(contactId: string): Promise<any[]>;
}
