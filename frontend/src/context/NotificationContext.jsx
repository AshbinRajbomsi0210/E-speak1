import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';

const NotificationContext = createContext();

const API_BASE_URL = 'http://127.0.0.1:8000/api/issues';

export const NotificationProvider = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef(null);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  const fetchNotifications = useCallback(async () => {
    if (!userEmail) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/?email=${encodeURIComponent(userEmail)}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [userEmail]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (isSignedIn && userEmail) {
      fetchNotifications();
      intervalRef.current = setInterval(fetchNotifications, 30000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSignedIn, userEmail, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read/`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' } }
      );
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userEmail) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/mark-all-read/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        }
      );
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [userEmail]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
