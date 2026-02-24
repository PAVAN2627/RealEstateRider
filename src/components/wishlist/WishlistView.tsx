/**
 * WishlistView Component
 * 
 * Displays a grid of wishlisted properties with loading and empty states.
 * Fetches property data for each wishlist item and renders PropertyCard components.
 * 
 * Requirements: 8.3
 */

import React, { useState, useEffect } from 'react';
import { useWishlist } from '../../hooks/useWishlist';
import { getProperty } from '../../services/propertyService';
import { Property } from '../../types/property.types';
import PropertyCard from '../property/PropertyCard';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import { Heart } from 'lucide-react';

/**
 * WishlistView Component
 * 
 * Displays a responsive grid of wishlisted properties.
 * Handles loading, error, and empty states appropriately.
 * Shows count of wishlisted properties.
 * 
 * Requirements:
 * - 8.3: Display all wishlisted properties in the Buyer Dashboard
 */
export default function WishlistView() {
  const { wishlistPropertyIds, loading: wishlistLoading, error: wishlistError, refreshWishlist } = useWishlist();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch property data for each wishlist item
   */
  useEffect(() => {
    const fetchProperties = async () => {
      if (wishlistPropertyIds.length === 0) {
        setProperties([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch all properties in parallel
        const propertyPromises = wishlistPropertyIds.map(id => getProperty(id));
        const fetchedProperties = await Promise.all(propertyPromises);
        
        // Filter out null values (properties that don't exist)
        const validProperties = fetchedProperties.filter((p): p is Property => p !== null);
        setProperties(validProperties);
      } catch (err) {
        console.error('Error fetching wishlist properties:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load wishlist properties';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [wishlistPropertyIds]);

  /**
   * Handle retry for both wishlist and property fetching
   */
  const handleRetry = async () => {
    setError(null);
    await refreshWishlist();
  };

  // Combined loading state
  const isLoading = wishlistLoading || loading;

  // Loading state
  if (isLoading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading your wishlist..." />
      </div>
    );
  }

  // Error state
  if (wishlistError || error) {
    return (
      <ErrorMessage
        title="Failed to Load Wishlist"
        message={wishlistError || error || 'An error occurred'}
        onRetry={handleRetry}
      />
    );
  }

  // Empty state
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Heart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h3>
        <p className="text-muted-foreground max-w-md">
          Start adding properties to your wishlist by clicking the heart icon on property cards.
          Your saved properties will appear here for easy access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wishlist Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Wishlist</h2>
        <div className="text-sm text-muted-foreground">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </div>
      </div>

      {/* Property Grid - Same layout as PropertyList */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isWishlisted={true}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );
}
