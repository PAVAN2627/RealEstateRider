/**
 * PropertyList Component
 * 
 * Renders a grid of PropertyCard components with pagination,
 * empty state, loading, and error handling.
 * 
 * Requirements: 6.1, 22.4
 */

import React, { useState, useEffect } from 'react';
import { useProperties } from '../../context/PropertyContext';
import PropertyCard from './PropertyCard';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import { Home, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { useUserLocation } from '../../hooks/useUserLocation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

/**
 * PropertyList props
 */
interface PropertyListProps {
  itemsPerPage?: number;
  showOnlyApproved?: boolean;
}

/**
 * PropertyList Component
 * 
 * Displays a responsive grid of property cards with pagination.
 * Handles loading, error, and empty states appropriately.
 * 
 * Requirements:
 * - 6.1: Display all approved properties to authenticated buyers
 * - 22.4: Lazy-load images to improve initial page load performance
 */
export default function PropertyList({ itemsPerPage = 12, showOnlyApproved = true }: PropertyListProps) {
  const { properties, loading, error, refreshProperties } = useProperties();
  const [currentPage, setCurrentPage] = useState(1);
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation } = useUserLocation();

  // Filter properties by approval status if needed
  const filteredProperties = showOnlyApproved 
    ? properties.filter(p => p.verificationStatus === 'approved')
    : properties;

  // Calculate pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  // Reset to page 1 when properties change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProperties.length]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading properties..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Properties"
        message={error}
        onRetry={refreshProperties}
      />
    );
  }

  // Empty state
  if (filteredProperties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Home className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Properties Found</h3>
        <p className="text-muted-foreground max-w-md">
          We couldn't find any properties matching your criteria. Try adjusting your filters or check back later for new listings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Permission Banner */}
      {!userLocation && !locationError && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-sm">Enable Location</h3>
                <p className="text-xs text-muted-foreground">
                  See how far properties are from you
                </p>
              </div>
            </div>
            <Button 
              onClick={requestLocation} 
              disabled={locationLoading}
              size="sm"
            >
              {locationLoading ? 'Getting Location...' : 'Enable'}
            </Button>
          </div>
        </div>
      )}

      {/* Location Error */}
      {locationError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-destructive" />
              <div>
                <h3 className="font-semibold text-sm">Location Access Denied</h3>
                <p className="text-xs text-muted-foreground">
                  {locationError}. Enable location in your browser settings to see distances.
                </p>
              </div>
            </div>
            <Button 
              onClick={requestLocation} 
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Property Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            showActions={true}
            userLocation={userLocation}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              {/* Previous Button */}
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              {/* Next Button */}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} of {filteredProperties.length} properties
      </div>
    </div>
  );
}
