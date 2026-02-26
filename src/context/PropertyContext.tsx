/**
 * Property Context
 * 
 * Provides property state management and operations throughout the app.
 * Manages properties list, loading states, filters, and property refresh functionality.
 * 
 * Requirements: 6.1, 6.2, 6.7
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Property, PropertyFilters } from '../types/property.types';
import * as propertyService from '../services/propertyService';

/**
 * Property context value interface
 */
interface PropertyContextValue {
  properties: Property[];
  loading: boolean;
  error: string | null;
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
  refreshProperties: (filtersToApply?: PropertyFilters) => Promise<void>;
}

/**
 * Property context
 */
const PropertyContext = createContext<PropertyContextValue | undefined>(undefined);

/**
 * PropertyProvider props
 */
interface PropertyProviderProps {
  children: ReactNode;
}

/**
 * Property Provider Component
 * 
 * Wraps the app and provides property state to all child components.
 * Manages property list, filters, loading states, and refresh functionality.
 * 
 * Requirements:
 * - 6.1: Display all approved properties to authenticated buyers
 * - 6.2: Filter properties matching criteria within 2 seconds
 * - 6.7: Return properties matching all filter conditions
 */
export function PropertyProvider({ children }: PropertyProviderProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PropertyFilters>({});

  /**
   * Refresh properties from Firestore with current filters
   * 
   * Fetches properties from the database applying current filter criteria.
   * Updates loading and error states during the operation.
   * 
   * @param filtersToApply - Optional filters to apply (uses current filters if not provided)
   * @throws Error if property retrieval fails
   * 
   * Requirements:
   * - 6.1: Display all approved properties
   * - 6.2: Filter properties within 2 seconds
   * - 6.7: Apply multiple filter conditions
   */
  const refreshProperties = useCallback(async (filtersToApply?: PropertyFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use provided filters or current filters
      const activeFilters = filtersToApply !== undefined ? filtersToApply : filters;
      console.log('Fetching properties with filters:', activeFilters); // Debug log
      const fetchedProperties = await propertyService.getProperties(activeFilters);
      console.log('Fetched properties count:', fetchedProperties.length); // Debug log
      setProperties(fetchedProperties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load properties';
      setError(errorMessage);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Set filters and trigger property refresh
   * 
   * Updates the filter state with new filter criteria and immediately refreshes properties.
   * 
   * @param newFilters - New filter criteria to apply
   * 
   * Requirements:
   * - 6.7: Support multiple simultaneous filters
   */
  const setFilters = useCallback((newFilters: PropertyFilters) => {
    console.log('Setting new filters:', newFilters); // Debug log
    setFiltersState(newFilters);
    // Immediately refresh with the new filters
    refreshProperties(newFilters);
  }, [refreshProperties]);

  const value: PropertyContextValue = {
    properties,
    loading,
    error,
    filters,
    setFilters,
    refreshProperties,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

/**
 * Custom hook to use property context
 * 
 * @returns PropertyContextValue - Property context value
 * @throws Error if used outside PropertyProvider
 * 
 * Requirement 6.1: Access property state throughout the app
 */
export function useProperties(): PropertyContextValue {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}
