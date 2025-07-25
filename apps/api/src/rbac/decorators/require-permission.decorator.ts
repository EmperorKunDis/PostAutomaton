import { SetMetadata } from '@nestjs/common';
import { PermissionAction, PermissionResource } from '@internal-marketing-content-app/shared';

export const PERMISSION_KEY = 'permissions';

export interface PermissionRequirement {
  action: PermissionAction;
  resource?: PermissionResource;
}

export const RequirePermission = (action: PermissionAction, resource?: PermissionResource) =>
  SetMetadata(PERMISSION_KEY, { action, resource });