import { Injectable } from '@nestjs/common';
import { BusinessTierRepository } from '../infrastructure/persistence/business-tier.repository';
import { BusinessTier, BusinessSubscription } from '../domain/business-tier.entity';
import { QueryScope } from '../../../common/persistence/base.repository';

@Injectable()
export class BusinessTierService {
  constructor(private readonly repository: BusinessTierRepository) {}

  async createTier(data: Partial<BusinessTier>): Promise<BusinessTier> {
    return this.repository.createTier(data);
  }

  async getTiers(scope: QueryScope): Promise<BusinessTier[]> {
    return this.repository.findAllTiers(scope);
  }

  async subscribeMentee(menteeId: string, tierId: string, scope: QueryScope): Promise<BusinessSubscription> {
    const tier = await this.repository.findTierById(tierId, scope);
    if (!tier) {
      throw new Error('Tier not found');
    }

    // Calcular fecha de fin según el intervalo (simplificado)
    let endDate: Date | undefined = new Date();
    if (tier.interval === 'MONTHLY') endDate.setMonth(endDate.getMonth() + 1);
    else if (tier.interval === 'YEARLY') endDate.setFullYear(endDate.getFullYear() + 1);
    else if (tier.interval === 'QUARTERLY') endDate.setMonth(endDate.getMonth() + 3);
    else endDate = undefined; // ONE_TIME o indefinido

    return this.repository.createSubscription({
      tenantId: scope.tenantId,
      menteeId,
      tierId,
      endDate,
    });
  }

  async getMenteeSubscriptions(menteeId: string, scope: QueryScope): Promise<BusinessSubscription[]> {
    return this.repository.findMenteeSubscriptions(menteeId, scope);
  }
}
