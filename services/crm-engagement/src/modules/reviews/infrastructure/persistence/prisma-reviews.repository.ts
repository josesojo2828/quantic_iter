import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma.service';
import { IReviewsRepository } from '../../domain/reviews.repository';

@Injectable()
export class PrismaReviewsRepository implements IReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.review.create({ data });
  }

  async findForTenant(tenantId: string) {
    return this.prisma.review.findMany({
      where: { tenantId },
      include: { contact: true, event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForContact(contactId: string) {
    return this.prisma.review.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(tenantId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { tenantId },
      select: { score: true },
    });

    if (reviews.length === 0) return { average: 0, count: 0 };

    const sum = reviews.reduce((acc, curr) => acc + curr.score, 0);
    return {
      average: sum / reviews.length,
      count: reviews.length,
    };
  }
}
