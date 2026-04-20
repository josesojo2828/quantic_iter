import { Injectable, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import type { ISubscriptionRepository } from '../domain/subscription.repository';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}


  async validateSubscription(tenantId: string) {
    const sub = await this.subscriptionRepository.findTenantSubscription(tenantId);
    
    if (!sub) {
      throw new ForbiddenException('No se encontró una suscripción activa para este taller.');
    }

    if (sub.status !== 'ACTIVE') {
      throw new ForbiddenException(`Suscripción en estado: ${sub.status}. Por favor revise su facturación.`);
    }

    if (new Date(sub.expiresAt) < new Date()) {
      throw new ForbiddenException('Su suscripción ha expirado. Por favor renueve su plan.');
    }

    return sub;
  }

  async checkUserLimit(tenantId: string) {
    const sub = await this.validateSubscription(tenantId);
    const currentUserCount = await this.subscriptionRepository.countTenantUsers(tenantId);

    const maxUsers = sub.plan.config.maxUsers || 5; // Default safety limit

    if (currentUserCount >= maxUsers) {
      throw new ForbiddenException(
        `Límite de usuarios alcanzado (${currentUserCount}/${maxUsers}). Por favor mejore su plan.`
      );
    }

    return {
      current: currentUserCount,
      limit: maxUsers,
    };
  }

  async getPlans() {
    return this.subscriptionRepository.findAllPlans();
  }

  async getSubscriptionStatus(tenantId: string) {
    const sub = await this.subscriptionRepository.findTenantSubscription(tenantId);
    if (!sub) throw new NotFoundException('Suscripción no encontrada');
    
    const currentUserCount = await this.subscriptionRepository.countTenantUsers(tenantId);

    return {
      ...sub,
      usage: {
        users: {
          current: currentUserCount,
          limit: sub.plan.config.maxUsers,
        }
      }
    };
  }

  async subscribeToPlan(tenantId: string, planSlug: string) {
    const plan = await this.subscriptionRepository.findPlanBySlug(planSlug);
    if (!plan) throw new NotFoundException('Plan no encontrado');

    const currentSub = await this.subscriptionRepository.findTenantSubscription(tenantId);
    
    // Renewal/Upgrade logic
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

    if (currentSub) {
      // Validate that the new plan supports current user count if upgrading/downgrading
      const currentUserCount = await this.subscriptionRepository.countTenantUsers(tenantId);
      if (currentUserCount > plan.config.maxUsers) {
        throw new ForbiddenException(
          `No puede cambiar al plan ${plan.name} porque excede el límite de usuarios (${currentUserCount}/${plan.config.maxUsers}).`
        );
      }

      await this.subscriptionRepository.updateSubscription(currentSub.id, {
        status: 'ACTIVE',
        expiresAt,
        plan: plan,
      });
    } else {
      await this.subscriptionRepository.createSubscription({
        tenantId,
        planId: plan.id,
        expiresAt,
      });
    }

    return { message: 'Suscripción actualizada con éxito', plan: plan.name };
  }
}

