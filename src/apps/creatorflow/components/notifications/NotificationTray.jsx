import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  DollarSign, 
  MessageSquare,
  Eye,
  CheckCircle2,
  AlarmClockOff,
  X,
  MoreHorizontal
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useNotifications } from "./NotificationContext";

export default function NotificationTray({ onVideoClick, onDealClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, dismissNotification, snoozeNotification } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'due_today':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'schedule_changed':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'deal_status':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'mention':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsOpen(false);

    if (notification.videoId && onVideoClick) {
      onVideoClick(notification.videoId);
    } else if (notification.dealId && onDealClick) {
      onDealClick(notification.dealId);
    }
  };

  const handleAction = (e, notificationId, action) => {
    e.stopPropagation();

    switch (action) {
      case 'complete':
        // This would normally update the video status
        dismissNotification(notificationId);
        break;
      case 'snooze':
        snoozeNotification(notificationId);
        break;
      case 'dismiss':
        dismissNotification(notificationId);
        break;
      case 'view':
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
          handleNotificationClick(notification);
        }
        break;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;

    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return format(timestamp, 'MMM d');
    return format(timestamp, 'MMM d, yyyy');
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-hidden shadow-lg z-50 bg-white border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-gray-500 mb-2">
                          {notification.context}
                        </p>

                        <div className="flex items-center gap-1">
                          {notification.actions.includes('view') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => handleAction(e, notification.id, 'view')}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                          {notification.actions.includes('complete') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => handleAction(e, notification.id, 'complete')}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          )}
                          {notification.actions.includes('snooze') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => handleAction(e, notification.id, 'snooze')}
                            >
                              <AlarmClockOff className="w-3 h-3 mr-1" />
                              Snooze
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1 text-xs ml-auto"
                            onClick={(e) => handleAction(e, notification.id, 'dismiss')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}