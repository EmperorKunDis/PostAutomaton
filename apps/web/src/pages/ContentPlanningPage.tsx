import React, { useState, useEffect } from 'react';
import { ContentTopic, GenerateContentTopicsRequest, UpdateContentTopicRequest } from '@internal-marketing-content-app/shared';
import { useContentTopicsStore } from '../stores/contentTopicsStore';
import { ContentTopicGenerationForm } from '../components/ContentTopicGenerationForm';
import { ContentTopicCalendar } from '../components/ContentTopicCalendar';
import { ContentTopicForm } from '../components/ContentTopicForm';

type ViewMode = 'calendar' | 'generate' | 'edit';

interface ContentPlanningPageState {
  view: ViewMode;
  selectedTopic: ContentTopic | null;
  selectedYear: number;
  selectedMonth: number | null;
}

export const ContentPlanningPage: React.FC = () => {
  const {
    topics,
    categories,
    isLoading,
    isGenerating,
    error,
    generateTopics,
    loadTopics,
    loadCategories,
    getTopic,
    updateTopic,
    deleteTopic,
    clearError
  } = useContentTopicsStore();

  const [pageState, setPageState] = useState<ContentPlanningPageState>({
    view: 'calendar',
    selectedTopic: null,
    selectedYear: new Date().getFullYear(),
    selectedMonth: null
  });

  useEffect(() => {
    loadCategories();
    loadTopics();
  }, [loadCategories, loadTopics]);

  const handleGenerateTopics = async (request: GenerateContentTopicsRequest) => {
    try {
      await generateTopics(request);
      setPageState(prev => ({ ...prev, view: 'calendar' }));
    } catch (error) {
      console.error('Failed to generate topics:', error);
    }
  };

  const handleEditTopic = async (topic: ContentTopic) => {
    setPageState(prev => ({
      ...prev,
      view: 'edit',
      selectedTopic: topic
    }));
  };

  const handleUpdateTopic = async (updateData: UpdateContentTopicRequest) => {
    if (!pageState.selectedTopic) return;
    
    try {
      await updateTopic(pageState.selectedTopic.id, updateData);
      setPageState(prev => ({
        ...prev,
        view: 'calendar',
        selectedTopic: null
      }));
    } catch (error) {
      console.error('Failed to update topic:', error);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await deleteTopic(topicId);
      } catch (error) {
        console.error('Failed to delete topic:', error);
      }
    }
  };

  const handleMonthClick = (month: number) => {
    setPageState(prev => ({
      ...prev,
      selectedMonth: prev.selectedMonth === month ? null : month
    }));
  };

  const handleYearChange = (year: number) => {
    setPageState(prev => ({ ...prev, selectedYear: year }));
  };

  const filteredTopics = pageState.selectedMonth
    ? topics.filter(topic => 
        topic.plannedMonth === pageState.selectedMonth && 
        topic.plannedYear === pageState.selectedYear
      )
    : topics.filter(topic => topic.plannedYear === pageState.selectedYear);

  const renderContent = () => {
    switch (pageState.view) {
      case 'generate':
        return (
          <ContentTopicGenerationForm
            onSubmit={handleGenerateTopics}
            categories={categories}
            isLoading={isGenerating}
          />
        );
      
      case 'edit':
        return pageState.selectedTopic ? (
          <ContentTopicForm
            topic={pageState.selectedTopic}
            categories={categories}
            onSubmit={handleUpdateTopic}
            onCancel={() => setPageState(prev => ({ 
              ...prev, 
              view: 'calendar', 
              selectedTopic: null 
            }))}
            isLoading={isLoading}
          />
        ) : null;
      
      case 'calendar':
      default:
        return (
          <div className="space-y-6">
            {/* Year Navigation and Controls */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleYearChange(pageState.selectedYear - 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {pageState.selectedYear} Content Planning
                    </h1>
                    <button
                      onClick={() => handleYearChange(pageState.selectedYear + 1)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {pageState.selectedMonth && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Filtered by:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {new Date(pageState.selectedYear, pageState.selectedMonth - 1).toLocaleDateString('en-US', { month: 'long' })}
                        <button
                          onClick={() => handleMonthClick(pageState.selectedMonth!)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setPageState(prev => ({ ...prev, view: 'generate' }))}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Generate Topics
                  </button>
                  
                  <button
                    onClick={() => loadTopics()}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <ContentTopicCalendar
              topics={filteredTopics}
              year={pageState.selectedYear}
              onTopicClick={handleEditTopic}
              onMonthClick={handleMonthClick}
            />

            {/* Topics List for Selected Month */}
            {pageState.selectedMonth && (
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(pageState.selectedYear, pageState.selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Topics
                  </h3>
                  <span className="text-sm text-gray-500">
                    {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {filteredTopics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No topics planned for this month
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredTopics.map(topic => (
                      <div
                        key={topic.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                              {topic.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {topic.description}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {topic.category.name}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                topic.priority === 'high' ? 'bg-red-100 text-red-800' :
                                topic.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {topic.priority} priority
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                topic.status === 'completed' ? 'bg-green-100 text-green-800' :
                                topic.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                topic.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {topic.status.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {topic.keywords.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {topic.keywords.slice(0, 5).map((keyword, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                  {topic.keywords.length > 5 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                                      +{topic.keywords.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditTopic(topic)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Edit topic"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTopic(topic.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete topic"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  );
};