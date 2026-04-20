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

  // Subscriptions
  findByTenantId(tenantId: string): Promise<Subscription | null>;
  create(tenantId: string, planId: string): Promise<Subscription>;
  update(
    tenantId: string,
    planId: string,
    expiresAt: Date,
  ): Promise<Subscription>;
}
