import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addNotification = (notification) => {
    setNotifications(prev => [
      {
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp: new Date(),
        read: false
      },
      ...prev
    ]);
  };

  const addToast = (toast) => {
    const toastWithId = {
      ...toast,
      id: `toast-${Date.now()}`
    };
    
    setToasts(prev => [...prev, toastWithId]);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastWithId.id));
    }, 6000);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const dismissToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const snoozeNotification = (notificationId) => {
    // Hide for 24 hours
    setNotifications(prev =>
      prev.map(n => n.id === notificationId 
        ? { ...n, snoozedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) }
        : n
      )
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read && (!n.snoozedUntil || n.snoozedUntil < new Date())).length;
  };

  const getVisibleNotifications = () => {
    return notifications.filter(n => !n.snoozedUntil || n.snoozedUntil < new Date());
  };

  return (
    <NotificationContext.Provider value={{
      notifications: getVisibleNotifications(),
      toasts,
      unreadCount: getUnreadCount(),
      addNotification,
      addToast,
      markAsRead,
      dismissNotification,
      dismissToast,
      snoozeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};