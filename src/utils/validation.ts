/**
 * Validation Utility
 * 
 * Provides validation functions for forms and user inputs.
 * 
 * Requirements: 21.2, 20.7
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 * 
 * @param email - Email address to validate
 * @returns Validation result
 * 
 * Requirement 21.2: Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validates password strength
 * 
 * @param password - Password to validate
 * @returns Validation result
 * 
 * Requirement 21.2: Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  // Optional: Add more strength requirements
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumber = /\d/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return { isValid: true };
}

/**
 * Validates required field
 * 
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 * 
 * Requirement 21.2: Validate required fields
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * Validates numeric value within a range
 * 
 * @param value - Numeric value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 * 
 * Requirement 21.2: Validate numeric ranges (price, file size)
 */
export function validateNumericRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (value < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (value > max) {
    return { isValid: false, error: `${fieldName} must not exceed ${max}` };
  }

  return { isValid: true };
}

/**
 * Validates string length
 * 
 * @param value - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 */
export function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): ValidationResult {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const length = value.trim().length;

  if (length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (length > maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }

  return { isValid: true };
}

/**
 * Validates phone number format
 * 
 * @param phone - Phone number to validate
 * @returns Validation result
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Basic phone validation (10 digits)
  const phoneRegex = /^\d{10}$/;
  const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');

  if (!phoneRegex.test(cleanedPhone)) {
    return { isValid: false, error: 'Please enter a valid 10-digit phone number' };
  }

  return { isValid: true };
}

/**
 * Validates file type
 * 
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Validation result
 * 
 * Requirement 16.1: Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): ValidationResult {
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Validates file size
 * 
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in megabytes
 * @returns Validation result
 * 
 * Requirement 16.2: Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number): ValidationResult {
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must not exceed ${maxSizeMB}MB`
    };
  }

  return { isValid: true };
}

/**
 * Validates URL format
 * 
 * @param url - URL to validate
 * @returns Validation result
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}

/**
 * Sanitizes user input to prevent XSS attacks
 * 
 * @param input - Input string to sanitize
 * @returns Sanitized string
 * 
 * Requirement 23.3: Sanitize all user inputs to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates and sanitizes text input
 * 
 * @param value - Value to validate and sanitize
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @param fieldName - Name of the field for error message
 * @returns Validation result with sanitized value
 */
export function validateAndSanitizeText(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): ValidationResult & { sanitizedValue?: string } {
  const lengthValidation = validateStringLength(value, minLength, maxLength, fieldName);
  
  if (!lengthValidation.isValid) {
    return lengthValidation;
  }

  return {
    isValid: true,
    sanitizedValue: sanitizeInput(value)
  };
}
