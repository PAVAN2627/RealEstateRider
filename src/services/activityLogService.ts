import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  Query,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { ActivityLog, ActionType } from '../types/notification.types';

/**
 * Activity log data structure
 */
export interface LogActivityData {
  userId: string;
  actionType: ActionType;
  entityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Log a user activity to the activityLogs collection
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */
export async function logActivity(data: LogActivityData): Promise<string> {
  try {
    const activityData = {
      userId: data.userId,
      actionType: data.actionType,
      entityId: data.entityId || null,
      metadata: data.metadata || null,
      timestamp: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'activityLogs'), activityData);
    return docRef.id;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw new Error('Failed to log activity');
  }
}

/**
 * Filter options for activity logs
 */
export interface ActivityLogFilters {
  userId?: string;
  actionType?: ActionType;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Get activity logs with optional filtering
 * Requirements: 18.6, 18.7
 */
export async function getActivityLogs(filters?: ActivityLogFilters): Promise<ActivityLog[]> {
  try {
    let q: Query<DocumentData> = collection(db, 'activityLogs');
    const constraints: any[] = [];

    // Apply filters
    if (filters?.userId) {
      constraints.push(where('userId', '==', filters.userId));
    }

    if (filters?.actionType) {
      constraints.push(where('actionType', '==', filters.actionType));
    }

    if (filters?.startDate) {
      constraints.push(where('timestamp', '>=', Timestamp.fromDate(filters.startDate)));
    }

    if (filters?.endDate) {
      constraints.push(where('timestamp', '<=', Timestamp.fromDate(filters.endDate)));
    }

    // Always order by timestamp descending (newest first)
    constraints.push(orderBy('timestamp', 'desc'));

    q = query(q, ...constraints);

    const querySnapshot = await getDocs(q);
    const activityLogs: ActivityLog[] = [];

    querySnapshot.forEach((doc) => {
      activityLogs.push({
        id: doc.id,
        ...doc.data()
      } as ActivityLog);
    });

    return activityLogs;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw new Error('Failed to fetch activity logs');
  }
}

/**
 * Get activity logs for a specific user
 * Requirements: 18.6, 18.7
 */
export async function getUserActivityLogs(userId: string): Promise<ActivityLog[]> {
  try {
    const q = query(
      collection(db, 'activityLogs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const activityLogs: ActivityLog[] = [];

    querySnapshot.forEach((doc) => {
      activityLogs.push({
        id: doc.id,
        ...doc.data()
      } as ActivityLog);
    });

    return activityLogs;
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    throw new Error('Failed to fetch user activity logs');
  }
}
