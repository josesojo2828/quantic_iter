import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ReviewsService } from '../../application/reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(
    @Query('tenantId') tenantId: string,
    @Body() dto: { contactId: string, bookingId: string, score: number, comment?: string }
  ) {
    return this.reviewsService.submitReview(tenantId, dto);
  }

  @Get('stats')
  async getStats(@Query('tenantId') tenantId: string) {
    return this.reviewsService.getTenantStats(tenantId);
  }

  @Get('recent')
  async getRecent(@Query('tenantId') tenantId: string) {
    return this.reviewsService.getRecentReviews(tenantId);
  }

  @Get('contact/:contactId')
  async getContactReviews(@Param('contactId') contactId: string) {
    return this.reviewsService.getContactReviews(contactId);
  }
}
