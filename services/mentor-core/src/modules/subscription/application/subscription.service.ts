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
}
