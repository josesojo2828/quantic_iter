import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import { SubscriptionService } from '../../application/subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.subscriptionService.getSubscriptionStatus(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Req() req: any, @Body('planSlug') planSlug: string) {
    const tenantId = req.user.tenantId;
    return this.subscriptionService.subscribeToPlan(tenantId, planSlug);
  }
}

