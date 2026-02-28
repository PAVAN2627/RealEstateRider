/**
 * User Type Definitions
 * 
 * Defines types for user management, roles, verification status,
 * and agent profiles in the RealEstateRider platform.
 * 
 * Requirements: 1.1, 2.1, 10.1
 */

import { Timestamp } from 'firebase/firestore';

/**
 * User roles in the platform
 */
export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  AGENT = 'agent',
  ADMIN = 'admin'
}

/**
 * User verification status
 */
export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

/**
 * User profile information
 */
export interface UserProfile {
  name: string;
  phone?: string;
}

/**
 * User document structure in Firestore users collection
 */
export interface User {
  uid: string;
  email: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  aadharDocumentUrl?: string;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  profile: UserProfile;
}

/**
 * Agent profile document structure in Firestore agentProfiles collection
 */
export interface AgentProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  experience: string;
  specialization: string;
  profilePhotoUrl?: string;
  verified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
