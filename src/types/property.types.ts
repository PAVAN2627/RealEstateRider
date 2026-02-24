/**
 * Property Type Definitions
 * 
 * Defines types for property management, property types, availability status,
 * location data, and property filtering in the EstateSphere platform.
 * 
 * Requirements: 4.1, 4.2, 6.3, 6.4, 6.6
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Property types available in the platform
 */
export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  LAND = 'land',
  APARTMENT = 'apartment'
}

/**
 * Property availability status
 */
export enum AvailabilityStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  UNDER_OFFER = 'under_offer'
}

/**
 * Geographic coordinates for property location
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Property location information
 */
export interface Location {
  address: string;
  city: string;
  state: string;
  coordinates?: Coordinates;
}

/**
 * Property document structure in Firestore properties collection
 */
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  propertyType: PropertyType;
  location: Location;
  availabilityStatus: AvailabilityStatus;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  imageUrls: string[];
  ownershipDocumentUrls?: string[];
  ownerId: string;
  ownerRole: 'seller' | 'agent';
  agentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectedReason?: string;
}

/**
 * Property filters for search and filtering functionality
 */
export interface PropertyFilters {
  priceMin?: number;
  priceMax?: number;
  propertyType?: PropertyType[];
  location?: string;
  availabilityStatus?: AvailabilityStatus[];
}
