import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SubscriptionService } from '../../application/subscription.service';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import {
  PermissionsGuard,
  CheckPermissions,
  PermissionAction,
} from '@workshop/shared/nestjs';
import { GetUser } from '../../../../common/auth/decorators/get-user.decorator';
import { AuthUser } from '../../../../common/auth/interfaces/auth-user.interface';

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
    return this.subscriptionService.getTenantSubscription(user.tenantId);
  }

  @Post('upgrade')
  @CheckPermissions(PermissionAction.WORKSHOP_UPDATE)
  async upgrade(@GetUser() user: AuthUser, @Body() dto: UpgradePlanDto) {
    return this.subscriptionService.upgradePlan(
      user.tenantId,
      user.userId,
      dto.planSlug,
    );
  }
}
