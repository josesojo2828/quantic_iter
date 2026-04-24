import { apiClient } from '@/core/api/api.client';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: string;
  config: {
    maxUsers: number;
    [key: string]: any;
  };
}

export interface SubscriptionStatus {
  id: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  expiresAt: string;
  plan: Plan;
  usage: {
    users: {
      current: number;
      limit: number;
    };
  };
}

export const subscriptionService = {
  async getPlans(): Promise<Plan[]> {
    return apiClient.get<Plan[]>('/subscriptions/plans');
  },

  async getMySubscription(): Promise<SubscriptionStatus> {
    return apiClient.get<SubscriptionStatus>('/subscriptions/my');
  },
  
  async upgrade(planSlug: string): Promise<any> {
    return apiClient.post('/subscriptions/upgrade', { planSlug });
  }
};
