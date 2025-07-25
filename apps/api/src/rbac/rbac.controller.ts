import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { RBACService } from './rbac.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

@Controller('rbac')
@UseGuards(JwtAuthGuard)
export class RBACController {
  constructor(private readonly rbacService: RBACService) {}

  @Post('check-permission')
  async checkPermission(@Body() request: CanUserPerformAction): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.rbacService.canUserPerformAction(request);
    return { hasPermission };
  }

  @Post('assign-role')
  async assignRole(
    @Body() request: AssignRoleRequest,
    @Req() req: any
  ): Promise<{ message: string }> {
    await this.rbacService.assignRole(request, req.user.id);
    return { message: 'Role assigned successfully' };
  }

  @Put('user-permissions')
  async updateUserPermissions(
    @Body() request: UpdateUserPermissionsRequest,
    @Req() req: any
  ): Promise<{ message: string }> {
    await this.rbacService.updateUserPermissions(request, req.user.id);
    return { message: 'User permissions updated successfully' };
  }

  @Post('users')
  async getUserManagement(
    @Body() request: UserManagementRequest,
    @Req() req: any
  ): Promise<UserManagementResponse> {
    return this.rbacService.getUserManagement(request, req.user.id);
  }

  @Get('roles')
  async getRoles(): Promise<Role[]> {
    return this.rbacService.getRoles();
  }

  @Get('permissions')
  async getPermissions(): Promise<Permission[]> {
    return this.rbacService.getPermissions();
  }

  @Get('roles/:roleName/permissions')
  async getRolePermissions(@Param('roleName') roleName: UserRole): Promise<Permission[]> {
    return this.rbacService.getRolePermissions(roleName);
  }

  @Put('users/:userId/deactivate')
  async deactivateUser(
    @Param('userId') userId: string,
    @Req() req: any
  ): Promise<{ message: string }> {
    await this.rbacService.deactivateUser(userId, req.user.id);
    return { message: 'User deactivated successfully' };
  }

  @Put('users/:userId/activate')
  async activateUser(
    @Param('userId') userId: string,
    @Req() req: any
  ): Promise<{ message: string }> {
    await this.rbacService.activateUser(userId, req.user.id);
    return { message: 'User activated successfully' };
  }
}