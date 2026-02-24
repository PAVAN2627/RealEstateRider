import { Timestamp } from 'firebase/firestore';

/**
 * Status of an inquiry
 */
export enum InquiryStatus {
  PENDING = 'pending',
  RESPONDED = 'responded'
}

/**
 * Inquiry interface matching Firestore inquiries collection
 */
export interface Inquiry {
  id: string;                     // Document ID
  propertyId: string;             // Reference to properties collection
  buyerId: string;                // Reference to users collection
  agentId: string;                // Reference to users/agentProfiles collection
  message: string;                // Max 1000 characters
  status: InquiryStatus;
  response?: string;
  createdAt: Timestamp;
  respondedAt?: Timestamp;
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
