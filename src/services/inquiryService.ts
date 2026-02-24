import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import {
  Inquiry,
  InquiryStatus,
  CreateInquiryData,
} from '../types/inquiry.types';
import { createNotification } from './notificationService';
import { NotificationType } from '../types/notification.types';
import { logActivity } from './activityLogService';

/**
 * InquiryService - Handles all inquiry-related Firestore operations
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

const INQUIRIES_COLLECTION = 'inquiries';
const MAX_MESSAGE_LENGTH = 1000;

/**
 * Validates inquiry message
 * @param message - The inquiry message to validate
 * @throws Error if message is invalid
 */
const validateMessage = (message: string): void => {
  if (!message || message.trim().length === 0) {
    throw new Error('Inquiry message cannot be empty');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Inquiry message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
  }
};

/**
 * Creates a new inquiry with validation
 * Requirements: 9.1, 9.2, 15.3, 18.4
 * 
 * @param inquiryData - Data for creating the inquiry
 * @returns Promise resolving to the created Inquiry
 * @throws Error if validation fails or creation fails
 */
export const createInquiry = async (
  inquiryData: CreateInquiryData
): Promise<Inquiry> => {
  try {
    // Validate message (non-empty and max 1000 chars)
    validateMessage(inquiryData.message);

    // Validate required fields
    if (!inquiryData.propertyId || !inquiryData.buyerId || !inquiryData.agentId) {
      throw new Error('Property ID, Buyer ID, and Agent ID are required');
    }

    const now = Timestamp.now();

    // Create inquiry document
    const inquiryDoc = {
      propertyId: inquiryData.propertyId,
      buyerId: inquiryData.buyerId,
      agentId: inquiryData.agentId,
      message: inquiryData.message.trim(),
      status: InquiryStatus.PENDING,
      createdAt: now,
    };

    const docRef = await addDoc(
      collection(db, INQUIRIES_COLLECTION),
      inquiryDoc
    );

    const inquiry: Inquiry = {
      id: docRef.id,
      ...inquiryDoc,
    };

    // Create notification for agent
    // Requirement 15.3: Trigger notification when buyer sends inquiry to agent
    await createNotification({
      userId: inquiryData.agentId,
      message: 'You have received a new inquiry about your property',
      type: NotificationType.NEW_INQUIRY,
      relatedEntityId: docRef.id,
    });

    // Log inquiry creation activity
    // Requirement 18.4: Log inquiry creation events
    await logActivity({
      userId: inquiryData.buyerId,
      actionType: 'inquiry_created',
      entityId: docRef.id,
      metadata: {
        propertyId: inquiryData.propertyId,
        agentId: inquiryData.agentId
      }
    });

    return inquiry;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
};

/**
 * Retrieves all inquiries sent by a buyer
 * Requirements: 9.3, 9.4
 * 
 * @param buyerId - The buyer's user ID
 * @returns Promise resolving to array of Inquiries
 */
export const getInquiriesByBuyer = async (
  buyerId: string
): Promise<Inquiry[]> => {
  try {
    if (!buyerId) {
      throw new Error('Buyer ID is required');
    }

    const q = query(
      collection(db, INQUIRIES_COLLECTION),
      where('buyerId', '==', buyerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const inquiries: Inquiry[] = [];

    querySnapshot.forEach((doc) => {
      inquiries.push({
        id: doc.id,
        ...doc.data(),
      } as Inquiry);
    });

    return inquiries;
  } catch (error) {
    console.error('Error fetching inquiries by buyer:', error);
    throw error;
  }
};

/**
 * Retrieves all inquiries received by an agent
 * Requirements: 9.3, 9.4
 * 
 * @param agentId - The agent's user ID
 * @returns Promise resolving to array of Inquiries
 */
export const getInquiriesByAgent = async (
  agentId: string
): Promise<Inquiry[]> => {
  try {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    const q = query(
      collection(db, INQUIRIES_COLLECTION),
      where('agentId', '==', agentId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const inquiries: Inquiry[] = [];

    querySnapshot.forEach((doc) => {
      inquiries.push({
        id: doc.id,
        ...doc.data(),
      } as Inquiry);
    });

    return inquiries;
  } catch (error) {
    console.error('Error fetching inquiries by agent:', error);
    throw error;
  }
};

/**
 * Agent responds to an inquiry
 * Requirements: 9.6, 15.1, 9.7, 18.4
 * 
 * @param inquiryId - The inquiry document ID
 * @param response - The agent's response message
 * @param agentId - The agent's user ID
 * @returns Promise that resolves when the response is saved
 * @throws Error if inquiry ID or response is invalid
 */
export const respondToInquiry = async (
  inquiryId: string,
  response: string,
  agentId: string
): Promise<void> => {
  try {
    if (!inquiryId) {
      throw new Error('Inquiry ID is required');
    }

    if (!response || response.trim().length === 0) {
      throw new Error('Response cannot be empty');
    }

    const inquiryRef = doc(db, INQUIRIES_COLLECTION, inquiryId);
    
    // Get inquiry to retrieve buyer ID for notification
    const inquiryDoc = await getDoc(inquiryRef);
    if (!inquiryDoc.exists()) {
      throw new Error('Inquiry not found');
    }
    
    const inquiryData = inquiryDoc.data() as Inquiry;
    
    // Update inquiry with response
    await updateDoc(inquiryRef, {
      response: response.trim(),
      status: InquiryStatus.RESPONDED,
      respondedAt: Timestamp.now(),
    });

    // Create notification for buyer
    // Requirement 15.1: Trigger notification when agent responds to inquiry
    await createNotification({
      userId: inquiryData.buyerId,
      message: 'An agent has responded to your inquiry',
      type: NotificationType.INQUIRY_RESPONSE,
      relatedEntityId: inquiryId,
    });

    // Log inquiry response activity
    // Requirement 18.4: Log inquiry response events
    await logActivity({
      userId: agentId,
      actionType: 'inquiry_responded',
      entityId: inquiryId,
      metadata: {
        buyerId: inquiryData.buyerId,
        propertyId: inquiryData.propertyId
      }
    });
  } catch (error) {
    console.error('Error responding to inquiry:', error);
    throw error;
  }
};

/**
 * Retrieves all inquiries for a specific property
 * 
 * @param propertyId - The property ID
 * @returns Promise resolving to array of Inquiries
 */
export const getInquiriesByProperty = async (
  propertyId: string
): Promise<Inquiry[]> => {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const q = query(
      collection(db, INQUIRIES_COLLECTION),
      where('propertyId', '==', propertyId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const inquiries: Inquiry[] = [];

    querySnapshot.forEach((doc) => {
      inquiries.push({
        id: doc.id,
        ...doc.data(),
      } as Inquiry);
    });

    return inquiries;
  } catch (error) {
    console.error('Error fetching inquiries by property:', error);
    throw error;
  }
};

/**
 * Updates the status of an inquiry
 * Requirements: 9.5
 * 
 * @param inquiryId - The inquiry document ID
 * @param status - The new inquiry status
 * @returns Promise that resolves when the status is updated
 * @throws Error if inquiry ID or status is invalid
 */
export const updateInquiryStatus = async (
  inquiryId: string,
  status: InquiryStatus
): Promise<void> => {
  try {
    if (!inquiryId) {
      throw new Error('Inquiry ID is required');
    }

    if (!Object.values(InquiryStatus).includes(status)) {
      throw new Error('Invalid inquiry status');
    }

    const inquiryRef = doc(db, INQUIRIES_COLLECTION, inquiryId);
    
    await updateDoc(inquiryRef, {
      status,
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
};
