import { apiClient } from '@/core/api/api.client';

export interface Interaction {
  id: string;
  tenantId: string;
  contactId: string;
  type: string;
  content: string;
  createdAt: string;
}

export interface Review {
  id: string;
  tenantId: string;
  contactId: string;
  bookingId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export const crmService = {
  // Interactions
  async getInteractions(contactId: string) {
    return apiClient.get<Interaction[]>(`/crm/interactions/contact/${contactId}`);
  },

  async createInteraction(data: { tenantId: string; contactId: string; type: string; content: string }) {
    return apiClient.post<Interaction>('/crm/interactions', data);
  },

  // Reviews
  async submitReview(tenantId: string, data: { contactId: string; bookingId: string; score: number; comment?: string }) {
    return apiClient.post<Review>(`/crm/reviews?tenantId=${tenantId}`, data);
  },

  async getRecentReviews(tenantId: string) {
    return apiClient.get<Review[]>(`/crm/reviews/recent?tenantId=${tenantId}`);
  }
};
