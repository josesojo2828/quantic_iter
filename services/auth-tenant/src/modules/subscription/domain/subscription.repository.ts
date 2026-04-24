import { SubscriptionPlan } from './subscription-plan.entity';
import { Subscription } from './subscription.entity';

export class SubscriptionQuery {
  skip?: number;
  take?: number;
  search?: string;
}

export interface ISubscriptionRepository {
  // Plans
  findAllPlans(): Promise<SubscriptionPlan[]>;
  findPlanBySlug(slug: string): Promise<SubscriptionPlan | null>;
  findPlanById(id: string): Promise<SubscriptionPlan | null>;
  createPlan(data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan>;
  updatePlan(id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan>;
  deletePlan(id: string): Promise<void>;

  // Subscriptions
  findAll(query: SubscriptionQuery): Promise<{ items: Subscription[]; total: number }>;
  findByTenantId(tenantId: string): Promise<Subscription | null>;
  createSubscription(data: {
    tenantId: string;
    planId: string;
    expiresAt: Date;
    status: string;
  }): Promise<Subscription>;
  updateSubscription(
    id: string,
    data: Partial<{
      planId: string;
      nextPlanId: string | null;
      expiresAt: Date;
      status: string;
    }>,
  ): Promise<Subscription>;

  // Administrative Stats
  getAdminStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    revenueByPlan: { planName: string, total: number }[];
  }>;

  // Validations & Resource Counts
  countTenantUsers(tenantId: string): Promise<number>;
  countTenantBranches(tenantId: string): Promise<number>;

  // History
  createHistoryEntry(data: any): Promise<void>;
  findHistoryByTenantId(tenantId: string): Promise<any[]>;
}
