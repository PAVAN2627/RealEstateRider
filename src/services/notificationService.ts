import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { Notification, NotificationType } from '../types/notification.types';

/**
 * Create a new notification for a user
 * Requirements: 15.1, 15.2, 15.3, 15.4
 */
export async function createNotification(params: {
  userId: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: string;
}): Promise<string> {
  try {
    const notificationData = {
      userId: params.userId,
      message: params.message,
      type: params.type,
      relatedEntityId: params.relatedEntityId || null,
      read: false,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

/**
 * Get all notifications for a specific user, ordered by creation date (newest first)
 * Requirements: 15.5, 15.7
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as Notification);
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw new Error('Failed to fetch notifications');
  }
}

/**
 * Mark a specific notification as read
 * Requirements: 15.6
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
}

/**
 * Mark all notifications for a user as read
 * Requirements: 15.6
 */
export async function markAllAsRead(userId: string): Promise<void> {
  try {
    // Get all unread notifications for the user
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);

    // Use batch write for efficiency
    const batch = writeBatch(db);

    querySnapshot.forEach((document) => {
      const notificationRef = doc(db, 'notifications', document.id);
      batch.update(notificationRef, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }
}

/**
 * Get the count of unread notifications for a user
 * Requirements: 15.5
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw new Error('Failed to fetch unread count');
  }
}
