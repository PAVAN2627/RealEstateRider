/**
 * User Service
 * 
 * Provides Firestore operations for user management including:
 * - Creating user documents
 * - Retrieving users by ID
 * - Updating user profiles
 * - Updating verification status
 * - Retrieving users by role
 * 
 * Requirements: 1.1, 3.6, 12.2, 12.3, 12.4
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { User, UserRole, VerificationStatus } from '../types/user.types';
import { createNotification } from './notificationService';
import { NotificationType } from '../types/notification.types';
import { logActivity } from './activityLogService';
import { cascadeDeleteUser } from './cascadingDeleteService';
import { getAgentProfile, updateAgentProfile } from './agentProfileService';

/**
 * Creates a user document in Firestore
 * 
 * @param user - User object to create
 * @returns Promise that resolves when user is created
 * @throws Error if user creation fails
 * 
 * Requirements: 1.1
 */
export async function createUserDocument(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      ...user,
      createdAt: user.createdAt || Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    throw new Error('Failed to create user document. Please try again.');
  }
}

/**
 * Retrieves a user by their ID
 * 
 * @param userId - The user's UID
 * @returns Promise that resolves to the User object or null if not found
 * @throws Error if retrieval fails
 * 
 * Requirements: 1.1
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error('Failed to retrieve user. Please try again.');
  }
}

/**
 * Updates a user's profile information
 * 
 * @param userId - The user's UID
 * @param profileData - Partial user data to update
 * @returns Promise that resolves when profile is updated
 * @throws Error if update fails
 * 
 * Requirements: 12.2
 */
export async function updateUserProfile(
  userId: string, 
  profileData: Partial<User>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      lastLoginAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile. Please try again.');
  }
}

/**
 * Updates a user's verification status (admin only)
 * 
 * @param userId - The user's UID
 * @param status - New verification status
 * @param adminId - The admin's UID performing the action
 * @returns Promise that resolves when status is updated
 * @throws Error if update fails
 * 
 * Requirements: 3.6, 12.3, 15.4, 18.5
 */
export async function updateVerificationStatus(
  userId: string, 
  status: VerificationStatus,
  adminId: string
): Promise<void> {
  try {
    // Get user to check their role
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      verificationStatus: status,
    });

    // If user is an agent, also update their agent profile verified status
    if (user.role === UserRole.AGENT) {
      const agentProfile = await getAgentProfile(userId);
      if (agentProfile) {
        await updateAgentProfile(agentProfile.id, {
          verified: status === VerificationStatus.APPROVED
        });
      }
    }

    // Create notification for user based on status change
    // Requirement 15.4: Trigger notification when admin approves/rejects user account
    if (status === VerificationStatus.APPROVED) {
      await createNotification({
        userId,
        message: 'Your account has been approved! You can now access all platform features.',
        type: NotificationType.ACCOUNT_APPROVED,
        relatedEntityId: userId,
      });

      // Log user approval activity
      // Requirement 18.5: Log user approval events
      await logActivity({
        userId: adminId,
        actionType: 'user_approved',
        entityId: userId,
        metadata: {
          approvedUserId: userId
        }
      });
    } else if (status === VerificationStatus.REJECTED) {
      await createNotification({
        userId,
        message: 'Your account registration was rejected. Please contact support for more information.',
        type: NotificationType.ACCOUNT_REJECTED,
        relatedEntityId: userId,
      });

      // Log user rejection activity
      // Requirement 18.5: Log user rejection events
      await logActivity({
        userId: adminId,
        actionType: 'user_rejected',
        entityId: userId,
        metadata: {
          rejectedUserId: userId
        }
      });
    }
  } catch (error) {
    console.error('Error updating verification status:', error);
    throw new Error('Failed to update verification status. Please try again.');
  }
}

/**
 * Retrieves all users with a specific role
 * 
 * @param role - The user role to filter by
 * @returns Promise that resolves to an array of User objects
 * @throws Error if retrieval fails
 * 
 * Requirements: 12.4
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', role));
    const querySnapshot = await getDocs(q);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw new Error('Failed to retrieve users. Please try again.');
  }
}

/**
 * Retrieves all users from the database
 * 
 * @returns Promise that resolves to an array of all User objects
 * @throws Error if retrieval fails
 * 
 * Requirements: 12.1
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw new Error('Failed to retrieve users. Please try again.');
  }
}

/**
 * Deletes a user and all associated data (admin only)
 * 
 * @param userId - The user's UID to delete
 * @returns Promise that resolves when user is deleted
 * @throws Error if deletion fails
 * 
 * Requirements: 12.7, 20.4
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    // Use cascading delete to remove user and all associated data
    // Requirement 20.4: Delete all user's properties, inquiries, wishlist, and notifications
    await cascadeDeleteUser(userId);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user. Please try again.');
  }
}
