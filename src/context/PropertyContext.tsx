/**
 * Property Context
 * 
 * Provides property state management and operations throughout the app.
 * Manages properties list, loading states, filters, and property refresh functionality.
 * 
 * Requirements: 6.1, 6.2, 6.7
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
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
 * Auto-fetches properties on mount and manages filter/refresh state.
 * 
 * Requirements:
 * - 6.1: Display all approved properties to authenticated buyers
 * - 6.2: Filter properties matching criteria within 2 seconds
 * - 6.7: Return properties matching all filter conditions
 */
export function PropertyProvider({ children }: PropertyProviderProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PropertyFilters>({});

  // Use a ref so refreshProperties always has the latest filters without re-creating
  const filtersRef = useRef<PropertyFilters>({});

  const refreshProperties = useCallback(async (filtersToApply?: PropertyFilters) => {
    setLoading(true);
    setError(null);

    try {
      const activeFilters = filtersToApply !== undefined ? filtersToApply : filtersRef.current;
      const fetchedProperties = await propertyService.getProperties(activeFilters);
      setProperties(fetchedProperties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []); // stable — no deps needed because we use filtersRef

  // Auto-fetch on mount
  useEffect(() => {
    refreshProperties();
  }, [refreshProperties]);

  const setFilters = useCallback((newFilters: PropertyFilters) => {
    filtersRef.current = newFilters;
    setFiltersState(newFilters);
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
 */
export function useProperties(): PropertyContextValue {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}
