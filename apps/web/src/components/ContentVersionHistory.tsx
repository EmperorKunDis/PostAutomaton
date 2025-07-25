import React, { useState, useEffect } from 'react';
import { versionControlService } from '../services/versionControlService';
import {
  ContentEntityType,
  ContentHistoryResponse,
  ContentVersion,
  ContentRevision,
  ChangeSource,
  VersionComparisonResponse
} from '@internal-marketing-content-app/shared';

interface ContentVersionHistoryProps {
  entityType: ContentEntityType;
  entityId: string;
  onClose: () => void;
  onRestore?: () => void;
}

export const ContentVersionHistory: React.FC<ContentVersionHistoryProps> = ({
  entityType,
  entityId,
  onClose,
  onRestore
}) => {
  const [history, setHistory] = useState<ContentHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<[number, number] | null>(null);
  const [comparison, setComparison] = useState<VersionComparisonResponse | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [restoreNotes, setRestoreNotes] = useState('');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [targetVersion, setTargetVersion] = useState<number | null>(null);

  useEffect(() => {
    loadHistory();
  }, [entityType, entityId]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await versionControlService.getContentHistory({
        entityType,
        entityId
      });
      setHistory(response);
    } catch (err) {
      setError('Failed to load version history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareVersions = async (fromVersion: number, toVersion: number) => {
    try {
      const response = await versionControlService.compareVersions({
        entityType,
        entityId,
        fromVersion,
        toVersion
      });
      setComparison(response);
      setShowComparison(true);
    } catch (err) {
      setError('Failed to compare versions');
      console.error(err);
    }
  };

  const handleRestoreVersion = async () => {
    if (targetVersion === null) return;

    try {
      await versionControlService.restoreVersion({
        entityType,
        entityId,
        targetVersion,
        restoreNotes
      });
      
      setShowRestoreDialog(false);
      if (onRestore) {
        onRestore();
      }
      loadHistory(); // Reload history
    } catch (err) {
      setError('Failed to restore version');
      console.error(err);
    }
  };

  const getChangeSourceIcon = (source: ChangeSource) => {
    switch (source) {
      case 'ai_generated':
        return '🤖';
      case 'human_edit':
        return '👤';
      case 'system':
        return '⚙️';
      case 'import':
        return '📥';
      default:
        return '📝';
    }
  };

  const getChangeSourceColor = (source: ChangeSource) => {
    switch (source) {
      case 'ai_generated':
        return 'text-purple-600';
      case 'human_edit':
        return 'text-blue-600';
      case 'system':
        return 'text-gray-600';
      case 'import':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading version history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Version History</h2>
              <p className="text-sm text-gray-600 mt-1">{history?.entityTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {history && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Changes</p>
                  <p className="text-2xl font-bold text-gray-900">{history.summary.totalChanges}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600">AI Changes</p>
                  <p className="text-2xl font-bold text-purple-900">{history.summary.aiChanges}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600">Human Changes</p>
                  <p className="text-2xl font-bold text-blue-900">{history.summary.humanChanges}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Contributors</p>
                  <p className="text-2xl font-bold text-green-900">{history.summary.contributors.length}</p>
                </div>
              </div>

              {/* Version List */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {history.versions.map((version, index) => (
                    <div key={version.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-2xl">{getChangeSourceIcon(version.changeSource)}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">Version {version.versionNumber}</span>
                              <span className={`text-sm ${getChangeSourceColor(version.changeSource)}`}>
                                {version.changeSource.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-gray-500">
                                by {history.summary.contributors.find(c => c.userId === version.changedBy)?.userName || 'Unknown'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{formatDate(version.changedAt)}</p>
                            {version.changeDescription && (
                              <p className="text-sm text-gray-700 mt-2">{version.changeDescription}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {index > 0 && (
                            <button
                              onClick={() => handleCompareVersions(version.versionNumber - 1, version.versionNumber)}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                              Compare with Previous
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setTargetVersion(version.versionNumber);
                              setShowRestoreDialog(true);
                            }}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributors */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Contributors</h3>
                <div className="flex flex-wrap gap-3">
                  {history.summary.contributors.map(contributor => (
                    <div key={contributor.userId} className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                      <span className="text-sm font-medium text-gray-700">{contributor.userName}</span>
                      <span className="text-xs text-gray-500">({contributor.changeCount} changes)</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Version Comparison Modal */}
      {showComparison && comparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Version Comparison: v{comparison.fromVersion.versionNumber} → v{comparison.toVersion.versionNumber}
              </h3>
              <button
                onClick={() => setShowComparison(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Additions</p>
                <p className="text-2xl font-bold text-green-600">+{comparison.additions}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Deletions</p>
                <p className="text-2xl font-bold text-red-600">-{comparison.deletions}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Modifications</p>
                <p className="text-2xl font-bold text-yellow-600">~{comparison.modifications}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {comparison.diff.map((change, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{change.field || 'Content'}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        change.type === 'added' ? 'bg-green-100 text-green-800' :
                        change.type === 'removed' ? 'bg-red-100 text-red-800' :
                        change.type === 'modified' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {change.type}
                      </span>
                    </div>
                    
                    {change.lineChanges ? (
                      <div className="space-y-1 font-mono text-sm">
                        {change.lineChanges.map((line, lineIndex) => (
                          <div
                            key={lineIndex}
                            className={`px-2 py-1 rounded ${
                              line.type === 'added' ? 'bg-green-50 text-green-900' :
                              line.type === 'removed' ? 'bg-red-50 text-red-900' :
                              'bg-gray-50 text-gray-700'
                            }`}
                          >
                            <span className="select-none mr-2">
                              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                            </span>
                            {line.content}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {change.oldValue && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Previous</p>
                            <p className="text-sm text-gray-700 bg-red-50 p-2 rounded">
                              {typeof change.oldValue === 'object' ? JSON.stringify(change.oldValue, null, 2) : change.oldValue}
                            </p>
                          </div>
                        )}
                        {change.newValue && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">New</p>
                            <p className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                              {typeof change.newValue === 'object' ? JSON.stringify(change.newValue, null, 2) : change.newValue}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Version Dialog */}
      {showRestoreDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Restore Version {targetVersion}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to restore this version? This will create a new version with the content from version {targetVersion}.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Restore Notes (optional)
              </label>
              <textarea
                value={restoreNotes}
                onChange={(e) => setRestoreNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Explain why you're restoring this version..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRestoreDialog(false);
                  setRestoreNotes('');
                  setTargetVersion(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreVersion}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Restore Version
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};