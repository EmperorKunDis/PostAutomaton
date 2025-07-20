import React from 'react';
import { useCompany } from '../hooks/useCompany';
import { CompanySearch } from '../components/companies/CompanySearch';
import { CompanyConfirmation } from '../components/companies/CompanyConfirmation';
import { useNavigate } from 'react-router-dom';

export const CompanySelectionPage: React.FC = () => {
  const { selectedCompany, clearSelection } = useCompany();
  const navigate = useNavigate();

  const handleConfirmCompany = () => {
    // Store company selection and navigate to next step
    // For now, navigate to dashboard
    navigate('/dashboard');
  };

  const handleSearchAgain = () => {
    clearSelection();
  };

  if (selectedCompany) {
    return (
      <CompanyConfirmation
        company={selectedCompany}
        onConfirm={handleConfirmCompany}
        onSearchAgain={handleSearchAgain}
      />
    );
  }

  return <CompanySearch />;
};