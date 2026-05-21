import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IReviewsRepository } from '../domain/reviews.repository';
import { AuditAction } from '@mentor/shared';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject('IReviewsRepository')
    private readonly reviewsRepository: IReviewsRepository,
    @Inject('IEventBus')
    private readonly eventBus: { emit: (topic: string, data: any) => Promise<void> }
  ) {}

  async submitReview(tenantId: string, dto: { contactId: string, bookingId: string, score: number, comment?: string }) {
    if (dto.score < 1 || dto.score > 5) {
      throw new BadRequestException('Score must be between 1 and 5');
    }

    const review = await this.reviewsRepository.create({
      tenantId,
      ...dto
    });

    await this.emitAudit(tenantId, 'system', AuditAction.CREATE, 'crm.review', review);

    return review;
  }

  async getTenantStats(tenantId: string) {
    return this.reviewsRepository.getStats(tenantId);
  }

  async getRecentReviews(tenantId: string) {
    return this.reviewsRepository.findForTenant(tenantId);
  }

  async getContactReviews(contactId: string) {
    return this.reviewsRepository.findForContact(contactId);
  }

  private async emitAudit(tenantId: string, userId: string, action: AuditAction, module: string, payload: any) {
    try {
      await this.eventBus.emit('audit-log', {
        tenantId,
        userId,
        action,
        module,
        payload,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to emit audit log:', error);
    }
  }
}
