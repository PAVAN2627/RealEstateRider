/**
 * Property Service
 * 
 * Provides Firestore operations for property management including:
 * - Creating properties with pending verification status
 * - Updating properties with owner validation
 * - Deleting properties with cascading deletes
 * - Retrieving properties with filtering support
 * 
 * Requirements: 4.1, 4.2, 4.7, 5.1, 11.2, 11.3, 11.5
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  Query,
  DocumentData,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { Property, PropertyFilters, PropertyType, AvailabilityStatus } from '../types/property.types';
import { createNotification } from './notificationService';
import { NotificationType } from '../types/notification.types';
import { logActivity } from './activityLogService';
import { cascadeDeleteProperty } from './cascadingDeleteService';

/**
 * Data required to create a new property
 */
export interface CreatePropertyData {
  title: string;
  description: string;
  price: number;
  propertyType: PropertyType;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availabilityStatus: AvailabilityStatus;
  imageUrls: string[];
  ownershipDocumentUrls?: string[];
  ownerId: string;
  ownerRole: 'seller' | 'agent';
  agentId?: string;
}

/**
 * Creates a new property with pending verification status
 * 
 * @param propertyData - Property data to create
 * @returns Promise resolving to the created property with ID
 * @throws Error if property creation fails
 * 
 * Requirements: 4.1, 4.2, 4.7, 5.1, 18.3
 */
export async function createProperty(propertyData: CreatePropertyData): Promise<Property> {
  try {
    const now = Timestamp.now();
    
    const propertyDoc = {
      ...propertyData,
      verificationStatus: 'pending' as const,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'properties'), propertyDoc);
    
    const property: Property = {
      id: docRef.id,
      ...propertyDoc
    };

    // Log property creation activity
    // Requirement 18.3: Log property creation events
    await logActivity({
      userId: propertyData.ownerId,
      actionType: 'property_created',
      entityId: docRef.id,
      metadata: {
        propertyTitle: propertyData.title,
        propertyType: propertyData.propertyType,
        price: propertyData.price
      }
    });

    return property;
  } catch (error) {
    console.error('Error creating property:', error);
    throw new Error('Failed to create property. Please try again.');
  }
}

/**
 * Updates an existing property with owner validation
 * 
 * @param propertyId - ID of the property to update
 * @param propertyData - Partial property data to update
 * @param userId - ID of the user attempting the update
 * @returns Promise resolving when update is complete
 * @throws Error if user is not the owner or update fails
 * 
 * Requirements: 11.2, 18.3
 */
export async function updateProperty(
  propertyId: string,
  propertyData: Partial<Omit<Property, 'id' | 'createdAt' | 'ownerId'>>,
  userId: string
): Promise<void> {
  try {
    // First, verify ownership
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);
    
    if (!propertySnap.exists()) {
      throw new Error('Property not found');
    }
    
    const property = propertySnap.data() as Property;
    
    if (property.ownerId !== userId) {
      throw new Error('Unauthorized: You do not own this property');
    }
    
    // Update the property
    const updateData = {
      ...propertyData,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(propertyRef, updateData);

    // Log property update activity
    // Requirement 18.3: Log property update events
    await logActivity({
      userId,
      actionType: 'property_updated',
      entityId: propertyId,
      metadata: {
        propertyTitle: property.title,
        updatedFields: Object.keys(propertyData)
      }
    });
  } catch (error) {
    console.error('Error updating property:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update property. Please try again.');
  }
}

/**
 * Deletes a property with cascading deletes for inquiries and images
 * 
 * Deletes the property document and all associated data including inquiries,
 * wishlist entries, and images.
 * 
 * @param propertyId - ID of the property to delete
 * @param userId - ID of the user attempting the deletion
 * @returns Promise resolving when deletion is complete
 * @throws Error if deletion fails
 * 
 * Requirements: 11.5, 18.3, 20.5, 8.5
 */
export async function deleteProperty(propertyId: string, userId: string): Promise<void> {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    
    // Verify property exists and get property data
    const propertySnap = await getDoc(propertyRef);
    if (!propertySnap.exists()) {
      throw new Error('Property not found');
    }
    
    const property = propertySnap.data() as Property;
    
    // Log property deletion activity before deleting
    // Requirement 18.3: Log property deletion events
    await logActivity({
      userId,
      actionType: 'property_deleted',
      entityId: propertyId,
      metadata: {
        propertyTitle: property.title,
        propertyType: property.propertyType
      }
    });
    
    // Use cascading delete to remove property and all associated data
    // Requirements 20.5, 8.5: Delete all inquiries, wishlist entries, and images
    await cascadeDeleteProperty(propertyId);
  } catch (error) {
    console.error('Error deleting property:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete property. Please try again.');
  }
}

/**
 * Retrieves a single property by ID
 * 
 * @param propertyId - ID of the property to retrieve
 * @returns Promise resolving to the property or null if not found
 * @throws Error if retrieval fails
 * 
 * Requirements: 11.3
 */
export async function getProperty(propertyId: string): Promise<Property | null> {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);
    
    if (!propertySnap.exists()) {
      return null;
    }
    
    return {
      id: propertySnap.id,
      ...propertySnap.data()
    } as Property;
  } catch (error) {
    console.error('Error getting property:', error);
    throw new Error('Failed to retrieve property. Please try again.');
  }
}

/**
 * Retrieves all properties with optional filtering
 * 
 * @param filters - Optional filters to apply (price range, type, location, status)
 * @returns Promise resolving to array of properties
 * @throws Error if retrieval fails
 * 
 * Requirements: 11.3
 */
export async function getProperties(filters?: PropertyFilters): Promise<Property[]> {
  try {
    let q: Query<DocumentData> = collection(db, 'properties');
    
    // Apply filters if provided
    if (filters) {
      const constraints = [];
      
      // Filter by property type
      if (filters.propertyType && filters.propertyType.length > 0) {
        constraints.push(where('propertyType', 'in', filters.propertyType));
      }
      
      // Filter by availability status
      if (filters.availabilityStatus && filters.availabilityStatus.length > 0) {
        constraints.push(where('availabilityStatus', 'in', filters.availabilityStatus));
      }
      
      // Note: Price range and location filtering require client-side filtering
      // or composite indexes. For now, we'll fetch all and filter client-side.
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    let properties = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Property));
    
    // Apply client-side filters for price range and location
    if (filters) {
      if (filters.priceMin !== undefined) {
        properties = properties.filter(p => p.price >= filters.priceMin!);
      }
      
      if (filters.priceMax !== undefined) {
        properties = properties.filter(p => p.price <= filters.priceMax!);
      }
      
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        properties = properties.filter(p => 
          p.location.address.toLowerCase().includes(locationLower) ||
          p.location.city.toLowerCase().includes(locationLower) ||
          p.location.state.toLowerCase().includes(locationLower)
        );
      }
    }
    
    return properties;
  } catch (error) {
    console.error('Error getting properties:', error);
    throw new Error('Failed to retrieve properties. Please try again.');
  }
}

/**
 * Retrieves all properties owned by a specific user
 * 
 * @param userId - ID of the user whose properties to retrieve
 * @returns Promise resolving to array of properties
 * @throws Error if retrieval fails
 * 
 * Requirements: 11.3
 */
export async function getUserProperties(userId: string): Promise<Property[]> {
  try {
    const q = query(
      collection(db, 'properties'),
      where('ownerId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Property));
  } catch (error) {
    console.error('Error getting user properties:', error);
    throw new Error('Failed to retrieve user properties. Please try again.');
  }
}

/**
 * Approves a property (admin only)
 * 
 * Updates the property's verification status to 'approved', records the admin ID
 * and timestamp, and makes the property visible to buyers.
 * 
 * @param propertyId - ID of the property to approve
 * @param adminId - ID of the admin user performing the approval
 * @returns Promise resolving when approval is complete
 * @throws Error if property not found or approval fails
 * 
 * Requirements: 5.3, 5.6, 13.3, 15.2, 18.5
 */
export async function approveProperty(propertyId: string, adminId: string): Promise<void> {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    
    // Verify property exists and get owner ID
    const propertySnap = await getDoc(propertyRef);
    if (!propertySnap.exists()) {
      throw new Error('Property not found');
    }
    
    const property = propertySnap.data() as Property;
    
    // Update property with approval details
    await updateDoc(propertyRef, {
      verificationStatus: 'approved',
      approvedBy: adminId,
      approvedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Create notification for property owner
    // Requirement 15.2: Trigger notification when admin approves property
    await createNotification({
      userId: property.ownerId,
      message: `Your property "${property.title}" has been approved and is now visible to buyers`,
      type: NotificationType.PROPERTY_APPROVED,
      relatedEntityId: propertyId,
    });

    // Log property approval activity
    // Requirement 18.5: Log property approval events
    await logActivity({
      userId: adminId,
      actionType: 'property_approved',
      entityId: propertyId,
      metadata: {
        propertyTitle: property.title,
        ownerId: property.ownerId
      }
    });
  } catch (error) {
    console.error('Error approving property:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to approve property. Please try again.');
  }
}

/**
 * Rejects a property with a reason (admin only)
 * 
 * Updates the property's verification status to 'rejected', records the admin ID,
 * timestamp, and rejection reason. The property owner is notified with the reason.
 * 
 * @param propertyId - ID of the property to reject
 * @param adminId - ID of the admin user performing the rejection
 * @param reason - Reason for rejection
 * @returns Promise resolving when rejection is complete
 * @throws Error if property not found, reason is empty, or rejection fails
 * 
 * Requirements: 5.4, 5.6, 13.3, 13.6, 15.2, 18.5
 */
export async function rejectProperty(
  propertyId: string,
  adminId: string,
  reason: string
): Promise<void> {
  try {
    // Validate rejection reason
    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }
    
    const propertyRef = doc(db, 'properties', propertyId);
    
    // Verify property exists and get owner ID
    const propertySnap = await getDoc(propertyRef);
    if (!propertySnap.exists()) {
      throw new Error('Property not found');
    }
    
    const property = propertySnap.data() as Property;
    
    // Update property with rejection details
    await updateDoc(propertyRef, {
      verificationStatus: 'rejected',
      approvedBy: adminId,
      approvedAt: Timestamp.now(),
      rejectedReason: reason.trim(),
      updatedAt: Timestamp.now()
    });
    
    // Create notification for property owner with rejection reason
    // Requirements 15.2, 13.6: Trigger notification when admin rejects property with reason
    await createNotification({
      userId: property.ownerId,
      message: `Your property "${property.title}" was rejected. Reason: ${reason.trim()}`,
      type: NotificationType.PROPERTY_REJECTED,
      relatedEntityId: propertyId,
    });

    // Log property rejection activity
    // Requirement 18.5: Log property rejection events
    await logActivity({
      userId: adminId,
      actionType: 'property_rejected',
      entityId: propertyId,
      metadata: {
        propertyTitle: property.title,
        ownerId: property.ownerId,
        reason: reason.trim()
      }
    });
  } catch (error) {
    console.error('Error rejecting property:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to reject property. Please try again.');
  }
}
