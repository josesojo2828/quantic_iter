import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionService } from '../../modules/subscription/application/subscription.service';

@Injectable()
export class SubscriptionActiveGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true;
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      return true; 
    }

    const sub: any = await this.subscriptionService.getTenantSubscription(tenantId);
    
    if (!sub || sub.status === 'NONE') {
      throw new ForbiddenException(
        'El gimnasio no tiene un plan activo registrado. Por favor adquiera un plan de suscripción.'
      );
    }

    if (sub.status !== 'ACTIVE') {
      throw new ForbiddenException(
        `La suscripción del gimnasio se encuentra en estado: ${sub.status}. Revise los detalles de facturación.`
      );
    }

    if (sub.expiresAt) {
      const expirationDate = new Date(sub.expiresAt);
      const gracePeriodEndDate = new Date(expirationDate);
      gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 3);

      if (new Date() > gracePeriodEndDate) {
        throw new ForbiddenException(
          `La suscripción del gimnasio ha expirado el ${expirationDate.toLocaleDateString()}. Por favor renueve su plan.`
        );
      }
    }

    return true;
  }
}
