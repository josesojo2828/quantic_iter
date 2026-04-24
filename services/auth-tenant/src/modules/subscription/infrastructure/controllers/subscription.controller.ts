import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SubscriptionService } from '../../application/subscription.service';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import { 
  CheckPermissions, 
  PermissionAction, 
  type AuthUser, 
  GetUser 
} from '@workshop/shared';

class UpgradePlanDto {
  planSlug!: string;
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Get('plans')
  @CheckPermissions(PermissionAction.WORKSHOP_READ) // Using standard actions
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Get('my')
  @CheckPermissions(PermissionAction.WORKSHOP_READ)
  async getMySubscription(@GetUser() user: AuthUser) {
    return this.subscriptionService.getSubscriptionStatus(user.tenantId);
  }

  @Post('upgrade')
  @CheckPermissions(PermissionAction.WORKSHOP_UPDATE)
  async upgrade(@GetUser() user: AuthUser, @Body() dto: UpgradePlanDto) {
    return this.subscriptionService.subscribeToPlan(
      user.tenantId,
      user.userId,
      dto.planSlug,
    );
  }
}
