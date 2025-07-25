import React, { useState, useEffect } from 'react';
import { rbacService } from '../services/rbacService';
import {
  User,
  UserRole,
  Permission,
  Role,
  UserManagementResponse,
  ROLE_PERMISSIONS
} from '@internal-marketing-content-app/shared';

interface UserManagementProps {
  companyId?: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ companyId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [filterActive, setFilterActive] = useState<boolean | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Guest');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [searchTerm, filterRole, filterActive, currentPage, companyId]);

  const loadInitialData = async () => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        rbacService.getRoles(),
        rbacService.getPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err) {
      setError('Failed to load roles and permissions');
      console.error(err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await rbacService.getUserManagement({
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        role: filterRole || undefined,
        isActive: filterActive === '' ? undefined : filterActive,
        companyId
      });
      
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    try {
      await rbacService.assignRole({
        userId: selectedUser.id,
        role: selectedRole,
        companyId,
        customPermissions: customPermissions.length > 0 ? customPermissions as any : undefined
      });
      
      setShowRoleModal(false);
      setSelectedUser(null);
      setCustomPermissions([]);
      loadUsers();
    } catch (err) {
      setError('Failed to assign role');
      console.error(err);
    }
  };

  const handleUserActivation = async (user: User, activate: boolean) => {
    try {
      if (activate) {
        await rbacService.activateUser(user.id);
      } else {
        await rbacService.deactivateUser(user.id);
      }
      loadUsers();
    } catch (err) {
      setError(`Failed to ${activate ? 'activate' : 'deactivate'} user`);
      console.error(err);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setCustomPermissions(user.permissions || []);
    setShowRoleModal(true);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Editor': return 'bg-blue-100 text-blue-800';
      case 'Reviewer': return 'bg-green-100 text-green-800';
      case 'Guest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleCustomPermission = (permission: string) => {
    setCustomPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as UserRole | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Guest">Guest</option>
              </select>
            </div>

            <div>
              <select
                value={filterActive.toString()}
                onChange={(e) => setFilterActive(e.target.value === '' ? '' : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">{users.length} users</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-4 text-sm font-medium text-gray-500">
            <div className="flex-1">User</div>
            <div className="w-24">Role</div>
            <div className="w-24">Status</div>
            <div className="w-32">Last Login</div>
            <div className="w-32">Actions</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {users.map(user => (
            <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </div>
                
                <div className="w-24">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="w-24">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="w-32 text-sm text-gray-500">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                </div>
                
                <div className="w-32">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openRoleModal(user)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit Role
                    </button>
                    <button
                      onClick={() => handleUserActivation(user, !user.isActive)}
                      className={`px-2 py-1 text-xs rounded ${
                        user.isActive 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Edit Role for {selectedUser.name}
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role.name} value={role.name}>
                      {role.displayName} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Permissions Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Permissions
                </label>
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {ROLE_PERMISSIONS[selectedRole].map(permission => (
                      <div key={permission} className="text-sm text-gray-600">
                        {permission.replace(':', ' ')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Custom Permissions (optional)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {permissions
                    .filter(p => !ROLE_PERMISSIONS[selectedRole].includes(p.action))
                    .map(permission => (
                      <label key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={customPermissions.includes(permission.action)}
                          onChange={() => toggleCustomPermission(permission.action)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {permission.action.replace(':', ' ')} - {permission.description}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};