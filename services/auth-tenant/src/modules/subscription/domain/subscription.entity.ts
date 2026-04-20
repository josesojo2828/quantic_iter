import { SubscriptionPlan } from './subscription-plan.entity';

export class Subscription {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly expiresAt: Date,
    public readonly status: string,
    public readonly plan?: SubscriptionPlan,
  ) {}
}
