/**
 * PropertyMap Component Tests
 * 
 * Tests for PropertyMap component functionality including:
 * - Rendering with valid coordinates
 * - Fallback UI when coordinates are missing
 * - Loading state display
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PropertyMap from './PropertyMap';
import { Location } from '../../types/property.types';

// Mock Google Maps API
const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
};

const mockMarker = {
  setMap: vi.fn(),
  addListener: vi.fn(),
};

const mockInfoWindow = {
  open: vi.fn(),
};

// Mock @googlemaps/js-api-loader
vi.mock('@googlemaps/js-api-loader', () => ({
  Loader: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock Google Maps global
beforeEach(() => {
  // @ts-ignore
  global.google = {
    maps: {
      Map: vi.fn().mockImplementation(() => mockMap),
      Marker: vi.fn().mockImplementation(() => mockMarker),
      InfoWindow: vi.fn().mockImplementation(() => mockInfoWindow),
      Animation: {
        DROP: 'DROP',
      },
    },
  };
});

describe('PropertyMap', () => {
  const validLocation: Location = {
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    coordinates: {
      lat: 19.076,
      lng: 72.8777,
    },
  };

  const locationWithoutCoordinates: Location = {
    address: '456 Park Avenue',
    city: 'Delhi',
    state: 'Delhi',
  };

  it('renders loading state initially when coordinates are provided', () => {
    render(<PropertyMap location={validLocation} />);
    expect(screen.getByText(/loading map/i)).toBeInTheDocument();
  });

  it('displays fallback UI when coordinates are missing', () => {
    render(<PropertyMap location={locationWithoutCoordinates} />);
    
    expect(screen.getByText(/location/i)).toBeInTheDocument();
    expect(screen.getByText(/456 Park Avenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Delhi, Delhi/i)).toBeInTheDocument();
    expect(screen.getByText(/map view unavailable/i)).toBeInTheDocument();
  });

  it('displays address information in fallback UI', () => {
    render(<PropertyMap location={locationWithoutCoordinates} />);
    
    // Use regex to match text that might be split across elements
    expect(screen.getByText(/456 Park Avenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Delhi.*Delhi/i)).toBeInTheDocument();
  });

  it('renders map container when coordinates are provided', async () => {
    const { container } = render(<PropertyMap location={validLocation} propertyTitle="Test Property" />);
    
    await waitFor(() => {
      const mapContainer = container.querySelector('[class*="aspect-video"]');
      expect(mapContainer).toBeInTheDocument();
    });
  });

  it('displays address below map when coordinates are provided', async () => {
    render(<PropertyMap location={validLocation} />);
    
    await waitFor(() => {
      expect(screen.getByText(validLocation.address)).toBeInTheDocument();
      expect(screen.getByText(`${validLocation.city}, ${validLocation.state}`)).toBeInTheDocument();
    });
  });

  it('uses custom property title when provided', async () => {
    const customTitle = 'Luxury Villa';
    render(<PropertyMap location={validLocation} propertyTitle={customTitle} />);
    
    // The title is used in the marker and info window, which are created in the effect
    await waitFor(() => {
      expect(mockMarker.addListener).toHaveBeenCalled();
    });
  });

  it('handles missing API key gracefully', async () => {
    // Mock missing API key
    const originalEnv = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    // @ts-ignore
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY = '';

    render(<PropertyMap location={validLocation} />);

    await waitFor(() => {
      expect(screen.getByText(/unable to load map/i)).toBeInTheDocument();
    });

    // Restore
    // @ts-ignore
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY = originalEnv;
  });

  it('renders with responsive aspect ratio', () => {
    const { container } = render(<PropertyMap location={validLocation} />);
    
    const mapContainer = container.querySelector('[class*="aspect-video"]');
    expect(mapContainer).toBeInTheDocument();
  });

  it('displays MapPin icon in fallback UI', () => {
    const { container } = render(<PropertyMap location={locationWithoutCoordinates} />);
    
    // Check for MapPin icon (lucide-react renders as svg)
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
