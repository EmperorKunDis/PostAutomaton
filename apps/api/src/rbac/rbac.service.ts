import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';
import {
  UserRole,
  PermissionAction,
  PermissionResource,
  ROLE_PERMISSIONS,
  AssignRoleRequest,
  UpdateUserPermissionsRequest,
  UserManagementRequest,
  UserManagementResponse,
  CanUserPerformAction,
  Permission,
  Role
} from '@internal-marketing-content-app/shared';

@Injectable()
export class RBACService {
  private readonly systemPermissions: Permission[] = [
    // Content Management Permissions
    { id: 'content:create', action: 'content:create', resource: 'blog_posts', description: 'Create new content', category: 'content' },
    { id: 'content:read', action: 'content:read', resource: 'blog_posts', description: 'View content', category: 'content' },
    { id: 'content:update', action: 'content:update', resource: 'blog_posts', description: 'Edit existing content', category: 'content' },
    { id: 'content:delete', action: 'content:delete', resource: 'blog_posts', description: 'Delete content', category: 'content' },
    { id: 'content:approve', action: 'content:approve', resource: 'blog_posts', description: 'Approve content for publication', category: 'content' },
    { id: 'content:publish', action: 'content:publish', resource: 'blog_posts', description: 'Publish approved content', category: 'content' },
    { id: 'content:archive', action: 'content:archive', resource: 'blog_posts', description: 'Archive old content', category: 'content' },

    // Content Library Permissions
    { id: 'library:read', action: 'library:read', resource: 'content_library', description: 'View content library', category: 'management' },
    { id: 'library:manage', action: 'library:manage', resource: 'content_library', description: 'Manage content library assets', category: 'management' },
    { id: 'library:sync', action: 'library:sync', resource: 'content_library', description: 'Sync existing content to library', category: 'management' },

    // Writer Profiles Permissions
    { id: 'profiles:create', action: 'profiles:create', resource: 'writer_profiles', description: 'Create writer profiles', category: 'management' },
    { id: 'profiles:read', action: 'profiles:read', resource: 'writer_profiles', description: 'View writer profiles', category: 'management' },
    { id: 'profiles:update', action: 'profiles:update', resource: 'writer_profiles', description: 'Edit writer profiles', category: 'management' },
    { id: 'profiles:delete', action: 'profiles:delete', resource: 'writer_profiles', description: 'Delete writer profiles', category: 'management' },

    // Company Context Permissions
    { id: 'company:read', action: 'company:read', resource: 'company_context', description: 'View company information', category: 'management' },
    { id: 'company:update', action: 'company:update', resource: 'company_context', description: 'Update company context', category: 'management' },
    { id: 'company:manage', action: 'company:manage', resource: 'company_context', description: 'Full company management', category: 'management' },

    // Social Media Permissions
    { id: 'social:create', action: 'social:create', resource: 'social_posts', description: 'Create social media posts', category: 'content' },
    { id: 'social:read', action: 'social:read', resource: 'social_posts', description: 'View social media posts', category: 'content' },
    { id: 'social:update', action: 'social:update', resource: 'social_posts', description: 'Edit social media posts', category: 'content' },
    { id: 'social:delete', action: 'social:delete', resource: 'social_posts', description: 'Delete social media posts', category: 'content' },
    { id: 'social:approve', action: 'social:approve', resource: 'social_posts', description: 'Approve social media posts', category: 'content' },
    { id: 'social:publish', action: 'social:publish', resource: 'social_posts', description: 'Publish social media posts', category: 'content' },

    // Version Control Permissions
    { id: 'version:read', action: 'version:read', resource: 'blog_posts', description: 'View version history', category: 'collaboration' },
    { id: 'version:restore', action: 'version:restore', resource: 'blog_posts', description: 'Restore previous versions', category: 'collaboration' },
    { id: 'version:compare', action: 'version:compare', resource: 'blog_posts', description: 'Compare different versions', category: 'collaboration' },

    // Comments & Collaboration Permissions
    { id: 'comments:create', action: 'comments:create', resource: 'comments', description: 'Add comments to content', category: 'collaboration' },
    { id: 'comments:read', action: 'comments:read', resource: 'comments', description: 'View comments', category: 'collaboration' },
    { id: 'comments:update', action: 'comments:update', resource: 'comments', description: 'Edit own comments', category: 'collaboration' },
    { id: 'comments:delete', action: 'comments:delete', resource: 'comments', description: 'Delete comments', category: 'collaboration' },

    // User Management Permissions (Admin only)
    { id: 'users:read', action: 'users:read', resource: 'users', description: 'View user list', category: 'administration' },
    { id: 'users:create', action: 'users:create', resource: 'users', description: 'Create new users', category: 'administration' },
    { id: 'users:update', action: 'users:update', resource: 'users', description: 'Update user information', category: 'administration' },
    { id: 'users:delete', action: 'users:delete', resource: 'users', description: 'Delete users', category: 'administration' },
    { id: 'users:assign_roles', action: 'users:assign_roles', resource: 'users', description: 'Assign roles to users', category: 'administration' },

    // System Settings Permissions
    { id: 'system:read', action: 'system:read', resource: 'system', description: 'View system settings', category: 'administration' },
    { id: 'system:update', action: 'system:update', resource: 'system', description: 'Update system settings', category: 'administration' }
  ];

  private readonly systemRoles: Role[] = [
    {
      id: 'admin',
      name: 'Admin',
      displayName: 'Administrator',
      description: 'Full access to all features and user management',
      permissions: ROLE_PERMISSIONS.Admin,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'editor',
      name: 'Editor',
      displayName: 'Content Editor',
      description: 'Create, edit, and manage content but cannot manage users',
      permissions: ROLE_PERMISSIONS.Editor,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'reviewer', 
      name: 'Reviewer',
      displayName: 'Content Reviewer',
      description: 'Review and approve content but cannot create or edit',
      permissions: ROLE_PERMISSIONS.Reviewer,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'guest',
      name: 'Guest',
      displayName: 'Guest User',
      description: 'Read-only access to content and features',
      permissions: ROLE_PERMISSIONS.Guest,
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>
  ) {}

  async canUserPerformAction(request: CanUserPerformAction): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: request.userId },
      relations: ['company']
    });

    if (!user || !user.isActive) {
      return false;
    }

    // Get user's permissions (role-based + custom)
    const userPermissions = this.getUserPermissions(user);

    // Check if user has the required permission
    return userPermissions.includes(request.action);
  }

  async requirePermission(userId: string, action: PermissionAction, resource?: PermissionResource): Promise<void> {
    const hasPermission = await this.canUserPerformAction({
      userId,
      action,
      resource
    });

    if (!hasPermission) {
      throw new ForbiddenException(`Insufficient permissions to perform action: ${action}`);
    }
  }

  async assignRole(request: AssignRoleRequest, adminUserId: string): Promise<void> {
    // Check if admin has permission to assign roles
    await this.requirePermission(adminUserId, 'users:assign_roles');

    const user = await this.userRepository.findOne({
      where: { id: request.userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user role and permissions
    user.role = request.role;
    user.permissions = request.customPermissions || ROLE_PERMISSIONS[request.role];
    
    if (request.companyId) {
      // Verify company exists
      const company = await this.companyRepository.findOne({
        where: { id: request.companyId }
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      user.companyId = request.companyId;
    }

    await this.userRepository.save(user);
  }

  async updateUserPermissions(request: UpdateUserPermissionsRequest, adminUserId: string): Promise<void> {
    // Check if admin has permission to update permissions
    await this.requirePermission(adminUserId, 'users:update');

    const user = await this.userRepository.findOne({
      where: { id: request.userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate permissions are valid for the user's role
    const allowedPermissions = ROLE_PERMISSIONS[user.role];
    const invalidPermissions = request.permissions.filter(p => !allowedPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      throw new ForbiddenException(`Invalid permissions for role ${user.role}: ${invalidPermissions.join(', ')}`);
    }

    user.permissions = request.permissions;
    await this.userRepository.save(user);
  }

  async getUserManagement(request: UserManagementRequest, adminUserId: string): Promise<UserManagementResponse> {
    // Check if admin has permission to read users
    await this.requirePermission(adminUserId, 'users:read');

    const page = request.page || 1;
    const limit = request.limit || 20;
    const offset = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .orderBy('user.createdAt', 'DESC');

    // Apply filters
    if (request.search) {
      queryBuilder.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${request.search}%`
      });
    }

    if (request.role) {
      queryBuilder.andWhere('user.role = :role', { role: request.role });
    }

    if (request.companyId) {
      queryBuilder.andWhere('user.companyId = :companyId', { companyId: request.companyId });
    }

    if (request.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: request.isActive });
    }

    const [users, totalCount] = await queryBuilder
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    return {
      users: users.map(user => this.mapUserToInterface(user)),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  async getRoles(): Promise<Role[]> {
    return this.systemRoles;
  }

  async getPermissions(): Promise<Permission[]> {
    return this.systemPermissions;
  }

  async getRolePermissions(roleName: UserRole): Promise<Permission[]> {
    const rolePermissions = ROLE_PERMISSIONS[roleName];
    return this.systemPermissions.filter(p => rolePermissions.includes(p.action));
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date()
    });
  }

  async deactivateUser(userId: string, adminUserId: string): Promise<void> {
    await this.requirePermission(adminUserId, 'users:update');
    
    await this.userRepository.update(userId, {
      isActive: false
    });
  }

  async activateUser(userId: string, adminUserId: string): Promise<void> {
    await this.requirePermission(adminUserId, 'users:update');
    
    await this.userRepository.update(userId, {
      isActive: true
    });
  }

  // Helper methods
  private getUserPermissions(user: User): PermissionAction[] {
    // Start with role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    
    // Add any custom permissions
    const customPermissions = user.permissions || [];
    
    // Merge and deduplicate
    return Array.from(new Set([...rolePermissions, ...customPermissions]));
  }

  private mapUserToInterface(user: User): any {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: this.getUserPermissions(user),
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
      companyId: user.companyId,
      company: user.company ? {
        id: user.company.id,
        name: user.company.name
      } : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}