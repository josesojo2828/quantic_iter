import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { BusinessTier, BusinessSubscription } from '../../domain/business-tier.entity';

@Injectable()
export class BusinessTierRepository extends BaseRepository<BusinessTier> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createTier(data: Partial<BusinessTier>): Promise<BusinessTier> {
    return this.prisma.businessTier.create({
      data: {
        tenantId: data.tenantId!,
        name: data.name!,
        description: data.description,
        price: data.price!,
        currency: data.currency || 'USD',
        interval: data.interval || 'MONTHLY',
        features: data.features || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    }) as unknown as BusinessTier;
  }

  async findAllTiers(scope: QueryScope): Promise<BusinessTier[]> {
    return this.prisma.businessTier.findMany({
      where: this.applyScope({}, scope, { menteeField: null, coachField: null }),
      orderBy: { createdAt: 'desc' },
    }) as unknown as BusinessTier[];
  }

  async findTierById(id: string, scope: QueryScope): Promise<BusinessTier | null> {
    return this.prisma.businessTier.findFirst({
      where: this.applyScope({ id }, scope, { menteeField: null, coachField: null }),
    }) as unknown as BusinessTier;
  }

  async createSubscription(data: Partial<BusinessSubscription>): Promise<BusinessSubscription> {
    return this.prisma.businessSubscription.create({
      data: {
        tenantId: data.tenantId!,
        menteeId: data.menteeId!,
        tierId: data.tierId!,
        status: data.status || 'ACTIVE',
        startDate: data.startDate || new Date(),
        endDate: data.endDate,
      },
    }) as unknown as BusinessSubscription;
  }

  async findMenteeSubscriptions(menteeId: string, scope: QueryScope): Promise<BusinessSubscription[]> {
    return this.prisma.businessSubscription.findMany({
      where: this.applyScope({ menteeId }, scope, { coachField: null }),
      include: { tier: true },
    }) as unknown as BusinessSubscription[];
  }
}
