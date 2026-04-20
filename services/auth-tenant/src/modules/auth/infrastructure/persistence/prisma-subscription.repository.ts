import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { 
  ISubscriptionRepository, 
  SubscriptionData, 
  SubscriptionPlanData 
} from '../../domain/subscription.repository';

@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private prisma: PrismaService) {}

  async findTenantSubscription(tenantId: string): Promise<SubscriptionData | null> {
    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        plan: true,
      },
    });

    if (!sub) return null;

    return {
      id: sub.id,
      tenantId: sub.tenantId,
      status: sub.status as any,
      expiresAt: sub.expiresAt,
      plan: {
        id: sub.plan.id,
        name: sub.plan.name,
        slug: sub.plan.slug,
        price: sub.plan.price,
        billingCycle: sub.plan.billingCycle,
        config: sub.plan.config as any,
      },
    };
  }

  async findAllPlans(): Promise<SubscriptionPlanData[]> {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
    });

    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      billingCycle: p.billingCycle,
      config: p.config as any,
    }));
  }

  async updateSubscription(id: string, data: Partial<SubscriptionData>): Promise<void> {
    await this.prisma.subscription.update({
      where: { id },
      data: {
        status: data.status as any,
        expiresAt: data.expiresAt,
        planId: data.plan?.id,
      },
    });
  }

  async countTenantUsers(tenantId: string): Promise<number> {
    return this.prisma.user.count({
      where: { 
        tenantId,
        deletedAt: null 
      },
    });
  }

  async findPlanBySlug(slug: string): Promise<SubscriptionPlanData | null> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug },
    });

    if (!plan) return null;

    return {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      price: plan.price,
      billingCycle: plan.billingCycle,
      config: plan.config as any,
    };
  }

  async createSubscription(data: { tenantId: string; planId: string; expiresAt: Date }): Promise<void> {
    await this.prisma.subscription.create({
      data: {
        tenantId: data.tenantId,
        planId: data.planId,
        expiresAt: data.expiresAt,
        status: 'ACTIVE',
      },
    });
  }
}

