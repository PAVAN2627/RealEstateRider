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
import { PropertyType, AvailabilityStatus, PropertyConfiguration, PropertyFilters as PropertyFiltersType } from '../../types/property.types';
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
  const [selectedConfigurations, setSelectedConfigurations] = useState<PropertyConfiguration[]>(filters.configuration || []);
  const [selectedAvailabilityStatus, setSelectedAvailabilityStatus] = useState<AvailabilityStatus[]>(
    filters.availabilityStatus || []
  );

  /**
   * Apply filters immediately
   */
  const applyFilters = useCallback(() => {
    const newFilters: PropertyFiltersType = {};
    
    // Only add filters if they have values
    if (priceMin && !isNaN(parseFloat(priceMin))) {
      newFilters.priceMin = parseFloat(priceMin);
    }
    
    if (priceMax && !isNaN(parseFloat(priceMax))) {
      newFilters.priceMax = parseFloat(priceMax);
    }
    
    if (location.trim()) {
      newFilters.location = location.trim();
    }
    
    if (selectedPropertyTypes.length > 0) {
      newFilters.propertyType = selectedPropertyTypes;
    }
    
    if (selectedConfigurations.length > 0) {
      newFilters.configuration = selectedConfigurations;
    }
    
    if (selectedAvailabilityStatus.length > 0) {
      newFilters.availabilityStatus = selectedAvailabilityStatus;
    }

    console.log('Applying filters:', newFilters); // Debug log
    // setFilters now automatically refreshes properties
    setFilters(newFilters);
  }, [priceMin, priceMax, location, selectedPropertyTypes, selectedConfigurations, selectedAvailabilityStatus, setFilters]);

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setLocation('');
    setSelectedPropertyTypes([]);
    setSelectedConfigurations([]);
    setSelectedAvailabilityStatus([]);
    
    // setFilters now automatically refreshes properties
    setFilters({});
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
    if (selectedConfigurations.length > 0) count++;
    if (selectedAvailabilityStatus.length > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="w-full space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="default">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Horizontal Filter Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Price Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min (₹)"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              min="0"
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Max (₹)"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              min="0"
              className="w-full"
            />
          </div>
        </div>

        {/* Location Search */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Location</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="City, state..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Property Type</Label>
          <div className="space-y-1.5">
            {Object.values(PropertyType).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedPropertyTypes.includes(type)}
                  onCheckedChange={() => {
                    const newTypes = selectedPropertyTypes.includes(type)
                      ? selectedPropertyTypes.filter(t => t !== type)
                      : [...selectedPropertyTypes, type];
                    setSelectedPropertyTypes(newTypes);
                  }}
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

        {/* Configuration */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Configuration</Label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {Object.values(PropertyConfiguration).map((config) => (
              <div key={config} className="flex items-center space-x-2">
                <Checkbox
                  id={`config-${config}`}
                  checked={selectedConfigurations.includes(config)}
                  onCheckedChange={() => {
                    const newConfigs = selectedConfigurations.includes(config)
                      ? selectedConfigurations.filter(c => c !== config)
                      : [...selectedConfigurations, config];
                    setSelectedConfigurations(newConfigs);
                  }}
                />
                <Label
                  htmlFor={`config-${config}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {config}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Availability</Label>
          <div className="space-y-1.5">
            {Object.values(AvailabilityStatus).map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={selectedAvailabilityStatus.includes(status)}
                  onCheckedChange={() => {
                    const newStatuses = selectedAvailabilityStatus.includes(status)
                      ? selectedAvailabilityStatus.filter(s => s !== status)
                      : [...selectedAvailabilityStatus, status];
                    setSelectedAvailabilityStatus(newStatuses);
                  }}
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
      </div>

      {/* Apply Filters Button */}
      <div className="flex justify-end">
        <Button
          onClick={applyFilters}
          size="lg"
          className="min-w-[200px]"
        >
          <Filter className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
