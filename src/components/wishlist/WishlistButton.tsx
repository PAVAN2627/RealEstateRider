/**
 * WishlistButton Component
 * 
 * Interactive button for adding/removing properties from wishlist.
 * Features optimistic UI updates, loading states, and error handling.
 * 
 * Requirements: 8.1, 8.2, 8.6
 */

import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useWishlist } from '../../hooks/useWishlist';
import { useToast } from '../../hooks/use-toast';

interface WishlistButtonProps {
  propertyId: string;
  isWishlisted?: boolean;
  onToggle?: (propertyId: string) => void;
  className?: string;
}

/**
 * WishlistButton Component
 * 
 * Displays a heart icon that toggles between filled (wishlisted) and unfilled states.
 * Handles wishlist operations with optimistic UI updates and error recovery.
 * 
 * Requirements:
 * - 8.1: Add property to wishlist when buyer clicks wishlist button
 * - 8.2: Remove property from wishlist when buyer clicks wishlist button again
 * - 8.6: Display wishlist status on property cards and detail pages
 */
export default function WishlistButton({
  propertyId,
  isWishlisted = false,
  onToggle,
  className = '',
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticState, setOptimisticState] = useState(isWishlisted);

  /**
   * Handle wishlist toggle with optimistic UI updates
   * 
   * Immediately updates the UI, then performs the API call.
   * Reverts the UI state if the operation fails.
   */
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple simultaneous clicks
    if (isLoading) {
      return;
    }

    // Store the previous state for rollback on error
    const previousState = optimisticState;
    const newState = !optimisticState;

    // Optimistic UI update
    setOptimisticState(newState);
    setIsLoading(true);

    try {
      // Perform the wishlist operation
      if (newState) {
        await addToWishlist(propertyId);
        toast({
          title: 'Added to wishlist',
          description: 'Property has been added to your wishlist.',
          variant: 'default',
        });
      } else {
        await removeFromWishlist(propertyId);
        toast({
          title: 'Removed from wishlist',
          description: 'Property has been removed from your wishlist.',
          variant: 'default',
        });
      }

      // Notify parent component of the change
      if (onToggle) {
        onToggle(propertyId);
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticState(previousState);

      // Display error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to update wishlist';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      console.error('Wishlist toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full bg-white/80 hover:bg-white transition-all duration-200 ${className}`}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={optimisticState ? 'Remove from wishlist' : 'Add to wishlist'}
      title={optimisticState ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
      ) : (
        <Heart
          className={`h-5 w-5 transition-all duration-200 ${
            optimisticState
              ? 'fill-red-500 text-red-500 scale-110'
              : 'text-gray-600 hover:text-red-500 hover:scale-110'
          }`}
        />
      )}
    </Button>
  );
}
