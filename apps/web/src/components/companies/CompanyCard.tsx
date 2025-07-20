import React from 'react';
import { Company } from '@internal-marketing-content-app/shared';

interface CompanyCardProps {
  company: Company;
  onSelect: (company: Company) => void;
  showConfidence?: boolean;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ 
  company, 
  onSelect, 
  showConfidence = false 
}) => {
  const handleClick = () => {
    onSelect(company);
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all duration-200"
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        {/* Logo placeholder */}
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {company.logo ? (
            <img 
              src={company.logo} 
              alt={`${company.name} logo`}
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="text-gray-500 text-xl font-bold">
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Company details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {company.name}
            </h3>
            {showConfidence && company.confidence && (
              <span className="text-sm text-indigo-600 font-medium ml-2">
                {company.confidence}% match
              </span>
            )}
          </div>
          
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <span>{company.industry}</span>
            <span className="mx-2">•</span>
            <span>{company.location.city}, {company.location.country}</span>
          </div>
          
          {company.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {company.description}
            </p>
          )}
          
          {company.website && (
            <div className="mt-2">
              <a 
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-800"
                onClick={(e) => e.stopPropagation()}
              >
                {company.website}
              </a>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex justify-end">
        <button 
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          onClick={handleClick}
        >
          Select This Company →
        </button>
      </div>
    </div>
  );
};