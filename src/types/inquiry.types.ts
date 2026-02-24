import { Timestamp } from 'firebase/firestore';

/**
 * Status of an inquiry
 */
export enum InquiryStatus {
  PENDING = 'pending',
  RESPONDED = 'responded'
}

/**
 * Message in a conversation
 */
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  read: boolean;
}

/**
 * Inquiry interface matching Firestore inquiries collection
 */
export interface Inquiry {
  id: string;                     // Document ID
  propertyId: string;             // Reference to properties collection
  buyerId: string;                // Reference to users collection
  agentId: string;                // Reference to users/agentProfiles collection
  message: string;                // Initial message (for backward compatibility)
  messages: Message[];            // Array of all messages in conversation
  status: InquiryStatus;
  response?: string;              // For backward compatibility
  createdAt: Timestamp;
  respondedAt?: Timestamp;
  lastMessageAt: Timestamp;       // Timestamp of last message
}

/**
 * Data required to create a new inquiry
 */
export interface CreateInquiryData {
  propertyId: string;
  buyerId: string;
  agentId: string;
  message: string;
}

