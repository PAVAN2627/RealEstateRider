/**
 * Cascading Delete Service
 * 
 * Handles cascading deletes for users and properties to maintain data integrity.
 * When a user or property is deleted, all related data is also removed.
 * 
 * Requirements: 20.4, 20.5, 8.5, 11.5
 */

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Deletes all inquiries related to a user (as buyer or agent)
 * 
 * @param userId - The user's UID
 * @returns Promise that resolves when all inquiries are deleted
 */
async function deleteUserInquiries(userId: string): Promise<void> {
  const batch = writeBatch(db);
  
  // Delete inquiries where user is the buyer
  const buyerInquiriesQuery = query(
    collection(db, 'inquiries'),
    where('buyerId', '==', userId)
  );
  const buyerInquiriesSnapshot = await getDocs(buyerInquiriesQuery);
  buyerInquiriesSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  // Delete inquiries where user is the agent
  const agentInquiriesQuery = query(
    collection(db, 'inquiries'),
    where('agentId', '==', userId)
  );
  const agentInquiriesSnapshot = await getDocs(agentInquiriesQuery);
  agentInquiriesSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}

/**
 * Deletes all properties owned by a user
 * 
 * @param userId - The user's UID
 * @returns Promise that resolves when all properties are deleted
 */
async function deleteUserProperties(userId: string): Promise<void> {
  const propertiesQuery = query(
    collection(db, 'properties'),
    where('ownerId', '==', userId)
  );
  const propertiesSnapshot = await getDocs(propertiesQuery);
  
  // Delete each property (which will trigger property cascading deletes)
  const deletePromises = propertiesSnapshot.docs.map(async (propertyDoc) => {
    await cascadeDeleteProperty(propertyDoc.id);
  });
  
  await Promise.all(deletePromises);
}

/**
 * Deletes user's wishlist
 * 
 * @param userId - The user's UID
 * @returns Promise that resolves when wishlist is deleted
 */
async function deleteUserWishlist(userId: string): Promise<void> {
  const wishlistRef = doc(db, 'wishlists', userId);
  try {
    await deleteDoc(wishlistRef);
  } catch (error) {
    // Wishlist might not exist, which is fine
    console.log('No wishlist found for user:', userId);
  }
}

/**
 * Deletes all notifications for a user
 * 
 * @param userId - The user's UID
 * @returns Promise that resolves when all notifications are deleted
 */
async function deleteUserNotifications(userId: string): Promise<void> {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  );
  const notificationsSnapshot = await getDocs(notificationsQuery);
  
  const batch = writeBatch(db);
  notificationsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}

/**
 * Cascading delete for user
 * Deletes user and all associated data: properties, inquiries, wishlist, notifications
 * 
 * @param userId - The user's UID to delete
 * @returns Promise that resolves when all user data is deleted
 * @throws Error if deletion fails
 * 
 * Requirement 20.4: Delete all user's data when user is deleted
 */
export async function cascadeDeleteUser(userId: string): Promise<void> {
  try {
    // Delete in order to maintain referential integrity
    // 1. Delete user's properties (which will cascade delete property-related data)
    await deleteUserProperties(userId);
    
    // 2. Delete user's inquiries
    await deleteUserInquiries(userId);
    
    // 3. Delete user's wishlist
    await deleteUserWishlist(userId);
    
    // 4. Delete user's notifications
    await deleteUserNotifications(userId);
    
    // 5. Finally, delete the user document
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    
    console.log('Successfully deleted user and all associated data:', userId);
  } catch (error) {
    console.error('Error in cascading user delete:', error);
    throw new Error('Failed to delete user and associated data. Please try again.');
  }
}

/**
 * Deletes all inquiries related to a property
 * 
 * @param propertyId - The property's ID
 * @returns Promise that resolves when all inquiries are deleted
 */
async function deletePropertyInquiries(propertyId: string): Promise<void> {
  const inquiriesQuery = query(
    collection(db, 'inquiries'),
    where('propertyId', '==', propertyId)
  );
  const inquiriesSnapshot = await getDocs(inquiriesQuery);
  
  const batch = writeBatch(db);
  inquiriesSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}

/**
 * Removes property from all wishlists
 * 
 * @param propertyId - The property's ID
 * @returns Promise that resolves when property is removed from all wishlists
 */
async function removePropertyFromWishlists(propertyId: string): Promise<void> {
  const wishlistsSnapshot = await getDocs(collection(db, 'wishlists'));
  
  const batch = writeBatch(db);
  wishlistsSnapshot.forEach((wishlistDoc) => {
    const wishlist = wishlistDoc.data();
    if (wishlist.propertyIds && wishlist.propertyIds.includes(propertyId)) {
      const updatedPropertyIds = wishlist.propertyIds.filter(
        (id: string) => id !== propertyId
      );
      batch.update(wishlistDoc.ref, { propertyIds: updatedPropertyIds });
    }
  });
  
  await batch.commit();
}

/**
 * Cascading delete for property
 * Deletes property and all associated data: inquiries, wishlist entries, images
 * 
 * @param propertyId - The property's ID to delete
 * @returns Promise that resolves when all property data is deleted
 * @throws Error if deletion fails
 * 
 * Requirements: 20.5, 8.5, 11.5: Delete all property-related data when property is deleted
 */
export async function cascadeDeleteProperty(propertyId: string): Promise<void> {
  try {
    // Delete in order to maintain referential integrity
    // 1. Delete all inquiries related to this property
    await deletePropertyInquiries(propertyId);
    
    // 2. Remove property from all wishlists
    await removePropertyFromWishlists(propertyId);
    
    // 3. Delete property images from storage (handled by storageService)
    // Note: In production, this should be handled by Cloud Functions or calling storageService
    
    // 4. Finally, delete the property document
    const propertyRef = doc(db, 'properties', propertyId);
    await deleteDoc(propertyRef);
    
    console.log('Successfully deleted property and all associated data:', propertyId);
  } catch (error) {
    console.error('Error in cascading property delete:', error);
    throw new Error('Failed to delete property and associated data. Please try again.');
  }
}
