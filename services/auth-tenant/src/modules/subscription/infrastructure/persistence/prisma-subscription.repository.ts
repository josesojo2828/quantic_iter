import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ISubscriptionRepository, SubscriptionQuery } from '../../domain/subscription.repository';
import { SubscriptionPlan } from '../../domain/subscription-plan.entity';
import { Subscription } from '../../domain/subscription.entity';
import { Prisma } from '@prisma/client';

type SubscriptionWithPlan = Prisma.SubscriptionGetPayload<{
  include: { plan: true };
}>;

@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private prisma: PrismaService) { }

  private mapPlan(
    p: Prisma.SubscriptionPlanGetPayload<object>,
  ): SubscriptionPlan {
    const price = p.price ? Number(p.price.toString()) : 0;
    return new SubscriptionPlan(
      p.id,
      p.name,
      p.slug,
      p.description,
      price,
      p.config,
    );
  }

  async findAllPlans(): Promise<SubscriptionPlan[]> {
    const plans = await this.prisma.subscriptionPlan.findMany();
    return plans.map((p) => this.mapPlan(p));
  }

  async findPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
    const p = await this.prisma.subscriptionPlan.findUnique({
      where: { slug },
    });
    if (!p) return null;
    return this.mapPlan(p);
  }

  async findPlanById(id: string): Promise<SubscriptionPlan | null> {
    const p = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!p) return null;
    return this.mapPlan(p);
  }

  async createPlan(data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const p = await this.prisma.subscriptionPlan.create({
      data: {
        name: data.name!,
        slug: data.slug!,
        description: data.description,
        price: data.price!,
        billingCycle: (data as any) .billingCycle || 'MONTHLY',
        config: data.config as any,
      },
    });
    return this.mapPlan(p);
  }

  async updatePlan(id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const p = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...data,
        config: data.config as any,
      } as any,
    });
    return this.mapPlan(p);
  }

  async deletePlan(id: string): Promise<void> {
    await this.prisma.subscriptionPlan.delete({
      where: { id },
    });
  }

  async findByTenantId(tenantId: string): Promise<Subscription | null> {
    const s = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { 
        plan: true,
        nextPlan: true,
      } as any,
    });

    if (!s) return null;

    return this.mapSubscription(s);
  }

  private mapSubscription(s: any): Subscription {
    const plan = s.plan ? this.mapPlan(s.plan) : undefined;
    const nextPlan = s.nextPlan ? this.mapPlan(s.nextPlan) : undefined;

    return new Subscription(
      s.id,
      s.tenantId,
      s.expiresAt,
      s.status,
      plan!,
      s.customConfig,
      s.nextPlanId,
      nextPlan,
      s.createdAt,
    );
  }

  async createSubscription(data: {
    tenantId: string;
    planId: string;
    expiresAt: Date;
    status: string;
  }): Promise<Subscription> {
    const s = await this.prisma.subscription.create({
      data: {
        tenantId: data.tenantId,
        planId: data.planId,
        expiresAt: data.expiresAt,
        status: data.status as any,
      },
      include: { plan: true },
    });

    return this.mapSubscription(s);
  }

  async updateSubscription(
    id: string,
    data: Partial<{
      planId: string;
      nextPlanId: string | null;
      expiresAt: Date;
      status: string;
      customConfig: any;
    }>,
  ): Promise<Subscription> {
    const s = await this.prisma.subscription.update({
      where: { id },
      data: {
        ...data,
        status: data.status ? (data.status as any) : undefined,
        customConfig: data.customConfig !== undefined ? data.customConfig : undefined,
      },
      include: { 
        plan: true,
        nextPlan: true,
      } as any,
    });

    return this.mapSubscription(s);
  }

  async findAll(query: SubscriptionQuery): Promise<{ items: Subscription[]; total: number }> {
    const where: Prisma.SubscriptionWhereInput = {};

    if (query.search) {
      where.OR = [
        { tenantId: { contains: query.search, mode: 'insensitive' } },
        { plan: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip: query.skip,
        take: query.take,
        include: {
          plan: true,
          tenant: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      items: items.map((s) => this.mapSubscription(s)),
      total,
    };
  }

  async getAdminStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    revenueByPlan: { planName: string; total: number }[];
  }> {
    const [total, active, canceled, plans] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' as any } }),
      this.prisma.subscription.count({ where: { status: 'CANCELED' as any } }),
      this.prisma.subscriptionPlan.findMany({
        include: { subscriptions: true },
      }),
    ]);

    const revenueByPlan = plans.map((p) => ({
      planName: p.name,
      total: p.subscriptions.length * (p.price ? Number(p.price.toString()) : 0),
    }));

    return {
      totalSubscriptions: total,
      activeSubscriptions: active,
      expiredSubscriptions: canceled,
      revenueByPlan,
    };
  }

  async countTenantUsers(tenantId: string): Promise<number> {
    return this.prisma.user.count({
      where: { 
        userRoles: { some: { tenantId } },
        OR: [
          { deletedAt: null },
          { deletedAt: { isSet: false } }
        ]
      },
    });
  }

  async countTenantBranches(tenantId: string): Promise<number> {
    return this.prisma.branch.count({
      where: { 
        tenantId,
        OR: [
          { deletedAt: null },
          { deletedAt: { isSet: false } }
        ]
      } as any,
    });
  }

  async createHistoryEntry(data: any): Promise<void> {
    await this.prisma.subscriptionHistory.create({
      data: {
        tenantId: data.tenantId,
        planId: data.planId,
        action: data.action,
        price: data.price,
        config: data.config,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  }

  async findHistoryByTenantId(tenantId: string): Promise<any[]> {
    return this.prisma.subscriptionHistory.findMany({
      where: { tenantId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
