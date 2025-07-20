import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Internal Marketing Content App
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <span className="text-sm text-gray-500">({user?.role})</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your Dashboard!
              </h2>
              <p className="text-gray-600 mb-6">
                Authentication is working successfully. Your user information:
              </p>
              <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-900">Email:</dt>
                    <dd className="text-gray-600">{user?.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-900">Name:</dt>
                    <dd className="text-gray-600">{user?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-900">Role:</dt>
                    <dd className="text-gray-600">{user?.role}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-900">ID:</dt>
                    <dd className="text-gray-600 text-sm">{user?.id}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};