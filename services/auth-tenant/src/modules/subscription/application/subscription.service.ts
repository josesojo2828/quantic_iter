import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ISubscriptionRepository } from '../domain/subscription.repository';
import { ClientKafka } from '@nestjs/microservices';
import { AuditAction, AuditPayload } from '@workshop/shared';

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

  async getPlans() {
    return this.subscriptionRepository.findAllPlans();
  }

  async getTenantSubscription(tenantId: string) {
    const sub = await this.subscriptionRepository.findByTenantId(tenantId);
    if (!sub) throw new NotFoundException('Suscripción no encontrada');
    return sub;
  }

  async upgradePlan(tenantId: string, userId: string, planSlug: string) {
    const plan = await this.subscriptionRepository.findPlanBySlug(planSlug);
    if (!plan) throw new NotFoundException('Plan no encontrado');

    const current = await this.subscriptionRepository.findByTenantId(tenantId);

    // Logic for 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const updated = await this.subscriptionRepository.update(
      tenantId,
      plan.id,
      expiresAt,
    );

    this.emitAudit({
      userId,
      tenantId,
      action: AuditAction.UPDATE_FULL,
      module: 'subscription',
      payload: { planSlug, expiresAt },
      previousState: current,
    });

    return updated;
  }
}
