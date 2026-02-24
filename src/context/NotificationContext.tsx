/**
 * Notification Context
 * 
 * Provides notification state management and operations throughout the app.
 * Manages notifications list, unread count, and notification operations.
 * Sets up real-time listener for notifications.
 * 
 * Requirements: 15.5, 15.6, 15.7
 */

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { collection, query, where, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { Notification } from '../types/notification.types';
import * as notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

/**
 * Notification context value interface
 */
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

/**
 * Notification context
 */
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

/**
 * NotificationProvider props
 */
interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Notification Provider Component
 * 
 * Wraps the app and provides notification state to all child components.
 * Sets up real-time Firestore listener to sync notification state.
 * 
 * Requirements:
 * - 15.5: Display unread notification count
 * - 15.6: Mark notifications as read
 * - 15.7: Store notifications with user ID, message, timestamp, and read status
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Compute unread notification count
   * 
   * Calculates the number of unread notifications from the notifications array.
   * 
   * @returns number - Count of unread notifications
   * 
   * Requirement 15.5: Display unread notification count in the user interface header
   */
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);

  /**
   * Set up real-time Firestore listener for notifications
   * 
   * Subscribes to notifications collection for the authenticated user.
   * Updates notifications state in real-time when changes occur.
   * 
   * Requirement 15.7: Store notifications in the Database with user ID, message, timestamp, and read status
   */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    let unsubscribe: Unsubscribe;

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const notificationsList: Notification[] = [];
          querySnapshot.forEach((doc) => {
            notificationsList.push({
              id: doc.id,
              ...doc.data()
            } as Notification);
          });
          setNotifications(notificationsList);
        },
        (error) => {
          console.error('Error listening to notifications:', error);
          setNotifications([]);
        }
      );
    } catch (error) {
      console.error('Error setting up notifications listener:', error);
      setNotifications([]);
    }

    // Cleanup subscription on unmount or user change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  /**
   * Mark a specific notification as read
   * 
   * Updates the notification's read status to true in Firestore.
   * The real-time listener will automatically update the local state.
   * 
   * @param notificationId - ID of the notification to mark as read
   * @throws Error if marking as read fails
   * 
   * Requirement 15.6: Mark notification as read when user views it
   */
  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  /**
   * Mark all notifications as read
   * 
   * Updates all unread notifications for the current user to read status.
   * The real-time listener will automatically update the local state.
   * 
   * @throws Error if marking all as read fails
   * 
   * Requirement 15.6: Mark notification as read when user views it
   */
  const markAllAsRead = async (): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to mark notifications as read');
    }

    try {
      await notificationService.markAllAsRead(user.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Custom hook to use notification context
 * 
 * @returns NotificationContextValue - Notification context value
 * @throws Error if used outside NotificationProvider
 * 
 * Requirement 15.5: Access notification state throughout the app
 */
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
