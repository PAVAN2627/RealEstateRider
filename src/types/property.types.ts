/**
 * Property Type Definitions
 * 
 * Defines types for property management, property types, availability status,
 * location data, and property filtering in the RealEstateRider platform.
 * 
 * Requirements: 4.1, 4.2, 6.3, 6.4, 6.6
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Property configuration (BHK type)
 */
export enum PropertyConfiguration {
  ONE_RK = '1RK',
  ONE_BHK = '1BHK',
  TWO_BHK = '2BHK',
  THREE_BHK = '3BHK',
  FOUR_BHK = '4BHK',
  FIVE_PLUS_BHK = '5+BHK',
  STUDIO = 'Studio',
  PENTHOUSE = 'Penthouse',
  VILLA = 'Villa',
  NOT_APPLICABLE = 'N/A'
}

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
  pincode: string;
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
  configuration: PropertyConfiguration;
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
  configuration?: PropertyConfiguration[];
  location?: string;
  availabilityStatus?: AvailabilityStatus[];
}
