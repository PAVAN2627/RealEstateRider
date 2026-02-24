/**
 * PropertiesMapPage Component
 * 
 * Map view showing all approved properties as markers.
 * Buyers can click markers to see property information.
 */

import { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, List, Home, Heart, LayoutDashboard, MessageSquare, User } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user.types';
import { useProperties } from '@/context/PropertyContext';
import { Property } from '@/types/property.types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PropertyDetailsModal from '@/components/property/PropertyDetailsModal';

const PropertiesMapPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { properties, loading, error, refreshProperties } = useProperties();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError('Geolocation not supported');
    }
  }, []);

  // Filter properties with coordinates
  const propertiesWithCoordinates = properties.filter(
    (p) => p.verificationStatus === 'approved' && p.location.coordinates
  );

  // Load properties on mount
  useEffect(() => {
    refreshProperties();
  }, []);

  // Initialize map
  useEffect(() => {
    if (propertiesWithCoordinates.length === 0) {
      setMapLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        setMapLoading(true);
        setMapError(null);

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          throw new Error('Google Maps API key not configured');
        }

        // Load Google Maps script dynamically if not already loaded
        if (!window.google || !window.google.maps) {
          const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
          
          if (!existingScript) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            
            // Wait for script to load
            await new Promise<void>((resolve, reject) => {
              script.onload = () => resolve();
              script.onerror = () => reject(new Error('Failed to load Google Maps script'));
              document.head.appendChild(script);
            });
          } else {
            // Script exists, wait for it to load
            await new Promise<void>((resolve) => {
              const checkGoogleMaps = setInterval(() => {
                if (window.google && window.google.maps) {
                  clearInterval(checkGoogleMaps);
                  resolve();
                }
              }, 100);
            });
          }
        }

        // Wait a bit more to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 200));

        // Now check if map container exists
        if (!mapRef.current) {
          throw new Error('Map container not found');
        }

        // Calculate center based on all properties
        const bounds = new google.maps.LatLngBounds();
        propertiesWithCoordinates.forEach((property) => {
          if (property.location.coordinates) {
            bounds.extend({
              lat: property.location.coordinates.lat,
              lng: property.location.coordinates.lng,
            });
          }
        });

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = map;

        // Fit map to show all markers
        map.fitBounds(bounds);

        // Add user location marker if available
        if (userLocation) {
          // Add user location to bounds
          bounds.extend(userLocation);
          map.fitBounds(bounds);

          // Create user location marker (blue marker)
          const userMarker = new google.maps.Marker({
            position: userLocation,
            map,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
            zIndex: 1000,
          });

          userMarkerRef.current = userMarker;

          // Info window for user location
          const userInfoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px; color: #4285F4;">Your Location</h3>
                <p style="margin: 0; font-size: 12px; color: #666;">You are here</p>
              </div>
            `,
          });

          userMarker.addListener('click', () => {
            userInfoWindow.open(map, userMarker);
          });
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        // Helper function to calculate distance
        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
          const R = 6371; // Earth's radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          
          if (distance < 1) {
            return `${Math.round(distance * 1000)}m away from you`;
          }
          return `${distance.toFixed(1)} km away from you`;
        };

        // Create markers for each property
        propertiesWithCoordinates.forEach((property) => {
          if (!property.location.coordinates) return;

          const marker = new google.maps.Marker({
            position: {
              lat: property.location.coordinates.lat,
              lng: property.location.coordinates.lng,
            },
            map,
            title: property.title,
            animation: google.maps.Animation.DROP,
          });

          // Format price
          const formatPrice = (price: number) => {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(price);
          };

          // Calculate distance from user if location available
          let distanceText = '';
          if (userLocation && property.location.coordinates) {
            distanceText = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              property.location.coordinates.lat,
              property.location.coordinates.lng
            );
          }

          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; max-width: 280px;">
                ${property.imageUrls && property.imageUrls.length > 0 
                  ? `<img src="${property.imageUrls[0]}" alt="${property.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
                  : ''
                }
                <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 16px;">${property.title}</h3>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #059669; font-weight: 600;">${formatPrice(property.price)}</p>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">
                  ${property.location.city}, ${property.location.state}
                </p>
                ${distanceText ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #4285F4; font-weight: 500;">📍 ${distanceText}</p>` : ''}
                <p style="margin: 0; font-size: 12px; color: #888; text-transform: capitalize;">
                  ${property.propertyType}
                </p>
              </div>
            `,
          });

          // Show info window on marker click
          marker.addListener('click', () => {
            // Close all other info windows
            markersRef.current.forEach((m) => {
              const iw = (m as any).infoWindow;
              if (iw) iw.close();
            });
            
            infoWindow.open(map, marker);
            
            // Open property details modal
            setSelectedProperty(property);
            setIsModalOpen(true);
          });

          // Store info window reference
          (marker as any).infoWindow = infoWindow;

          markersRef.current.push(marker);
        });

        setMapLoading(false);
      } catch (err) {
        console.error('Error loading map:', err);
        setMapError(err instanceof Error ? err.message : 'Failed to load map');
        setMapLoading(false);
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [propertiesWithCoordinates.length, userLocation]);

  const getSidebarLinks = () => {
    if (!user) return [];

    return [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/properties', label: 'Browse Properties', icon: Home },
      { to: '/properties/map', label: 'Map View', icon: MapIcon },
      { to: '/wishlist', label: 'Wishlist', icon: Heart },
      { to: '/my-inquiries', label: 'My Inquiries', icon: MessageSquare },
      { to: '/profile', label: 'Profile', icon: User },
    ];
  };

  return (
    <DashboardLayout links={getSidebarLinks()} title="Properties Map">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading mb-2">Properties Map</h1>
          <p className="text-muted-foreground">
            View all properties on the map. Click markers to see details.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/properties')}
        >
          <List className="w-4 h-4 mr-2" />
          List View
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{propertiesWithCoordinates.length}</span> properties with location data
            {properties.length > propertiesWithCoordinates.length && (
              <span className="ml-2">
                ({properties.length - propertiesWithCoordinates.length} properties without coordinates)
              </span>
            )}
          </p>
          {userLocation && (
            <p className="text-sm text-blue-600 font-medium">
              📍 Your location detected
            </p>
          )}
          {locationError && (
            <p className="text-sm text-yellow-600">
              ⚠️ {locationError}
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {(loading || mapLoading) && (
        <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
          <div className="text-center space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading properties...' : 'Loading map...'}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {(error || mapError) && !loading && !mapLoading && (
        <ErrorMessage
          title="Failed to Load"
          message={error || mapError || 'Unknown error'}
          onRetry={refreshProperties}
        />
      )}

      {/* No Properties with Coordinates */}
      {!loading && !mapLoading && !error && !mapError && propertiesWithCoordinates.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50 rounded-lg border-2 border-dashed">
          <MapIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Properties with Location Data</h3>
          <p className="text-muted-foreground text-center max-w-md">
            There are no approved properties with coordinates available to display on the map.
            Properties need to have location coordinates to appear here.
          </p>
        </div>
      )}

      {/* Map Container - Always render but hide when loading/error */}
      <div 
        className={`rounded-lg overflow-hidden border shadow-lg ${
          loading || error || mapError || propertiesWithCoordinates.length === 0 ? 'hidden' : ''
        }`}
      >
        <div
          ref={mapRef}
          className="w-full h-[600px]"
        />
      </div>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }}
      />
    </DashboardLayout>
  );
};

export default PropertiesMapPage;
