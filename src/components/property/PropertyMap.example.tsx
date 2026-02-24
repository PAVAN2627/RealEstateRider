/**
 * PropertyMap Component Usage Examples
 * 
 * This file demonstrates how to use the PropertyMap component
 * in different scenarios.
 */

import React from 'react';
import PropertyMap from './PropertyMap';
import { Location } from '../../types/property.types';

/**
 * Example 1: Property with valid coordinates
 * The map will display with a marker at the specified location
 */
export function PropertyMapWithCoordinates() {
  const location: Location = {
    address: '123 Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    coordinates: {
      lat: 18.9432,
      lng: 72.8236,
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Luxury Apartment - Marine Drive</h2>
      <PropertyMap 
        location={location} 
        propertyTitle="Luxury Apartment - Marine Drive"
      />
    </div>
  );
}

/**
 * Example 2: Property without coordinates
 * The component will display a fallback UI with address text
 */
export function PropertyMapWithoutCoordinates() {
  const location: Location = {
    address: '456 MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    // No coordinates provided
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Commercial Space - MG Road</h2>
      <PropertyMap 
        location={location} 
        propertyTitle="Commercial Space - MG Road"
      />
    </div>
  );
}

/**
 * Example 3: Integration in a property details page
 * Shows how PropertyMap would typically be used alongside other property information
 */
export function PropertyDetailsWithMap() {
  const property = {
    id: '1',
    title: 'Modern Villa with Garden',
    description: 'Beautiful 4BHK villa with spacious garden and modern amenities',
    price: 15000000,
    location: {
      address: '789 Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      coordinates: {
        lat: 17.4326,
        lng: 78.4071,
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Property Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
        <p className="text-xl text-primary font-semibold">
          ₹{property.price.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Property Description */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-muted-foreground">{property.description}</p>
      </div>

      {/* Property Location Map */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Location</h2>
        <PropertyMap 
          location={property.location} 
          propertyTitle={property.title}
        />
      </div>
    </div>
  );
}

/**
 * Example 4: Responsive grid layout with multiple properties
 * Shows PropertyMap in a grid of property cards
 */
export function PropertyMapGrid() {
  const properties = [
    {
      id: '1',
      title: 'Beachfront Villa',
      location: {
        address: 'Calangute Beach Road',
        city: 'Goa',
        state: 'Goa',
        coordinates: { lat: 15.5394, lng: 73.7554 },
      },
    },
    {
      id: '2',
      title: 'Mountain View Cottage',
      location: {
        address: 'Mall Road',
        city: 'Shimla',
        state: 'Himachal Pradesh',
        coordinates: { lat: 31.1048, lng: 77.1734 },
      },
    },
    {
      id: '3',
      title: 'City Center Apartment',
      location: {
        address: 'Connaught Place',
        city: 'Delhi',
        state: 'Delhi',
        // No coordinates - will show fallback
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Featured Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="space-y-2">
            <h3 className="text-lg font-semibold">{property.title}</h3>
            <PropertyMap 
              location={property.location} 
              propertyTitle={property.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
