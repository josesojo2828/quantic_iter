import { apiClient } from '@/core/api/api.client';

export interface AgendaEvent {
  id: string;
  tenantId: string;
  type?: string;
  title?: string;
  description?: string;
  start: string;
  end: string;
  status: 'CONFIRMED' | 'CANCELLED';
  contactId?: string;
  guestIds?: string[];
  groupIds?: string[];
  resourceId?: string;
  metadata?: any;
  contact?: any;
}

export const agendaService = {
  async getEvents(tenantId: string, date: string, resourceId?: string) {
    return apiClient.get<AgendaEvent[]>(`/crm/agenda/events?tenantId=${tenantId}&date=${date}${resourceId ? `&resourceId=${resourceId}` : ''}`);
  },

  async createEvent(data: Partial<AgendaEvent>) {
    return apiClient.post<AgendaEvent>(`/crm/agenda/events`, data);
  },

  async updateEvent(id: string, data: Partial<AgendaEvent>) {
    return apiClient.patch<AgendaEvent>(`/crm/agenda/events/${id}`, data);
  },

  async cancelEvent(id: string) {
    return apiClient.put<AgendaEvent>(`/crm/agenda/events/${id}/cancel`, {});
  },

  async getMetrics(tenantId: string, date: string) {
    return apiClient.get<any>(`/crm/agenda/metrics?tenantId=${tenantId}&date=${date}`);
  },

  async getUpcoming(tenantId: string) {
    return apiClient.get<AgendaEvent>(`/crm/agenda/upcoming?tenantId=${tenantId}`);
  },

  async getBusyDays(tenantId: string, month: number, year: number) {
    return apiClient.get<string[]>(`/crm/agenda/busy-days?tenantId=${tenantId}&month=${month}&year=${year}`);
  }
};
