import React, { useEffect, useState } from 'react';
import { 
  Notification,
  NotificationType,
  NotificationStatus 
} from '@internal-marketing-content-app/shared';
import { useCommentsStore } from '../stores/commentsStore';
import { Bell, BellOff, Check, MessageSquare, AtSign, AlertCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  className?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  className = ''
}) => {
  const {
    notifications,
    unreadCount,
    loadingNotifications,
    loadNotifications,
    markNotificationsAsRead,
    error
  } = useCommentsStore();
  
  const [showPanel, setShowPanel] = useState(false);
  const [filter, setFilter] = useState<NotificationStatus | 'all'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-green-500" />;
      case 'status_change':
        return <Check className="w-4 h-4 text-orange-500" />;
      case 'approval_request':
      case 'approval_response':
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'comment': return 'Comment';
      case 'mention': return 'Mention';
      case 'status_change': return 'Status Change';
      case 'approval_request': return 'Approval Request';
      case 'approval_response': return 'Approval Response';
      default: return 'Notification';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.status === filter;
  });

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await markNotificationsAsRead(notificationIds);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => n.status === 'unread')
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      await handleMarkAsRead(unreadIds);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification bell button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        title={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
      >
        {unreadCount > 0 ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications panel */}
      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`
                  px-3 py-1 text-sm rounded-md transition-colors
                  ${filter === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`
                  px-3 py-1 text-sm rounded-md transition-colors
                  ${filter === 'unread' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Notifications list */}
          <div className="max-h-64 overflow-y-auto">
            {loadingNotifications ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`
                      p-4 hover:bg-gray-50 transition-colors cursor-pointer
                      ${notification.status === 'unread' ? 'bg-blue-50 border-l-2 border-blue-500' : ''}
                    `}
                    onClick={() => {
                      if (notification.status === 'unread') {
                        handleMarkAsRead([notification.id]);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {getTypeLabel(notification.type)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>

                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {notification.title}
                        </h4>

                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>

                        {/* Comment preview */}
                        {notification.commentContent && (
                          <div className="p-2 bg-gray-100 rounded-md">
                            <p className="text-xs text-gray-600 line-clamp-2">
                              "{notification.commentContent}"
                            </p>
                          </div>
                        )}

                        {/* Entity info */}
                        <div className="mt-2 text-xs text-gray-500">
                          {notification.entityTitle}
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {notification.status === 'unread' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  // Could navigate to a full notifications page
                  console.log('View all notifications');
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {showPanel && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  );
};