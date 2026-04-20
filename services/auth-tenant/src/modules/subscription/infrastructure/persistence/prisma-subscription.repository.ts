import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ISubscriptionRepository } from '../../domain/subscription.repository';
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

  async findByTenantId(tenantId: string): Promise<Subscription | null> {
    const s = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!s) return null;

    const sub = s as SubscriptionWithPlan;
    const plan = sub.plan ? this.mapPlan(sub.plan) : undefined;

    return new Subscription(
      sub.id,
      sub.tenantId,
      sub.expiresAt,
      sub.status.toLowerCase(),
      plan,
    );
  }

  async create(tenantId: string, planId: string): Promise<Subscription> {
    const s = await this.prisma.subscription.create({
      data: {
        tenantId,
        planId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { plan: true },
    });

    const sub = s as SubscriptionWithPlan;
    const plan = sub.plan ? this.mapPlan(sub.plan) : undefined;

    return new Subscription(
      sub.id,
      sub.tenantId,
      sub.expiresAt,
      sub.status.toLowerCase(),
      plan,
    );
  }

  async update(
    tenantId: string,
    planId: string,
    expiresAt: Date,
  ): Promise<Subscription> {
    const s = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        planId,
        expiresAt,
      },
      include: { plan: true },
    });

    const sub = s as SubscriptionWithPlan;
    const plan = sub.plan ? this.mapPlan(sub.plan) : undefined;

    return new Subscription(
      sub.id,
      sub.tenantId,
      sub.expiresAt,
      sub.status.toLowerCase(),
      plan,
    );
  }
}
