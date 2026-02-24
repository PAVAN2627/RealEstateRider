/**
 * Network Error Handler Utility
 * 
 * Provides network error detection and handling with retry suggestions.
 * 
 * Requirement 21.3: Add network error handling
 */

/**
 * Checks if the user is online
 * 
 * @returns True if the user is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Checks if an error is a network error
 * 
 * @param error - The error to check
 * @returns True if the error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const networkErrorMessages = [
      'network',
      'fetch',
      'connection',
      'timeout',
      'offline',
      'unreachable',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
    ];

    return networkErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  return false;
}

/**
 * Gets a user-friendly network error message
 * 
 * @param error - The error to convert
 * @returns User-friendly error message
 */
export function getNetworkErrorMessage(error: unknown): string {
  if (!isOnline()) {
    return 'You appear to be offline. Please check your internet connection and try again.';
  }

  if (isNetworkError(error)) {
    return 'Network error occurred. Please check your internet connection and try again.';
  }

  return 'Unable to connect to the server. Please try again later.';
}

/**
 * Sets up online/offline event listeners
 * 
 * @param onOnline - Callback when connection is restored
 * @param onOffline - Callback when connection is lost
 * @returns Cleanup function to remove event listeners
 */
export function setupNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Waits for network connection to be restored
 * 
 * @param timeout - Maximum time to wait in milliseconds (default: 30000)
 * @returns Promise that resolves when online or rejects on timeout
 */
export function waitForConnection(timeout: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      reject(new Error('Connection timeout'));
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve();
    };

    window.addEventListener('online', onlineHandler);
  });
}

/**
 * Wraps a function with network error handling
 * 
 * @param fn - The function to wrap
 * @returns Wrapped function with network error handling
 */
export function withNetworkErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (!isOnline()) {
      throw new Error('You appear to be offline. Please check your internet connection.');
    }

    try {
      return await fn(...args);
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error(getNetworkErrorMessage(error));
      }
      throw error;
    }
  }) as T;
}
