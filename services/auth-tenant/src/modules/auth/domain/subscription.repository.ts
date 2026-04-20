export interface SubscriptionPlanData {
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

export interface SubscriptionData {
  id: string;
  tenantId: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  expiresAt: Date;
  plan: SubscriptionPlanData;
}

export interface ISubscriptionRepository {
  findTenantSubscription(tenantId: string): Promise<SubscriptionData | null>;
  findAllPlans(): Promise<SubscriptionPlanData[]>;
  updateSubscription(id: string, data: Partial<SubscriptionData>): Promise<void>;
  countTenantUsers(tenantId: string): Promise<number>;
  findPlanBySlug(slug: string): Promise<SubscriptionPlanData | null>;
  createSubscription(data: { tenantId: string; planId: string; expiresAt: Date }): Promise<void>;
}

