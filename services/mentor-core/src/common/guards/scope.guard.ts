import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ScopeGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si el usuario es Super Admin, tiene acceso total (bypass scope)
    if (user?.role === 'super_admin') return true;

    request.scope = {
      userId: user?.sub,
      role: user?.role,
      tenantId: user?.tenantId,
      coachId: user?.mentorId || (user?.role === 'mentor' ? user?.sub : undefined),
      menteeId: user?.role === 'mentee' ? user?.sub : undefined,
    };

    return !!request.scope.tenantId;
  }
}

