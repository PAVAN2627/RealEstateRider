/**
 * PropertyMap Component
 * 
 * Displays property location on an interactive Google Map with marker,
 * zoom and pan controls. Handles missing coordinates gracefully by
 * showing address text fallback.
 * 
 * Requirements: 7.3, 7.4, 7.5
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { Location } from '../../types/property.types';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import LoadingSpinner from '../shared/LoadingSpinner';

interface PropertyMapProps {
  location: Location;
  propertyTitle?: string;
}

/**
 * PropertyMap Component
 * 
 * Features:
 * - Google Maps integration with marker at property location
 * - Zoom and pan controls (default Google Maps controls)
 * - Centers map on property coordinates
 * - Displays loading state while map initializes
 * - Fallback UI showing address text when coordinates are missing
 * - Responsive container with fixed aspect ratio
 * - Error handling for map loading failures
 * 
 * Requirements:
 * - 7.3: Display property location on an interactive map
 * - 7.4: Allow zoom and pan interactions on the property map
 * - 7.5: Display location unavailable message when no coordinates
 */
export default function PropertyMap({
  location,
  propertyTitle = 'Property',
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no coordinates, don't try to load the map
    if (!location.coordinates) {
      setIsLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get API key from environment variables
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          throw new Error('Google Maps API key not configured');
        }

        // Load Google Maps script dynamically
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        // Wait for script to load
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Google Maps script'));
          
          // Check if script already exists
          const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
          if (existingScript) {
            resolve();
          } else {
            document.head.appendChild(script);
          }
        });

        // Initialize map if ref is available
        if (!mapRef.current) {
          throw new Error('Map container not found');
        }

        const { lat, lng } = location.coordinates!;

        // Create map instance
        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = map;

        // Create marker
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          title: propertyTitle,
          animation: google.maps.Animation.DROP,
        });

        markerRef.current = marker;

        // Create info window with property address
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${propertyTitle}</h3>
              <p style="margin: 0; font-size: 12px; color: #666;">
                ${location.address}<br/>
                ${location.city}, ${location.state}
              </p>
            </div>
          `,
        });

        // Show info window on marker click
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      initMap();
    }

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [location, propertyTitle]);

  // Fallback UI when coordinates are not available
  if (!location.coordinates) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {location.address}
                  <br />
                  {location.city}, {location.state}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Map view unavailable - coordinates not provided
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Unable to load map</p>
                <p className="text-sm">{error}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {location.address}, {location.city}, {location.state}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        {/* Loading State */}
        {isLoading && (
          <div className="w-full aspect-video flex items-center justify-center bg-gray-100">
            <div className="text-center space-y-2">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div
          ref={mapRef}
          className="w-full aspect-video"
          style={{ display: isLoading ? 'none' : 'block' }}
        />

        {/* Address Display Below Map */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">{location.address}</p>
              <p className="text-muted-foreground">
                {location.city}, {location.state}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
