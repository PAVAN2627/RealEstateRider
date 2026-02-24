/**
 * Error Handler Utility
 * 
 * Provides centralized error handling with user-friendly messages,
 * retry logic, and error logging.
 * 
 * Requirements: 20.2, 21.1, 21.6, 21.7
 */

import { FirebaseError } from 'firebase/app';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Maps Firebase error codes to user-friendly messages
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'This email address is already registered. Please use a different email or try logging in.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
  'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
  'permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested resource was not found.',
  'already-exists': 'This resource already exists.',
  'resource-exhausted': 'Too many requests. Please try again later.',
  'unauthenticated': 'Please log in to continue.',
  'unavailable': 'Service temporarily unavailable. Please try again later.',
};

/**
 * Converts Firebase errors to user-friendly messages
 * 
 * @param error - The error to convert
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof FirebaseError) {
    return FIREBASE_ERROR_MESSAGES[error.code] || `An error occurred: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Determines if an error is retryable
 * 
 * @param error - The error to check
 * @returns True if the error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isRetryable;
  }

  if (error instanceof FirebaseError) {
    const retryableCodes = [
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted',
      'auth/network-request-failed',
      'auth/too-many-requests',
    ];
    return retryableCodes.includes(error.code);
  }

  return false;
}

/**
 * Retry logic for failed operations
 * 
 * @param fn - The function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param delay - Delay between retries in milliseconds (default: 1000)
 * @returns Promise resolving to the function result
 * @throws Error if all retries fail
 * 
 * Requirement 20.2: Implement retry logic for failed database writes (max 3 retries)
 */
export async function retryOperation<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if error is not retryable or if this was the last attempt
      if (!isRetryableError(error) || attempt === maxRetries) {
        break;
      }

      // Log retry attempt
      console.warn(`Operation failed, retrying (${attempt + 1}/${maxRetries})...`, error);

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }

  throw lastError;
}

/**
 * Logs errors with stack traces for debugging
 * 
 * @param error - The error to log
 * @param context - Additional context about where the error occurred
 * 
 * Requirement 21.7: Log errors with stack traces for debugging
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  
  console.error(`[${timestamp}]${contextStr} Error:`, error);
  
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Wraps an async function with error handling and retry logic
 * 
 * @param fn - The function to wrap
 * @param context - Context for error logging
 * @param enableRetry - Whether to enable retry logic (default: false)
 * @returns Wrapped function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string,
  enableRetry: boolean = false
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      if (enableRetry) {
        return await retryOperation(() => fn(...args));
      }
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw new AppError(getErrorMessage(error));
    }
  }) as T;
}
