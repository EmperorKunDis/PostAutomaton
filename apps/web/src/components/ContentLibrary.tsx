import React, { useEffect, useState } from 'react';
import { useContentLibraryStore } from '../stores/contentLibraryStore';

interface ContentLibraryProps {
  companyId: string;
}

export const ContentLibrary: React.FC<ContentLibraryProps> = ({ companyId }) => {
  const {
    assets,
    snippets,
    mediaAssets,
    availableTags,
    totalCount,
    totalPages,
    currentPage,
    filters,
    sort,
    loading,
    error,
    selectedAssets,
    showTagManager,
    showSnippetEditor,
    searchContent,
    updateFilters,
    updateSort,
    loadPage,
    selectAsset,
    deselectAsset,
    clearSelection,
    updateAsset,
    createTag,
    setShowTagManager,
    createSnippet,
    setShowSnippetEditor,
    syncExistingContent
  } = useContentLibraryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    searchContent(companyId);
  }, [companyId, searchContent]);

  const handleSearch = () => {
    updateFilters({
      search: searchTerm || undefined,
      type: selectedTypes.length > 0 ? selectedTypes as any : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses as any : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined
    });
    searchContent(companyId);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedTags([]);
    updateFilters({});
    searchContent(companyId);
  };

  const handleSortChange = (field: string) => {
    const newDirection = sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc';
    updateSort({ field: field as any, direction: newDirection });
    searchContent(companyId);
  };

  const handleAssetSelect = (assetId: string, selected: boolean) => {
    if (selected) {
      selectAsset(assetId);
    } else {
      deselectAsset(assetId);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    for (const assetId of selectedAssets) {
      await updateAsset(assetId, { status: status as any });
    }
    clearSelection();
    searchContent(companyId);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      published: 'bg-blue-100 text-blue-800',
      archived: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      blog_post: '📝',
      social_post: '📱',
      reusable_snippet: '✂️',
      visual_asset: '🎨',
      media_asset: '📁'
    };
    return icons[type] || '📄';
  };

  if (loading && assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading content library...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
            <p className="text-gray-600">Manage and organize all your content assets</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSnippetEditor(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Snippet
            </button>
            <button
              onClick={() => setShowTagManager(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Manage Tags
            </button>
            <button
              onClick={() => syncExistingContent(companyId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sync Content
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <select
                multiple
                value={selectedTypes}
                onChange={(e) => setSelectedTypes(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="blog_post">Blog Posts</option>
                <option value="social_post">Social Posts</option>
                <option value="reusable_snippet">Snippets</option>
                <option value="visual_asset">Visual Assets</option>
                <option value="media_asset">Media Assets</option>
              </select>
            </div>

            <div>
              <select
                multiple
                value={selectedStatuses}
                onChange={(e) => setSelectedStatuses(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <select
                multiple
                value={selectedTags}
                onChange={(e) => setSelectedTags(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableTags.map(tag => (
                  <option key={tag.id} value={tag.name}>{tag.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{totalCount} items</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAssets.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">{selectedAssets.length} items selected</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate('approved')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('archived')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Archive All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Content Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Assets */}
          {assets.map(asset => (
            <div key={asset.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTypeIcon(asset.type)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 truncate">{asset.title}</h3>
                    <p className="text-sm text-gray-500">{asset.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedAssets.includes(asset.id)}
                  onChange={(e) => handleAssetSelect(asset.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{asset.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Updated {formatDate(asset.updatedAt)}</span>
                <span>Used {asset.timesUsed || 0} times</span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                  {asset.status.replace('_', ' ')}
                </span>
                <div className="flex space-x-1">
                  {asset.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {asset.tags && asset.tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{asset.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Snippets */}
          {snippets.map(snippet => (
            <div key={snippet.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✂️</span>
                  <div>
                    <h3 className="font-medium text-gray-900 truncate">{snippet.title}</h3>
                    <p className="text-sm text-gray-500">Reusable Snippet</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedAssets.includes(snippet.id)}
                  onChange={(e) => handleAssetSelect(snippet.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{snippet.content}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Updated {formatDate(snippet.updatedAt)}</span>
                <span>Used {snippet.timesUsed || 0} times</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {snippet.type}
                </span>
                <div className="flex space-x-1">
                  {snippet.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Media Assets */}
          {mediaAssets.map(media => (
            <div key={media.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📁</span>
                  <div>
                    <h3 className="font-medium text-gray-900 truncate">{media.title}</h3>
                    <p className="text-sm text-gray-500">{media.mimeType}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedAssets.includes(media.id)}
                  onChange={(e) => handleAssetSelect(media.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              {media.thumbnailUrl && (
                <img
                  src={media.thumbnailUrl}
                  alt={media.title}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Uploaded {formatDate(media.uploadedAt)}</span>
                <span>{Math.round((media.fileSize || 0) / 1024)} KB</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Media Asset
                </span>
                <div className="flex space-x-1">
                  {media.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-4 text-sm font-medium text-gray-500">
              <div className="w-8"></div>
              <div className="flex-1 cursor-pointer" onClick={() => handleSortChange('title')}>
                Title {sort.field === 'title' && (sort.direction === 'desc' ? '↓' : '↑')}
              </div>
              <div className="w-24">Type</div>
              <div className="w-24">Status</div>
              <div className="w-32 cursor-pointer" onClick={() => handleSortChange('updatedAt')}>
                Updated {sort.field === 'updatedAt' && (sort.direction === 'desc' ? '↓' : '↑')}
              </div>
              <div className="w-24 cursor-pointer" onClick={() => handleSortChange('timesUsed')}>
                Usage {sort.field === 'timesUsed' && (sort.direction === 'desc' ? '↓' : '↑')}
              </div>
              <div className="w-32">Tags</div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {[...assets, ...snippets, ...mediaAssets].map(item => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(item.id)}
                    onChange={(e) => handleAssetSelect(item.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span>{getTypeIcon('type' in item ? item.type : 'reusable_snippet')}</span>
                      <span className="font-medium text-gray-900">{item.title}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {'description' in item ? item.description : 'content' in item ? item.content : ''}
                    </p>
                  </div>
                  <div className="w-24">
                    <span className="text-sm text-gray-600 capitalize">
                      {'type' in item ? item.type.replace('_', ' ') : 'snippet'}
                    </span>
                  </div>
                  <div className="w-24">
                    {'status' in item ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="w-32 text-sm text-gray-500">
                    {formatDate('updatedAt' in item ? item.updatedAt : (item as any).createdAt || new Date())}
                  </div>
                  <div className="w-24 text-sm text-gray-500">
                    {item.timesUsed || 0} times
                  </div>
                  <div className="w-32">
                    <div className="flex space-x-1">
                      {item.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {item.tags && item.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{item.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages} ({totalCount} total items)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => loadPage(currentPage - 1, companyId)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, currentPage - 2) + i;
              if (page > totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => loadPage(page, companyId)}
                  className={`px-3 py-2 border rounded-lg text-sm ${
                    page === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => loadPage(currentPage + 1, companyId)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && assets.length === 0 && snippets.length === 0 && mediaAssets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-500 mb-6">
            {Object.keys(filters).length > 0 
              ? 'Try adjusting your search filters or create new content.'
              : 'Start by creating some content or sync your existing content.'
            }
          </p>
          <button
            onClick={() => syncExistingContent(companyId)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sync Existing Content
          </button>
        </div>
      )}
    </div>
  );
};