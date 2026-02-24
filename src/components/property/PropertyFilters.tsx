/**
 * PropertyFilters Component
 * 
 * Provides filtering controls for property search including price range,
 * property type, location search, and availability status.
 * 
 * Requirements: 6.3, 6.4, 6.5, 6.6, 6.7
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { PropertyType, AvailabilityStatus, PropertyFilters as PropertyFiltersType } from '../../types/property.types';
import { useProperties } from '../../context/PropertyContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

/**
 * PropertyFilters Component
 * 
 * Implements comprehensive property filtering with:
 * - Price range inputs (min/max)
 * - Property type multi-select
 * - Location text search with debouncing
 * - Availability status filter
 * - Clear/reset filters functionality
 * - Active filter count badge
 * - Responsive layout (stack on mobile, horizontal on desktop)
 * 
 * Requirements:
 * - 6.3: Support filtering by price range with minimum and maximum values
 * - 6.4: Support filtering by property type
 * - 6.5: Support filtering by location using text search
 * - 6.6: Support filtering by availability status
 * - 6.7: Return properties matching all filter conditions
 */
export default function PropertyFilters() {
  const { filters, setFilters, refreshProperties } = useProperties();
  
  // Local state for form inputs
  const [priceMin, setPriceMin] = useState<string>(filters.priceMin?.toString() || '');
  const [priceMax, setPriceMax] = useState<string>(filters.priceMax?.toString() || '');
  const [location, setLocation] = useState<string>(filters.location || '');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<PropertyType[]>(filters.propertyType || []);
  const [selectedAvailabilityStatus, setSelectedAvailabilityStatus] = useState<AvailabilityStatus[]>(
    filters.availabilityStatus || []
  );

  // Debounce timer ref
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Debounced filter update
   * Delays filter application to avoid excessive re-renders during typing
   */
  const debouncedUpdateFilters = useCallback((newFilters: PropertyFiltersType) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setFilters(newFilters);
      refreshProperties();
    }, 500); // 500ms debounce delay
  }, [setFilters, refreshProperties]);

  /**
   * Apply filters immediately (for non-text inputs)
   */
  const applyFilters = useCallback(() => {
    const newFilters: PropertyFiltersType = {
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      location: location.trim() || undefined,
      propertyType: selectedPropertyTypes.length > 0 ? selectedPropertyTypes : undefined,
      availabilityStatus: selectedAvailabilityStatus.length > 0 ? selectedAvailabilityStatus : undefined,
    };

    setFilters(newFilters);
    refreshProperties();
  }, [priceMin, priceMax, location, selectedPropertyTypes, selectedAvailabilityStatus, setFilters, refreshProperties]);

  /**
   * Handle location search with debouncing
   */
  const handleLocationChange = (value: string) => {
    setLocation(value);
    
    const newFilters: PropertyFiltersType = {
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      location: value.trim() || undefined,
      propertyType: selectedPropertyTypes.length > 0 ? selectedPropertyTypes : undefined,
      availabilityStatus: selectedAvailabilityStatus.length > 0 ? selectedAvailabilityStatus : undefined,
    };

    debouncedUpdateFilters(newFilters);
  };

  /**
   * Handle property type toggle
   */
  const handlePropertyTypeToggle = (type: PropertyType) => {
    const newTypes = selectedPropertyTypes.includes(type)
      ? selectedPropertyTypes.filter(t => t !== type)
      : [...selectedPropertyTypes, type];
    
    setSelectedPropertyTypes(newTypes);
  };

  /**
   * Handle availability status toggle
   */
  const handleAvailabilityToggle = (status: AvailabilityStatus) => {
    const newStatuses = selectedAvailabilityStatus.includes(status)
      ? selectedAvailabilityStatus.filter(s => s !== status)
      : [...selectedAvailabilityStatus, status];
    
    setSelectedAvailabilityStatus(newStatuses);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setLocation('');
    setSelectedPropertyTypes([]);
    setSelectedAvailabilityStatus([]);
    
    setFilters({});
    refreshProperties();
  };

  /**
   * Calculate active filter count
   */
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (priceMin) count++;
    if (priceMax) count++;
    if (location.trim()) count++;
    if (selectedPropertyTypes.length > 0) count++;
    if (selectedAvailabilityStatus.length > 0) count++;
    return count;
  };

  // Apply filters when non-text inputs change
  useEffect(() => {
    if (selectedPropertyTypes.length > 0 || selectedAvailabilityStatus.length > 0) {
      applyFilters();
    }
  }, [selectedPropertyTypes, selectedAvailabilityStatus]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Price Range</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="priceMin" className="text-sm">Minimum Price</Label>
              <Input
                id="priceMin"
                type="number"
                placeholder="Min (₹)"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                onBlur={applyFilters}
                min="0"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMax" className="text-sm">Maximum Price</Label>
              <Input
                id="priceMax"
                type="number"
                placeholder="Max (₹)"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                onBlur={applyFilters}
                min="0"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Location Search */}
        <div className="space-y-3">
          <Label htmlFor="location" className="text-base font-semibold">Location</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              type="text"
              placeholder="Search by city, state, or address..."
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Property Type</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(PropertyType).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedPropertyTypes.includes(type)}
                  onCheckedChange={() => handlePropertyTypeToggle(type)}
                />
                <Label
                  htmlFor={`type-${type}`}
                  className="text-sm font-normal capitalize cursor-pointer"
                >
                  {type.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Status */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Availability</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(AvailabilityStatus).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={selectedAvailabilityStatus.includes(status)}
                  onCheckedChange={() => handleAvailabilityToggle(status)}
                />
                <Label
                  htmlFor={`status-${status}`}
                  className="text-sm font-normal capitalize cursor-pointer"
                >
                  {status.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Apply Filters Button (Mobile) */}
        <div className="sm:hidden">
          <Button
            onClick={applyFilters}
            className="w-full"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
