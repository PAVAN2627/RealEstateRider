/**
 * Session Manager Utility
 * 
 * Provides session management utilities for Firebase Auth.
 * 
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6
 */

import { auth } from '../config/firebase.config';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

/**
 * Session persistence types
 */
export enum SessionPersistence {
  LOCAL = 'local',     // Persists even when browser is closed
  SESSION = 'session', // Persists only for current session
  NONE = 'none',       // No persistence (memory only)
}

/**
 * Session configuration
 */
interface SessionConfig {
  persistence: SessionPersistence;
  expirationHours: number;
}

/**
 * Default session configuration
 * Requirement 17.1: Set session expiration to 24 hours
 */
const DEFAULT_SESSION_CONFIG: SessionConfig = {
  persistence: SessionPersistence.LOCAL,
  expirationHours: 24,
};

/**
 * Session metadata stored in local storage
 */
interface SessionMetadata {
  userId: string;
  email: string;
  role: string;
  loginTime: number;
  expiresAt: number;
  lastActivityTime: number;
}

const SESSION_METADATA_KEY = 'estate_sphere_session';

/**
 * Configures Firebase Auth session persistence
 * 
 * @param persistence - Session persistence type
 * @returns Promise that resolves when persistence is set
 * 
 * Requirement 17.1: Configure Firebase Auth session persistence
 */
export async function configureSessionPersistence(
  persistence: SessionPersistence = SessionPersistence.LOCAL
): Promise<void> {
  try {
    switch (persistence) {
      case SessionPersistence.LOCAL:
        await setPersistence(auth, browserLocalPersistence);
        break;
      case SessionPersistence.SESSION:
        await setPersistence(auth, browserSessionPersistence);
        break;
      case SessionPersistence.NONE:
        // Memory persistence is default, no action needed
        break;
    }
  } catch (error) {
    console.error('Error setting session persistence:', error);
    throw error;
  }
}

/**
 * Creates session metadata after successful login
 * 
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @param expirationHours - Session expiration in hours (default: 24)
 * 
 * Requirement 17.1: Set session expiration to 24 hours
 */
export function createSessionMetadata(
  userId: string,
  email: string,
  role: string,
  expirationHours: number = DEFAULT_SESSION_CONFIG.expirationHours
): void {
  const now = Date.now();
  const metadata: SessionMetadata = {
    userId,
    email,
    role,
    loginTime: now,
    expiresAt: now + expirationHours * 60 * 60 * 1000,
    lastActivityTime: now,
  };

  try {
    localStorage.setItem(SESSION_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error creating session metadata:', error);
  }
}

/**
 * Gets current session metadata
 * 
 * @returns Session metadata or null if not found
 */
export function getSessionMetadata(): SessionMetadata | null {
  try {
    const metadataStr = localStorage.getItem(SESSION_METADATA_KEY);
    if (!metadataStr) {
      return null;
    }

    return JSON.parse(metadataStr) as SessionMetadata;
  } catch (error) {
    console.error('Error getting session metadata:', error);
    return null;
  }
}

/**
 * Updates last activity time for session
 * 
 * Requirement 17.2: Implement session validation on protected requests
 */
export function updateSessionActivity(): void {
  try {
    const metadata = getSessionMetadata();
    if (metadata) {
      metadata.lastActivityTime = Date.now();
      localStorage.setItem(SESSION_METADATA_KEY, JSON.stringify(metadata));
    }
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

/**
 * Validates if session is still valid
 * 
 * @returns True if session is valid
 * 
 * Requirement 17.2: Implement session validation on protected requests
 * Requirement 17.5: Validate session tokens on every protected API request
 */
export function isSessionValid(): boolean {
  const metadata = getSessionMetadata();
  
  if (!metadata) {
    return false;
  }

  const now = Date.now();
  
  // Check if session has expired
  if (now > metadata.expiresAt) {
    clearSessionMetadata();
    return false;
  }

  return true;
}

/**
 * Gets remaining session time in seconds
 * 
 * @returns Remaining time in seconds or 0 if expired
 */
export function getRemainingSessionTime(): number {
  const metadata = getSessionMetadata();
  
  if (!metadata) {
    return 0;
  }

  const now = Date.now();
  const remaining = metadata.expiresAt - now;
  
  return remaining > 0 ? Math.floor(remaining / 1000) : 0;
}

/**
 * Clears session metadata
 * 
 * Requirement 17.3: Terminate sessions on password change
 * Requirement 17.4: Terminate sessions on account suspension
 */
export function clearSessionMetadata(): void {
  try {
    localStorage.removeItem(SESSION_METADATA_KEY);
  } catch (error) {
    console.error('Error clearing session metadata:', error);
  }
}

/**
 * Terminates current session
 * 
 * @returns Promise that resolves when session is terminated
 * 
 * Requirement 17.3: Terminate sessions on password change
 * Requirement 17.4: Terminate sessions on account suspension
 */
export async function terminateSession(): Promise<void> {
  try {
    clearSessionMetadata();
    await auth.signOut();
  } catch (error) {
    console.error('Error terminating session:', error);
    throw error;
  }
}

/**
 * Checks if session token is valid
 * 
 * @returns Promise that resolves to true if token is valid
 * 
 * Requirement 17.5: Validate session tokens on every protected API request
 * Requirement 17.6: Return authentication error for invalid/expired tokens
 */
export async function validateSessionToken(): Promise<boolean> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return false;
    }

    // Get fresh token to validate
    const token = await user.getIdToken(true);
    
    if (!token) {
      return false;
    }

    // Check session metadata
    if (!isSessionValid()) {
      await terminateSession();
      return false;
    }

    // Update activity time
    updateSessionActivity();

    return true;
  } catch (error) {
    console.error('Error validating session token:', error);
    return false;
  }
}

/**
 * Refreshes session token
 * 
 * @returns Promise that resolves to new token
 */
export async function refreshSessionToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }

    const token = await user.getIdToken(true);
    updateSessionActivity();
    
    return token;
  } catch (error) {
    console.error('Error refreshing session token:', error);
    return null;
  }
}

/**
 * Sets up session monitoring
 * Checks session validity periodically and terminates if expired
 * 
 * @param intervalMs - Check interval in milliseconds (default: 60000 = 1 minute)
 * @returns Cleanup function to stop monitoring
 */
export function setupSessionMonitoring(intervalMs: number = 60000): () => void {
  const intervalId = setInterval(async () => {
    if (!isSessionValid()) {
      await terminateSession();
      // Redirect to login page
      window.location.href = '/login';
    }
  }, intervalMs);

  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Wraps a function with session validation
 * 
 * @param fn - Function to wrap
 * @returns Wrapped function with session validation
 */
export function withSessionValidation<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const isValid = await validateSessionToken();
    
    if (!isValid) {
      throw new Error('Session expired. Please log in again.');
    }

    return await fn(...args);
  }) as T;
}
