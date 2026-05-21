import { apiClient } from '@/core/api/api.client';

export interface Interaction {
  id: string;
  tenantId: string;
  contactId: string;
  type: string;
  content: string;
  createdAt: string;
  // UI backward compatibility
  action: string;
  timestamp: string;
}

export interface Review {
  id: string;
  tenantId: string;
  contactId: string;
  bookingId: string;
  score: number;
  comment?: string;
  createdAt: string;
  // UI backward compatibility
  rating: number;
  date: string;
}

export const crmService = {
  // Interactions
  async getInteractions(contactId: string) {
    const interactions = await apiClient.get<Interaction[]>(`/crm/interactions/contact/${contactId}`);
    return (interactions || []).map(i => ({
      ...i,
      action: i.action ?? i.type ?? i.content,
      timestamp: i.timestamp ?? i.createdAt
    }));
  },

  async createInteraction(data: { tenantId: string; contactId: string; type: string; content: string }) {
    const interaction = await apiClient.post<Interaction>('/crm/interactions', data);
    return {
      ...interaction,
      action: interaction.action ?? interaction.type ?? interaction.content,
      timestamp: interaction.timestamp ?? interaction.createdAt
    };
  },

  // Reviews
  async submitReview(tenantId: string, data: { contactId: string; bookingId: string; score: number; comment?: string }) {
    const review = await apiClient.post<Review>(`/crm/reviews?tenantId=${tenantId}`, data);
    return {
      ...review,
      rating: review.rating ?? review.score,
      date: review.date ?? review.createdAt
    };
  },

  async getRecentReviews(tenantId: string) {
    const reviews = await apiClient.get<Review[]>(`/crm/reviews/recent?tenantId=${tenantId}`);
    return (reviews || []).map(r => ({
      ...r,
      rating: r.rating ?? r.score,
      date: r.date ?? r.createdAt
    }));
  },

  async getReviews(contactId: string) {
    const reviews = await apiClient.get<Review[]>(`/crm/reviews/contact/${contactId}`);
    return (reviews || []).map(r => ({
      ...r,
      rating: r.rating ?? r.score,
      date: r.date ?? r.createdAt
    }));
  }
};
