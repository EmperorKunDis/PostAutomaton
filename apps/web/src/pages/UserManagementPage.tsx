import React from 'react';
import { UserManagement } from '../components/UserManagement';
import { useCompanyStore } from '../stores/companyStore';

export const UserManagementPage: React.FC = () => {
  const { selectedCompany } = useCompanyStore();

  return <UserManagement companyId={selectedCompany?.id} />;
};