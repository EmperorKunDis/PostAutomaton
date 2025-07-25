import { useState, useEffect } from 'react';
import { rbacService } from '../services/rbacService';
import { useAuth } from './useAuth';
import { PermissionAction, PermissionResource, ROLE_PERMISSIONS } from '@internal-marketing-content-app/shared';

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PermissionAction[]>([]);

  useEffect(() => {
    if (user) {
      // Get permissions from user role + any custom permissions
      const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
      const customPermissions = user.permissions || [];
      const allPermissions = Array.from(new Set([...rolePermissions, ...customPermissions]));
      setPermissions(allPermissions);
    } else {
      setPermissions([]);
    }
  }, [user]);

  const hasPermission = (action: PermissionAction): boolean => {
    return permissions.includes(action);
  };

  const hasAnyPermission = (actions: PermissionAction[]): boolean => {
    return actions.some(action => permissions.includes(action));
  };

  const hasAllPermissions = (actions: PermissionAction[]): boolean => {
    return actions.every(action => permissions.includes(action));
  };

  const checkPermissionAsync = async (
    action: PermissionAction,
    resource?: PermissionResource,
    resourceId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await rbacService.checkPermission({
        userId: user.id,
        action,
        resource,
        resourceId
      });
      return result.hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermissionAsync,
    isAdmin: user?.role === 'Admin',
    isEditor: user?.role === 'Editor',
    isReviewer: user?.role === 'Reviewer',
    isGuest: user?.role === 'Guest'
  };
};