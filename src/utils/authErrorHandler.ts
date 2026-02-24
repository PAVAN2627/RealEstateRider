/**
 * Authentication and Authorization Error Handler
 * 
 * Provides error handling for authentication and authorization errors
 * with appropriate redirects and user messages.
 * 
 * Requirements: 21.4, 21.5
 */

import { FirebaseError } from 'firebase/app';

/**
 * Authentication error types
 */
export enum AuthErrorType {
  UNAUTHENTICATED = 'unauthenticated',
  UNAUTHORIZED = 'unauthorized',
  SESSION_EXPIRED = 'session_expired',
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_DISABLED = 'account_disabled',
  ACCOUNT_PENDING = 'account_pending',
  ACCOUNT_REJECTED = 'account_rejected',
}

/**
 * Authentication error class
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public type: AuthErrorType,
    public shouldRedirect: boolean = false,
    public redirectPath?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Checks if an error is an authentication error
 * 
 * @param error - The error to check
 * @returns True if the error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AuthError) {
    return true;
  }

  if (error instanceof FirebaseError) {
    const authErrorCodes = [
      'auth/user-not-found',
      'auth/wrong-password',
      'auth/invalid-email',
      'auth/user-disabled',
      'auth/email-already-in-use',
      'auth/weak-password',
      'auth/requires-recent-login',
      'permission-denied',
      'unauthenticated',
    ];
    return authErrorCodes.some(code => error.code.includes(code));
  }

  return false;
}

/**
 * Converts Firebase auth errors to AuthError instances
 * 
 * @param error - The error to convert
 * @returns AuthError instance
 */
export function convertToAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return new AuthError(
          'Invalid email or password. Please try again.',
          AuthErrorType.INVALID_CREDENTIALS
        );

      case 'auth/user-disabled':
        return new AuthError(
          'Your account has been disabled. Please contact support.',
          AuthErrorType.ACCOUNT_DISABLED
        );

      case 'auth/requires-recent-login':
        return new AuthError(
          'Your session has expired. Please log in again.',
          AuthErrorType.SESSION_EXPIRED,
          true,
          '/login'
        );

      case 'permission-denied':
        return new AuthError(
          'You do not have permission to perform this action.',
          AuthErrorType.UNAUTHORIZED
        );

      case 'unauthenticated':
        return new AuthError(
          'Please log in to continue.',
          AuthErrorType.UNAUTHENTICATED,
          true,
          '/login'
        );

      default:
        return new AuthError(
          error.message,
          AuthErrorType.UNAUTHENTICATED
        );
    }
  }

  if (error instanceof Error) {
    // Check for custom error messages from our services
    if (error.message.includes('access denied') || error.message.includes('not approved')) {
      return new AuthError(
        error.message,
        AuthErrorType.ACCOUNT_PENDING
      );
    }

    if (error.message.includes('rejected')) {
      return new AuthError(
        error.message,
        AuthErrorType.ACCOUNT_REJECTED
      );
    }
  }

  return new AuthError(
    'An authentication error occurred. Please try again.',
    AuthErrorType.UNAUTHENTICATED
  );
}

/**
 * Gets the appropriate redirect path for an auth error
 * 
 * @param error - The auth error
 * @returns Redirect path or null if no redirect needed
 * 
 * Requirement 21.4: Redirect to login on authentication errors
 * Requirement 21.5: Display access denied messages for authorization errors
 */
export function getAuthErrorRedirect(error: AuthError): string | null {
  if (!error.shouldRedirect) {
    return null;
  }

  if (error.redirectPath) {
    return error.redirectPath;
  }

  switch (error.type) {
    case AuthErrorType.UNAUTHENTICATED:
    case AuthErrorType.SESSION_EXPIRED:
      return '/login';

    case AuthErrorType.UNAUTHORIZED:
      return '/unauthorized';

    case AuthErrorType.ACCOUNT_PENDING:
      return '/pending-approval';

    case AuthErrorType.ACCOUNT_REJECTED:
      return '/account-rejected';

    default:
      return null;
  }
}

/**
 * Handles authentication errors with appropriate actions
 * 
 * @param error - The error to handle
 * @param navigate - Navigation function from react-router
 * @returns User-friendly error message
 */
export function handleAuthError(
  error: unknown,
  navigate?: (path: string) => void
): string {
  const authError = convertToAuthError(error);

  // Redirect if necessary
  const redirectPath = getAuthErrorRedirect(authError);
  if (redirectPath && navigate) {
    navigate(redirectPath);
  }

  return authError.message;
}

/**
 * Wraps a function with authentication error handling
 * 
 * @param fn - The function to wrap
 * @param navigate - Navigation function from react-router
 * @returns Wrapped function with auth error handling
 */
export function withAuthErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  navigate?: (path: string) => void
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (isAuthError(error)) {
        const message = handleAuthError(error, navigate);
        throw new Error(message);
      }
      throw error;
    }
  }) as T;
}
