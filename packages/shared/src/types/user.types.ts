// Role-based Access Control Types
export type UserRole = 'Admin' | 'Editor' | 'Reviewer' | 'Guest';

export type PermissionAction = 
  // Content Management
  | 'content:create' | 'content:read' | 'content:update' | 'content:delete' 
  | 'content:approve' | 'content:publish' | 'content:archive'
  
  // Content Library
  | 'library:read' | 'library:manage' | 'library:sync'
  
  // Writer Profiles
  | 'profiles:create' | 'profiles:read' | 'profiles:update' | 'profiles:delete'
  
  // Company Context
  | 'company:read' | 'company:update' | 'company:manage'
  
  // Social Media
  | 'social:create' | 'social:read' | 'social:update' | 'social:delete' 
  | 'social:approve' | 'social:publish'
  
  // Version Control
  | 'version:read' | 'version:restore' | 'version:compare'
  
  // Comments & Collaboration
  | 'comments:create' | 'comments:read' | 'comments:update' | 'comments:delete'
  
  // User Management (Admin only)
  | 'users:read' | 'users:create' | 'users:update' | 'users:delete' | 'users:assign_roles'
  
  // System Settings
  | 'system:read' | 'system:update';

export type PermissionResource = 
  | 'blog_posts' | 'social_posts' | 'content_topics' | 'writer_profiles' 
  | 'company_context' | 'content_library' | 'comments' | 'users' | 'system';

export interface Permission {
  id: string;
  action: PermissionAction;
  resource: PermissionResource;
  description: string;
  category: 'content' | 'management' | 'collaboration' | 'administration';
}

export interface Role {
  id: string;
  name: UserRole;
  displayName: string;
  description: string;
  permissions: PermissionAction[];
  isSystem: boolean; // Cannot be modified
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissions {
  userId: string;
  role: UserRole;
  permissions: PermissionAction[];
  companySpecificPermissions?: Record<string, PermissionAction[]>; // Per-company overrides
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  platformAccessRights?: Record<string, boolean>;
  permissions?: PermissionAction[];
  lastLoginAt?: Date;
  isActive: boolean;
  companyId?: string; // Primary company association
}

export interface AuthUser extends User {
  accessToken: string;
  refreshToken?: string;
}

// Role Assignment Types
export interface AssignRoleRequest {
  userId: string;
  role: UserRole;
  companyId?: string;
  customPermissions?: PermissionAction[];
}

export interface UpdateUserPermissionsRequest {
  userId: string;
  permissions: PermissionAction[];
  companyId?: string;
}

export interface RolePermissionsResponse {
  role: Role;
  permissions: Permission[];
}

export interface UserManagementRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  companyId?: string;
  isActive?: boolean;
}

export interface UserManagementResponse {
  users: User[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Permission Check Types
export interface CanUserPerformAction {
  userId: string;
  action: PermissionAction;
  resource?: PermissionResource;
  resourceId?: string;
  companyId?: string;
}

// Predefined Role Permissions
export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  Admin: [
    // Full access to everything
    'content:create', 'content:read', 'content:update', 'content:delete', 
    'content:approve', 'content:publish', 'content:archive',
    'library:read', 'library:manage', 'library:sync',
    'profiles:create', 'profiles:read', 'profiles:update', 'profiles:delete',
    'company:read', 'company:update', 'company:manage',
    'social:create', 'social:read', 'social:update', 'social:delete', 
    'social:approve', 'social:publish',
    'version:read', 'version:restore', 'version:compare',
    'comments:create', 'comments:read', 'comments:update', 'comments:delete',
    'users:read', 'users:create', 'users:update', 'users:delete', 'users:assign_roles',
    'system:read', 'system:update'
  ],
  Editor: [
    // Content creation and management
    'content:create', 'content:read', 'content:update', 'content:delete',
    'library:read', 'library:manage',
    'profiles:create', 'profiles:read', 'profiles:update',
    'company:read', 'company:update',
    'social:create', 'social:read', 'social:update', 'social:delete',
    'version:read', 'version:restore', 'version:compare',
    'comments:create', 'comments:read', 'comments:update', 'comments:delete'
  ],
  Reviewer: [
    // Review and approve content
    'content:read', 'content:approve', 'content:archive',
    'library:read',
    'profiles:read',
    'company:read',
    'social:read', 'social:approve',
    'version:read', 'version:compare',
    'comments:create', 'comments:read', 'comments:update'
  ],
  Guest: [
    // Read-only access
    'content:read',
    'library:read',
    'profiles:read',
    'company:read',
    'social:read',
    'version:read',
    'comments:read'
  ]
};