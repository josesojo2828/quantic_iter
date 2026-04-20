import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RequestWithUser } from '../interfaces/auth-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      CHECK_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user || !user.permissions) {
      throw new ForbiddenException('No tienes permisos suficientes');
    }

    const hasPermission = requiredPermissions.every((permission) =>
      this.matchPermission(permission, user.permissions),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `No tienes el permiso requerido: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private matchPermission(
    required: string,
    userPermissions: string[],
  ): boolean {
    if (userPermissions.includes('*')) return true;

    // Pattern matching (e.g., 'staff.*' matches 'staff.read')
    return userPermissions.some((p) => {
      if (p === required) return true;
      if (p.endsWith('.*')) {
        const prefix = p.split('.*')[0];
        return required.startsWith(prefix);
      }
      return false;
    });
  }
}
