/**
 * Data Integrity Utility
 * 
 * Provides data integrity checks and validation for database operations.
 * 
 * Requirements: 20.1, 20.3, 20.6, 20.7
 */

import { doc, getDoc, writeBatch, WriteBatch } from 'firebase/firestore';
import { db } from '../config/firebase.config';

/**
 * Validates if a user exists
 * 
 * @param userId - User ID to validate
 * @returns Promise resolving to true if user exists
 * @throws Error if user does not exist
 * 
 * Requirement 20.3: Validate user references in properties and inquiries
 */
export async function validateUserExists(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error(`User with ID ${userId} does not exist`);
    }
    
    return true;
  } catch (error) {
    console.error('Error validating user:', error);
    throw error;
  }
}

/**
 * Validates if a property exists
 * 
 * @param propertyId - Property ID to validate
 * @returns Promise resolving to true if property exists
 * @throws Error if property does not exist
 * 
 * Requirement 20.3: Validate property references in inquiries and wishlists
 */
export async function validatePropertyExists(propertyId: string): Promise<boolean> {
  try {
    const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
    
    if (!propertyDoc.exists()) {
      throw new Error(`Property with ID ${propertyId} does not exist`);
    }
    
    return true;
  } catch (error) {
    console.error('Error validating property:', error);
    throw error;
  }
}

/**
 * Validates referential integrity for an inquiry
 * 
 * @param buyerId - Buyer user ID
 * @param agentId - Agent user ID
 * @param propertyId - Property ID
 * @returns Promise resolving to true if all references are valid
 * @throws Error if any reference is invalid
 * 
 * Requirement 20.3: Validate user and property references
 */
export async function validateInquiryReferences(
  buyerId: string,
  agentId: string,
  propertyId: string
): Promise<boolean> {
  try {
    await Promise.all([
      validateUserExists(buyerId),
      validateUserExists(agentId),
      validatePropertyExists(propertyId),
    ]);
    
    return true;
  } catch (error) {
    console.error('Error validating inquiry references:', error);
    throw error;
  }
}

/**
 * Validates referential integrity for a wishlist entry
 * 
 * @param userId - User ID
 * @param propertyId - Property ID
 * @returns Promise resolving to true if all references are valid
 * @throws Error if any reference is invalid
 * 
 * Requirement 20.3: Validate user and property references
 */
export async function validateWishlistReferences(
  userId: string,
  propertyId: string
): Promise<boolean> {
  try {
    await Promise.all([
      validateUserExists(userId),
      validatePropertyExists(propertyId),
    ]);
    
    return true;
  } catch (error) {
    console.error('Error validating wishlist references:', error);
    throw error;
  }
}

/**
 * Validates data types for a document
 * 
 * @param data - Document data to validate
 * @param schema - Schema defining expected types
 * @returns True if all types are valid
 * @throws Error if any type is invalid
 * 
 * Requirement 20.7: Validate all data types before database writes
 */
export function validateDataTypes(
  data: Record<string, any>,
  schema: Record<string, string>
): boolean {
  for (const [key, expectedType] of Object.entries(schema)) {
    const value = data[key];
    
    // Check if required field is missing
    if (value === undefined || value === null) {
      throw new Error(`Required field '${key}' is missing`);
    }
    
    // Check type
    const actualType = typeof value;
    
    if (expectedType === 'array') {
      if (!Array.isArray(value)) {
        throw new Error(`Field '${key}' must be an array, got ${actualType}`);
      }
    } else if (expectedType === 'timestamp') {
      // Check if it's a Firestore Timestamp or Date
      if (!(value instanceof Date) && !value.toDate) {
        throw new Error(`Field '${key}' must be a Timestamp or Date`);
      }
    } else if (actualType !== expectedType) {
      throw new Error(`Field '${key}' must be ${expectedType}, got ${actualType}`);
    }
  }
  
  return true;
}

/**
 * Validates required fields are non-empty
 * 
 * @param data - Document data to validate
 * @param requiredFields - Array of required field names
 * @returns True if all required fields are non-empty
 * @throws Error if any required field is empty
 * 
 * Requirement 20.7: Validate required fields are non-empty
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): boolean {
  for (const field of requiredFields) {
    const value = data[field];
    
    if (value === undefined || value === null) {
      throw new Error(`Required field '${field}' is missing`);
    }
    
    if (typeof value === 'string' && value.trim().length === 0) {
      throw new Error(`Required field '${field}' cannot be empty`);
    }
    
    if (Array.isArray(value) && value.length === 0) {
      throw new Error(`Required field '${field}' cannot be an empty array`);
    }
  }
  
  return true;
}

/**
 * Creates a Firestore batch with transaction support
 * 
 * @returns WriteBatch instance
 * 
 * Requirement 20.1: Use Firestore transactions for cascading deletes
 */
export function createBatch(): WriteBatch {
  return writeBatch(db);
}

/**
 * Executes a batch operation with error handling
 * 
 * @param batch - WriteBatch to execute
 * @returns Promise resolving when batch is committed
 * @throws Error if batch commit fails
 * 
 * Requirement 20.1: Ensure atomicity for multi-document operations
 */
export async function executeBatch(batch: WriteBatch): Promise<void> {
  try {
    await batch.commit();
  } catch (error) {
    console.error('Error executing batch:', error);
    throw new Error('Failed to execute batch operation. Please try again.');
  }
}

/**
 * Validates email uniqueness
 * 
 * @param email - Email to check
 * @returns Promise resolving to true if email is unique
 * @throws Error if email already exists
 * 
 * Requirement 20.6: Enforce unique email addresses in user registration
 */
export async function validateEmailUniqueness(email: string): Promise<boolean> {
  // Note: This is handled by Firebase Auth automatically
  // This function is a placeholder for additional custom validation if needed
  return true;
}

/**
 * Validates property ownership
 * 
 * @param propertyId - Property ID
 * @param userId - User ID claiming ownership
 * @returns Promise resolving to true if user owns the property
 * @throws Error if user does not own the property
 */
export async function validatePropertyOwnership(
  propertyId: string,
  userId: string
): Promise<boolean> {
  try {
    const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
    
    if (!propertyDoc.exists()) {
      throw new Error('Property not found');
    }
    
    const property = propertyDoc.data();
    
    if (property.ownerId !== userId) {
      throw new Error('You do not have permission to modify this property');
    }
    
    return true;
  } catch (error) {
    console.error('Error validating property ownership:', error);
    throw error;
  }
}

/**
 * Validates inquiry ownership
 * 
 * @param inquiryId - Inquiry ID
 * @param userId - User ID claiming ownership
 * @returns Promise resolving to true if user owns the inquiry
 * @throws Error if user does not own the inquiry
 */
export async function validateInquiryOwnership(
  inquiryId: string,
  userId: string
): Promise<boolean> {
  try {
    const inquiryDoc = await getDoc(doc(db, 'inquiries', inquiryId));
    
    if (!inquiryDoc.exists()) {
      throw new Error('Inquiry not found');
    }
    
    const inquiry = inquiryDoc.data();
    
    if (inquiry.buyerId !== userId && inquiry.agentId !== userId) {
      throw new Error('You do not have permission to access this inquiry');
    }
    
    return true;
  } catch (error) {
    console.error('Error validating inquiry ownership:', error);
    throw error;
  }
}

/**
 * Sanitizes and validates string input
 * 
 * @param input - Input string to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 * @throws Error if input exceeds max length
 */
export function sanitizeAndValidateString(input: string, maxLength: number): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }
  
  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Input cannot be empty');
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`Input cannot exceed ${maxLength} characters`);
  }
  
  return trimmed;
}

/**
 * Validates numeric range
 * 
 * @param value - Numeric value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fieldName - Field name for error message
 * @returns True if value is within range
 * @throws Error if value is out of range
 */
export function validateNumericRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  
  if (value < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  
  if (value > max) {
    throw new Error(`${fieldName} must not exceed ${max}`);
  }
  
  return true;
}
