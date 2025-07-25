import React from 'react';
import { ContentLibrary } from '../components/ContentLibrary';
import { useCompanyStore } from '../stores/companyStore';

export const ContentLibraryPage: React.FC = () => {
  const { selectedCompany } = useCompanyStore();

  if (!selectedCompany) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to view the content library.</p>
        </div>
      </div>
    );
  }

  return <ContentLibrary companyId={selectedCompany.id} />;
};