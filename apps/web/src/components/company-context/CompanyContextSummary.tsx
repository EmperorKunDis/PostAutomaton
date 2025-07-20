import React from 'react';
import { CompanyContext, CompanySizeIndicator, TargetMarket } from '@internal-marketing-content-app/shared';

interface CompanyContextSummaryProps {
  context: CompanyContext;
  onViewDetails?: () => void;
  className?: string;
}

const getSizeIndicatorLabel = (indicator: CompanySizeIndicator): string => {
  switch (indicator) {
    case 'startup': return 'Startup';
    case 'small': return 'Small';
    case 'medium': return 'Medium';
    case 'large': return 'Large';
    case 'enterprise': return 'Enterprise';
    default: return 'Unknown';
  }
};

const getSizeIndicatorColor = (indicator: CompanySizeIndicator): string => {
  switch (indicator) {
    case 'startup': return 'bg-purple-100 text-purple-800';
    case 'small': return 'bg-blue-100 text-blue-800';
    case 'medium': return 'bg-green-100 text-green-800';
    case 'large': return 'bg-orange-100 text-orange-800';
    case 'enterprise': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTargetMarketColor = (market: TargetMarket): string => {
  switch (market) {
    case 'B2B': return 'bg-blue-100 text-blue-800';
    case 'B2C': return 'bg-green-100 text-green-800';
    case 'B2B2C': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const CompanyContextSummary: React.FC<CompanyContextSummaryProps> = ({
  context,
  onViewDetails,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h4 className="text-sm font-semibold text-gray-900">Company Context</h4>
        </div>
        <div className="flex space-x-1">
          <span className={`px-2 py-1 text-xs rounded-full ${getSizeIndicatorColor(context.companySizeIndicator)}`}>
            {getSizeIndicatorLabel(context.companySizeIndicator)}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getTargetMarketColor(context.targetMarket)}`}>
            {context.targetMarket}
          </span>
        </div>
      </div>

      {/* Industry Analysis Preview */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 line-clamp-2">
          {context.industryAnalysis}
        </p>
      </div>

      {/* Brand Positioning Preview */}
      <div className="mb-3">
        <span className="text-xs font-medium text-gray-600">Brand Positioning: </span>
        <span className="text-xs text-gray-700">
          {context.brandPositioning.length > 80 
            ? `${context.brandPositioning.substring(0, 80)}...` 
            : context.brandPositioning
          }
        </span>
      </div>

      {/* Content Themes Preview */}
      {context.contentThemes.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {context.contentThemes.slice(0, 3).map((theme, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-white bg-opacity-50 text-gray-700 rounded border border-gray-200"
              >
                {theme}
              </span>
            ))}
            {context.contentThemes.length > 3 && (
              <span className="px-2 py-1 text-xs bg-white bg-opacity-50 text-gray-500 rounded border border-gray-200">
                +{context.contentThemes.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-blue-200 border-opacity-50">
        <span className="text-xs text-gray-500">
          Updated {new Date(context.updatedAt).toLocaleDateString()}
        </span>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            View Details →
          </button>
        )}
      </div>
    </div>
  );
};