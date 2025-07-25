import React from 'react';
import { ContentTopic } from '@internal-marketing-content-app/shared';

interface ContentTopicCalendarProps {
  topics: ContentTopic[];
  year: number;
  onTopicClick?: (topic: ContentTopic) => void;
  onMonthClick?: (month: number) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_COLORS = [
  'bg-blue-50 border-blue-200', 'bg-purple-50 border-purple-200', 'bg-green-50 border-green-200',
  'bg-yellow-50 border-yellow-200', 'bg-pink-50 border-pink-200', 'bg-indigo-50 border-indigo-200',
  'bg-red-50 border-red-200', 'bg-teal-50 border-teal-200', 'bg-orange-50 border-orange-200',
  'bg-cyan-50 border-cyan-200', 'bg-amber-50 border-amber-200', 'bg-lime-50 border-lime-200'
];

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800 border-red-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300'
};

const STATUS_COLORS = {
  planned: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export const ContentTopicCalendar: React.FC<ContentTopicCalendarProps> = ({
  topics,
  year,
  onTopicClick,
  onMonthClick
}) => {
  const getTopicsForMonth = (month: number) => {
    return topics.filter(topic => topic.plannedMonth === month && topic.plannedYear === year);
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
    ];
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Content Calendar {year}</h2>
        <div className="text-sm text-gray-500">
          Total Topics: {topics.filter(t => t.plannedYear === year).length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MONTHS.map((monthName, monthIndex) => {
          const monthNumber = monthIndex + 1;
          const monthTopics = getTopicsForMonth(monthNumber);
          const monthColor = MONTH_COLORS[monthIndex];

          return (
            <div
              key={monthNumber}
              className={`${monthColor} rounded-lg border-2 p-4 min-h-[200px] ${
                onMonthClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
              }`}
              onClick={() => onMonthClick?.(monthNumber)}
            >
              <h3 className="font-semibold text-gray-900 mb-3 text-center">
                {monthName}
              </h3>
              
              <div className="space-y-2">
                {monthTopics.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No topics planned
                  </div>
                ) : (
                  monthTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`bg-white rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                        onTopicClick ? 'hover:bg-gray-50' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTopicClick?.(topic);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {topic.title}
                        </h4>
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(topic.category.id)} flex-shrink-0 ml-2`} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[topic.priority]}`}>
                          {topic.priority}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[topic.status]}`}>
                          {topic.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {topic.keywords.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {topic.keywords.slice(0, 3).map((keyword, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                              >
                                {keyword}
                              </span>
                            ))}
                            {topic.keywords.length > 3 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                                +{topic.keywords.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {monthTopics.length > 0 && (
                <div className="mt-3 text-center text-xs text-gray-600">
                  {monthTopics.length} topic{monthTopics.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Priority:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">High</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Medium</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Status:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Planned</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};