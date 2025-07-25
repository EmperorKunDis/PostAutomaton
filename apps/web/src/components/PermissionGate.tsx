import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionAction } from '@internal-marketing-content-app/shared';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: PermissionAction;
  permissions?: PermissionAction[];
  requireAll?: boolean; // If true, requires ALL permissions. If false, requires ANY permission
  fallback?: React.ReactNode;
  role?: 'Admin' | 'Editor' | 'Reviewer' | 'Guest';
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  role
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, isEditor, isReviewer, isGuest } = usePermissions();

  // Check role-based access
  if (role) {
    const hasRole = (
      (role === 'Admin' && isAdmin) ||
      (role === 'Editor' && isEditor) ||
      (role === 'Reviewer' && isReviewer) ||
      (role === 'Guest' && isGuest)
    );
    
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }

  // Check permission-based access
  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>;
    }
  }

  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};