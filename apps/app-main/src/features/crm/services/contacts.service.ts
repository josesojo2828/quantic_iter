import { apiClient } from '@/core/api/api.client';

export interface Contact {
  id: string;
  tenantId: string;
  globalUserId: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string | null;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const contactsService = {
  getContacts: async (filters: { search?: string, ids?: string[] } = {}): Promise<{ items: Contact[], total: number }> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.ids) params.append('ids', filters.ids.join(','));
    
    const data = await apiClient.get<Contact[] | { items: Contact[], total: number }>(`/crm/contacts?${params.toString()}`);
    
    if (Array.isArray(data)) {
      return { items: data, total: data.length };
    }
    
    return {
      items: data.items || [],
      total: data.total || 0
    };
  },

  getContactById: async (id: string): Promise<Contact> => {
    return apiClient.get<Contact>(`/crm/contacts/${id}`);
  },

  deleteContact: async (id: string): Promise<void> => {
    return apiClient.delete(`/crm/contacts/${id}`);
  }
};
