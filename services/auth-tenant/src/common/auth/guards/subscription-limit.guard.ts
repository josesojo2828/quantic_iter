import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { 
  SUBSCRIPTION_LIMIT_KEY, 
  SubscriptionResource,
  AuthUser
} from '@workshop/shared';
import { SubscriptionService } from '../../../modules/subscription/application/subscription.service';

@Injectable()
export class SubscriptionLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.getAllAndOverride<SubscriptionResource>(
      SUBSCRIPTION_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!resource) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const authUser = user as AuthUser;

    if (!authUser || !authUser.tenantId) {
      throw new ForbiddenException('No se detectó un contexto de taller (TenantID)');
    }

    // Bypass for Super Admin if needed, or enforce same limits
    // For now, only enforce if not super admin or if specifically needed
    
    switch (resource) {
      case SubscriptionResource.USERS:
        await this.subscriptionService.checkUserLimit(authUser.tenantId);
        break;
      case SubscriptionResource.BRANCHES:
        await this.subscriptionService.checkBranchLimit(authUser.tenantId);
        break;
      case SubscriptionResource.VEHICLES:
        // await this.subscriptionService.checkVehicleLimit(authUser.tenantId);
        break;
      default:
        break;
    }

    return true;
  }
}
