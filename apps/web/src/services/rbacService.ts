import { apiClient } from './api';
import {
  AssignRoleRequest,
  UpdateUserPermissionsRequest,
  UserManagementRequest,
  UserManagementResponse,
  CanUserPerformAction,
  Permission,
  Role,
  UserRole
} from '@internal-marketing-content-app/shared';

export class RBACService {
  async checkPermission(request: CanUserPerformAction): Promise<{ hasPermission: boolean }> {
    const response = await apiClient.post('/rbac/check-permission', request);
    return response.data as { hasPermission: boolean };
  }

  async assignRole(request: AssignRoleRequest): Promise<{ message: string }> {
    const response = await apiClient.post('/rbac/assign-role', request);
    return response.data as { message: string };
  }

  async updateUserPermissions(request: UpdateUserPermissionsRequest): Promise<{ message: string }> {
    const response = await apiClient.put('/rbac/user-permissions', request);
    return response.data as { message: string };
  }

  async getUserManagement(request: UserManagementRequest): Promise<UserManagementResponse> {
    const response = await apiClient.post('/rbac/users', request);
    return response.data as UserManagementResponse;
  }

  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get('/rbac/roles');
    return response.data as Role[];
  }

  async getPermissions(): Promise<Permission[]> {
    const response = await apiClient.get('/rbac/permissions');
    return response.data as Permission[];
  }

  async getRolePermissions(roleName: UserRole): Promise<Permission[]> {
    const response = await apiClient.get(`/rbac/roles/${roleName}/permissions`);
    return response.data as Permission[];
  }

  async deactivateUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.put(`/rbac/users/${userId}/deactivate`);
    return response.data as { message: string };
  }

  async activateUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.put(`/rbac/users/${userId}/activate`);
    return response.data as { message: string };
  }
}

export const rbacService = new RBACService();