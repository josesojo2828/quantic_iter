import { SetMetadata } from '@nestjs/common';

export const CHECK_PERMISSIONS_KEY = 'check_permissions';
export const CheckPermissions = (...permissions: string[]) =>
  SetMetadata(CHECK_PERMISSIONS_KEY, permissions);
