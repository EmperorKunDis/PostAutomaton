import React from 'react';
import { CompanyContext, CompanySizeIndicator, TargetMarket } from '@internal-marketing-content-app/shared';

interface CompanyContextDisplayProps {
  context: CompanyContext;
  showDetails?: boolean;
  className?: string;
}

const getSizeIndicatorLabel = (indicator: CompanySizeIndicator): string => {
  switch (indicator) {
    case 'startup': return 'Startup';
    case 'small': return 'Small Business';
    case 'medium': return 'Medium Business';
    case 'large': return 'Large Enterprise';
    case 'enterprise': return 'Enterprise';
    default: return 'Unknown';
  }
};

const getSizeIndicatorColor = (indicator: CompanySizeIndicator): string => {
  switch (indicator) {
    case 'startup': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'small': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'medium': return 'bg-green-100 text-green-800 border-green-200';
    case 'large': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'enterprise': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTargetMarketLabel = (market: TargetMarket): string => {
  switch (market) {
    case 'B2B': return 'Business-to-Business';
    case 'B2C': return 'Business-to-Consumer';
    case 'B2B2C': return 'Business-to-Business-to-Consumer';
    default: return 'Mixed Market';
  }
};

const getTargetMarketColor = (market: TargetMarket): string => {
  switch (market) {
    case 'B2B': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'B2C': return 'bg-green-100 text-green-800 border-green-200';
    case 'B2B2C': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const CompanyContextDisplay: React.FC<CompanyContextDisplayProps> = ({
  context,
  showDetails = true,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Company Context</h3>
            <p className="text-sm text-gray-600 mt-1">
              AI-generated insights based on company profile and industry analysis
            </p>
          </div>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full border ${getSizeIndicatorColor(context.companySizeIndicator)}`}>
              {getSizeIndicatorLabel(context.companySizeIndicator)}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full border ${getTargetMarketColor(context.targetMarket)}`}>
              {getTargetMarketLabel(context.targetMarket)}
            </span>
          </div>
        </div>
      </div>

      {/* Company Overview */}
      <div className="p-4 space-y-4">
        {/* Industry Analysis */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Industry Analysis
          </h4>
          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
            {context.industryAnalysis}
          </p>
        </div>

        {showDetails && (
          <>
            {/* Brand Positioning */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Brand Positioning
              </h4>
              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                {context.brandPositioning}
              </p>
            </div>

            {/* Communication Style */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Communication Style
              </h4>
              <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                {context.communicationStyle}
              </p>
            </div>

            {/* Content Themes */}
            {context.contentThemes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Content Themes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {context.contentThemes.map((theme, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full border border-orange-200"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Messaging */}
            {context.keyMessaging.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Key Messages
                </h4>
                <div className="space-y-2">
                  {context.keyMessaging.map((message, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg border-l-4 border-red-200"
                    >
                      {message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Landscape */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Competitive Landscape
              </h4>
              <p className="text-sm text-gray-700 bg-indigo-50 p-3 rounded-lg">
                {context.competitiveLandscape}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Generated: {new Date(context.createdAt).toLocaleString()}</span>
          <span>Last updated: {new Date(context.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};