import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { ISubscriptionRepository } from '../domain/subscription.repository';
import { ClientKafka } from '@nestjs/microservices';
import { AuditAction, AuditPayload } from '@workshop/shared';
import { Subscription } from '../domain/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientKafka,
  ) { }

  private emitAudit(data: Omit<AuditPayload, 'timestamp'>) {
    this.auditClient.emit('audit.log', { ...data, timestamp: new Date() });
  }

  async validateSubscription(tenantId: string): Promise<Subscription> {
    const sub = await this.subscriptionRepository.findByTenantId(tenantId);
    
    if (!sub) {
      throw new ForbiddenException('No se encontró una suscripción activa para este taller.');
    }

    if (sub.status !== 'ACTIVE') {
      throw new ForbiddenException(`Suscripción en estado: ${sub.status}. Por favor revise su facturación.`);
    }

    // Auto-swap logic if current plan expired but there's a queued one
    if (new Date(sub.expiresAt) < new Date()) {
      if (sub.nextPlanId) {
        const nextPlan = sub.nextPlan!;
        const newExpiresAt = new Date();
        newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);

        const updated = await this.subscriptionRepository.updateSubscription(sub.id, {
          planId: sub.nextPlanId,
          nextPlanId: null,
          expiresAt: newExpiresAt,
          status: 'ACTIVE'
        });

        this.emitAudit({
          userId: 'SYSTEM', // System triggered action
          tenantId,
          action: AuditAction.UPDATE_FULL,
          module: 'subscription',
          payload: { 
            reason: 'AUTO_SWAP_EXPIRED_PLAN',
            newPlan: nextPlan.slug,
            expiresAt: newExpiresAt 
          },
          previousState: sub,
        });

        // LOG TO HISTORY
        await this.subscriptionRepository.createHistoryEntry({
          tenantId,
          planId: sub.nextPlanId,
          action: 'AUTO_RENEWAL',
          price: nextPlan.price,
          config: nextPlan.config,
          startDate: new Date(),
          endDate: newExpiresAt,
        });

        return updated;
      }

      throw new ForbiddenException('Su suscripción ha expirado. Por favor renueve su plan.');
    }

    return sub;
  }

  private getEffectiveConfig(sub: Subscription) {
    const baseConfig = sub.plan.config || {};
    const overrides = sub.customConfig || {};

    return {
      ...baseConfig,
      ...overrides,
      maxUsers: (baseConfig.maxUsers || 0) + (overrides.extraUsers || 0),
      maxBranches: (baseConfig.maxBranches || 1) + (overrides.extraBranches || 0),
      features: [
        ...(baseConfig.features || []),
        ...(overrides.extraFeatures || [])
      ]
    };
  }

  async checkUserLimit(tenantId: string) {
    const sub = await this.validateSubscription(tenantId);
    const config = this.getEffectiveConfig(sub);
    const currentUserCount = await this.subscriptionRepository.countTenantUsers(tenantId);

    const maxUsers = config.maxUsers || 5; 

    if (currentUserCount >= maxUsers) {
      throw new ForbiddenException(
        `Límite de usuarios alcanzado (${currentUserCount}/${maxUsers}). Por favor mejore su plan o adquiera más asientos.`
      );
    }

    return {
      current: currentUserCount,
      limit: maxUsers,
    };
  }

  async checkBranchLimit(tenantId: string) {
    const sub = await this.validateSubscription(tenantId);
    const config = this.getEffectiveConfig(sub);
    
    const currentBranchCount = await this.subscriptionRepository.countTenantBranches(tenantId);
    const maxBranches = config.maxBranches || 1;

    if (currentBranchCount >= maxBranches) {
      throw new ForbiddenException(
        `Límite de sucursales alcanzado (${currentBranchCount}/${maxBranches}). Por favor mejore su plan o adquiera una sucursal extra.`
      );
    }

    return {
      current: currentBranchCount,
      limit: maxBranches,
    };
  }

  async isFeatureEnabled(tenantId: string, featureName: string): Promise<boolean> {
    const sub = await this.subscriptionRepository.findByTenantId(tenantId);
    if (!sub || sub.status !== 'ACTIVE') return false;
    
    // Check if subscription expired
    if (new Date(sub.expiresAt) < new Date()) return false;

    const config = this.getEffectiveConfig(sub);
    return (config.features || []).includes(featureName);
  }

  async getPlans() {
    return this.subscriptionRepository.findAllPlans();
  }

  async getSubscriptionStatus(tenantId: string) {
    const sub = await this.subscriptionRepository.findByTenantId(tenantId);
    if (!sub) throw new NotFoundException('Suscripción no encontrada');
    
    const config = this.getEffectiveConfig(sub);
    const currentUserCount = await this.subscriptionRepository.countTenantUsers(tenantId);
    const currentBranchCount = await this.subscriptionRepository.countTenantBranches(tenantId);

    return {
      ...sub,
      config,
      usage: {
        users: {
          current: currentUserCount,
          limit: config.maxUsers,
        },
        branches: {
          current: currentBranchCount,
          limit: config.maxBranches,
        }
      }
    };
  }

  async subscribeToPlan(tenantId: string, userId: string, planSlug: string) {
    const plan = await this.subscriptionRepository.findPlanBySlug(planSlug);
    if (!plan) throw new NotFoundException('Plan no encontrado');

    const currentSub = await this.subscriptionRepository.findByTenantId(tenantId);
    
    if (currentSub) {
      if (currentSub.plan.slug === plan.slug) {
        return { message: 'Este es ya su plan actual.', alreadyActive: true };
      }

      // Queue the next plan
      const updated = await this.subscriptionRepository.updateSubscription(currentSub.id, {
        nextPlanId: plan.id,
      });

      this.emitAudit({
        userId,
        tenantId,
        action: AuditAction.UPDATE_PARTIAL,
        module: 'subscription',
        payload: { 
          action: 'QUEUE_NEXT_PLAN',
          planSlug: plan.slug 
        },
        previousState: currentSub,
      });

      return { 
        message: `Plan ${plan.name} programado para iniciarse al vencer el periodo actual.`, 
        plan: plan.name,
        scheduled: true 
      };
    } else {
      // First time subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const newSub = await this.subscriptionRepository.createSubscription({
        tenantId,
        planId: plan.id,
        expiresAt,
        status: 'ACTIVE',
      });

      this.emitAudit({
        userId,
        tenantId,
        action: AuditAction.CREATE,
        module: 'subscription',
        payload: { planSlug: plan.slug, expiresAt },
      });

      // LOG TO HISTORY
      await this.subscriptionRepository.createHistoryEntry({
        tenantId,
        planId: plan.id,
        action: 'ACTIVATION',
        price: plan.price,
        config: plan.config,
        startDate: new Date(),
        endDate: expiresAt,
      });

    return { message: 'Suscripción activada con éxito', plan: plan.name };
    }
  }

  // Admin Methods
  async listAllSubscriptions(query: { search?: string; page?: number; limit?: number }) {
    return this.subscriptionRepository.findAll({
      search: query.search,
      skip: ((query.page || 1) - 1) * (query.limit || 10),
      take: query.limit || 10,
    });
  }

  async getAdminStats() {
    return this.subscriptionRepository.getAdminStats();
  }

  async createPlan(data: any) {
    return this.subscriptionRepository.createPlan(data);
  }

  async updatePlan(id: string, data: any) {
    return this.subscriptionRepository.updatePlan(id, data);
  }

  async deletePlan(id: string) {
    return this.subscriptionRepository.deletePlan(id);
  }

  async getTenantHistory(tenantId: string) {
    return this.subscriptionRepository.findHistoryByTenantId(tenantId);
  }
}
