import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionAction } from '../../../enums/permissions.enum';
import { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionAction[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    // If no specific permissions are required, just continue
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    if (!user || !user.permissions) {
      console.warn(`[PermissionsGuard] ❌ No user or permissions found in request. User: ${JSON.stringify(user)}`);
      throw new ForbiddenException('No tienes permisos suficientes');
    }

    console.log(`[PermissionsGuard] 🔐 Checking permissions for user: ${user.email} (Role: ${user.role})`);
    console.log(`[PermissionsGuard] 🔑 Required: ${requiredPermissions.join(', ')}`);
    console.log(`[PermissionsGuard] 📜 User Permissions: ${user.permissions.join(', ')}`);

    // 1. Super Admin has access to everything
    // We check if they have SAAS_ADMIN permission or '*'
    const isSaasAdmin = user.role === 'saas_admin' || user.permissions.includes('*') || user.permissions.includes(PermissionAction.SAAS_ADMIN);
    if (isSaasAdmin) {
      return true;
    }

    // 2. Validate Tenant Context
    // Verify that the requested tenantId matches the user's active tenantId
    const { params = {}, query = {}, body = {} } = request;
    const headers = request.headers || {};
    const requestedTenantId = params.tenantId || query.tenantId || body.tenantId || headers['x-tenant-id'];

    if (requestedTenantId && requestedTenantId !== user.tenantId) {
      throw new ForbiddenException('No tienes acceso a este mentoría');
    }

    // 3. Validate Branch Context
    // If the user is restricted to a branch (user.branchId is set)
    // and the request specifies a branchId, they MUST match.
    // We also check if the user is a mentor_owner (who has access to all branches in their tenant)
    
    const isOwner = user.role === 'mentor_owner';
    const requestedBranchId = params.branchId || query.branchId || body.branchId || headers['x-branch-id'];

    // If user is restricted to a branch and tries to access another one
    if (!isOwner && user.branchId && requestedBranchId && requestedBranchId !== user.branchId) {
      throw new ForbiddenException('No tienes acceso a esta sucursal');
    }

    // Special case: If user is restricted to a branch and the route is for 'branches' resource
    // we should prevent access to other branches even if requestedBranchId is not explicitly sent
    // (e.g. DELETE /branches/:id)
    const isBranchRoute = request.url.includes('/branches');
    if (!isOwner && user.branchId && isBranchRoute && params.id && params.id !== user.branchId) {
        throw new ForbiddenException('No tienes permiso para operar sobre otras sucursales');
    }

    // 4. Validate Specific Permissions
    const hasPermission = requiredPermissions.every((permission) =>
      this.hasMatch(user.permissions, permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permisos insuficientes. Se requiere: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private hasMatch(userPermissions: string[], required: string): boolean {
    return userPermissions.some((p) => {
      // Direct match
      if (p === required) return true;
      
      // Wildcard match (e.g., 'staff.*' or 'staff:*' matches 'staff:read')
      if (p.endsWith('.*') || p.endsWith(':*')) {
        const separator = p.includes(':*') ? ':' : '.';
        const prefix = p.split(separator + '*')[0];
        return required.startsWith(prefix + separator);
      }
      
      // Module-level wildcard (e.g., 'inventory' matches all 'inventory:*')
      // Note: This depends on how permissions are stored and checked.
      // We'll stick to 'module.*' convention for now.
      
      return false;
    });
  }
}
