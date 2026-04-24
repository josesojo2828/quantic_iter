import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';

@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Si está autenticado, limitamos por TenantId
    if (req.user?.tenantId) {
       return req.user.tenantId;
    }
    // Si no, limitamos por IP
    return req.ip;
  }

  protected async getOptions(
    context: ExecutionContext,
    _reflector: any,
  ): Promise<ThrottlerOptions[]> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const planSlug = user?.plan || 'public';

    // Definimos límites basados en el plan
    const limits = {
       'public': { limit: 10, ttl: 60000 },  // 10 req por min para anónimos
       'free':   { limit: 30, ttl: 60000 },  // 30 req por min para trial/free
       'basic':  { limit: 100, ttl: 60000 }, // 100 req por min para plan básico
       'pro':    { limit: 500, ttl: 60000 }, // 500 req por min para plan pro
       'enterprise': { limit: 2000, ttl: 60000 } // 2k req por min para enterprise
    };

    const config = limits[planSlug as keyof typeof limits] || limits.public;

    return [
      {
        name: planSlug,
        ttl: config.ttl,
        limit: config.limit,
      },
    ];
  }
}
