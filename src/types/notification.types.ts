import { Timestamp } from 'firebase/firestore';

/**
 * Types of notifications in the system
 */
export enum NotificationType {
  INQUIRY_RESPONSE = 'inquiry_response',
  PROPERTY_APPROVED = 'property_approved',
  PROPERTY_REJECTED = 'property_rejected',
  ACCOUNT_APPROVED = 'account_approved',
  ACCOUNT_REJECTED = 'account_rejected',
  NEW_INQUIRY = 'new_inquiry'
}

/**
 * Notification interface matching Firestore notifications collection
 */
export interface Notification {
  id: string;                     // Document ID
  userId: string;                 // Reference to users collection
  message: string;
  type: NotificationType;
  relatedEntityId?: string;       // Property ID, Inquiry ID, etc.
  read: boolean;
  createdAt: Timestamp;
}

/**
 * Action types for activity logging
 */
export type ActionType = 
  | 'login'
  | 'logout'
  | 'property_created'
  | 'property_updated'
  | 'property_deleted'
  | 'inquiry_created'
  | 'inquiry_responded'
  | 'user_approved'
  | 'user_rejected'
  | 'property_approved'
  | 'property_rejected';

/**
 * ActivityLog interface matching Firestore activityLogs collection
 */
export interface ActivityLog {
  id: string;                     // Document ID
  userId: string;                 // Reference to users collection
  actionType: ActionType;
  entityId?: string;              // Related entity ID (property, inquiry, etc.)
  metadata?: Record<string, any>; // Additional action-specific data
  timestamp: Timestamp;
}
