import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(data: { name: string; type: string; price: number; features: string[] }) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        type: data.type,
        price: data.price,
        features: data.features,
      },
    });
  }

  async getTenantSubscription(tenantId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });
    
    if (!sub) {
      // Fallback a tier gratuito o inicial si no existe
      return { status: 'NONE', plan: { type: 'FREE', features: [] } };
    }
    
    return sub;
  }

  async subscribe(tenantId: string, planId: string) {
    return this.prisma.subscription.upsert({
      where: { tenantId },
      update: { planId, status: 'ACTIVE' },
      create: { tenantId, planId, status: 'ACTIVE' },
    });
  }

  async syncSubscription(data: {
    tenantId: string;
    planId: string;
    planSlug: string;
    maxCoaches: number;
    maxMentees: number;
    expiresAt: Date;
    status: string;
  }) {
    // 1. Ensure the SubscriptionPlan exists in MongoDB
    let plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      plan = await this.prisma.subscriptionPlan.create({
        data: {
          id: data.planId,
          name: `Plan ${data.planSlug.toUpperCase()}`,
          type: data.planSlug.includes('enterprise') ? 'ENTERPRISE' : 'PRO_COACH',
          price: 0,
          features: [],
          maxCoaches: data.maxCoaches,
          maxMentees: data.maxMentees,
        },
      });
    } else {
      plan = await this.prisma.subscriptionPlan.update({
        where: { id: data.planId },
        data: {
          maxCoaches: data.maxCoaches,
          maxMentees: data.maxMentees,
        },
      });
    }

    // 2. Upsert the Subscription
    return this.prisma.subscription.upsert({
      where: { tenantId: data.tenantId },
      update: {
        planId: data.planId,
        status: data.status,
        expiresAt: new Date(data.expiresAt),
      },
      create: {
        tenantId: data.tenantId,
        planId: data.planId,
        status: data.status,
        expiresAt: new Date(data.expiresAt),
      },
    });
  }
}
