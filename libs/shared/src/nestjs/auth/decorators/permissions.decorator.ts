import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '../../../enums/permissions.enum';

export const PERMISSIONS_KEY = 'permissions';
export const CheckPermissions = (...permissions: PermissionAction[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
