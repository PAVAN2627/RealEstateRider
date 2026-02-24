/**
 * useWishlist Hook
 * 
 * Custom hook for managing wishlist operations including:
 * - Fetching user's wishlist
 * - Adding properties to wishlist
 * - Removing properties from wishlist
 * - Checking if a property is wishlisted
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.6
 */

import { useState, useCallback, useEffect } from 'react';
import * as wishlistService from '../services/wishlistService';
import { useAuth } from '../context/AuthContext';

/**
 * useWishlist hook return type
 */
interface UseWishlistReturn {
  wishlistPropertyIds: string[];
  loading: boolean;
  error: string | null;
  addToWishlist: (propertyId: string) => Promise<void>;
  removeFromWishlist: (propertyId: string) => Promise<void>;
  isPropertyWishlisted: (propertyId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

/**
 * Custom hook for wishlist operations
 * 
 * Provides functions to manage user's wishlist with loading and error state management.
 * Automatically fetches wishlist when user is authenticated.
 * 
 * @returns UseWishlistReturn - Wishlist operations and state
 * 
 * Requirements:
 * - 8.1: Add properties to wishlist
 * - 8.2: Remove properties from wishlist
 * - 8.3: Display all wishlisted properties
 * - 8.6: Display wishlist status on property cards
 */
export function useWishlist(): UseWishlistReturn {
  const { user } = useAuth();
  const [wishlistPropertyIds, setWishlistPropertyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user's wishlist
   * 
   * Retrieves the list of property IDs in the user's wishlist.
   * 
   * Requirement 8.3: Display all wishlisted properties in the Buyer Dashboard
   */
  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlistPropertyIds([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const propertyIds = await wishlistService.getWishlist(user.uid);
      setWishlistPropertyIds(propertyIds);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wishlist';
      setError(errorMessage);
      setWishlistPropertyIds([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Automatically fetch wishlist when user is authenticated
   */
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  /**
   * Add a property to the wishlist
   * 
   * @param propertyId - ID of the property to add
   * @throws Error if user is not authenticated or operation fails
   * 
   * Requirement 8.1: Add property to wishlist when buyer clicks wishlist button
   */
  const addToWishlist = useCallback(async (propertyId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to add to wishlist');
    }

    setLoading(true);
    setError(null);
    
    try {
      await wishlistService.addToWishlist(user.uid, propertyId);
      
      // Update local state optimistically
      setWishlistPropertyIds(prev => {
        if (!prev.includes(propertyId)) {
          return [...prev, propertyId];
        }
        return prev;
      });
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to wishlist';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Remove a property from the wishlist
   * 
   * @param propertyId - ID of the property to remove
   * @throws Error if user is not authenticated or operation fails
   * 
   * Requirement 8.2: Remove property from wishlist when buyer clicks wishlist button again
   */
  const removeFromWishlist = useCallback(async (propertyId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to remove from wishlist');
    }

    setLoading(true);
    setError(null);
    
    try {
      await wishlistService.removeFromWishlist(user.uid, propertyId);
      
      // Update local state optimistically
      setWishlistPropertyIds(prev => prev.filter(id => id !== propertyId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from wishlist';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Check if a property is in the wishlist
   * 
   * @param propertyId - ID of the property to check
   * @returns boolean - True if property is wishlisted
   * 
   * Requirement 8.6: Display wishlist status on property cards and detail pages
   */
  const isPropertyWishlisted = useCallback((propertyId: string): boolean => {
    return wishlistPropertyIds.includes(propertyId);
  }, [wishlistPropertyIds]);

  return {
    wishlistPropertyIds,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isPropertyWishlisted,
    refreshWishlist,
  };
}
