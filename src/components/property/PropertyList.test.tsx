/**
 * PropertyList Component Tests
 * 
 * Tests for PropertyList component including rendering, pagination,
 * empty state, loading state, and error handling.
 * 
 * Requirements: 6.1, 22.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PropertyList from './PropertyList';
import { Property, PropertyType, AvailabilityStatus } from '../../types/property.types';
import { Timestamp } from 'firebase/firestore';
import React from 'react';

// Mock the PropertyContext
const mockRefreshProperties = vi.fn();
const mockSetFilters = vi.fn();

vi.mock('../../context/PropertyContext', () => ({
  useProperties: () => ({
    properties: mockProperties,
    loading: mockLoading,
    error: mockError,
    filters: {},
    setFilters: mockSetFilters,
    refreshProperties: mockRefreshProperties,
  }),
  PropertyProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'buyer', uid: 'test-user' },
    loading: false,
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock WishlistButton component
vi.mock('../wishlist/WishlistButton', () => ({
  default: () => <div data-testid="wishlist-button">Wishlist</div>,
}));

// Test state variables
let mockProperties: Property[] = [];
let mockLoading = false;
let mockError: string | null = null;

// Helper function to create mock property
const createMockProperty = (id: string, overrides?: Partial<Property>): Property => ({
  id,
  title: `Property ${id}`,
  description: 'Test property description',
  price: 1000000,
  propertyType: PropertyType.RESIDENTIAL,
  location: {
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
  },
  availabilityStatus: AvailabilityStatus.AVAILABLE,
  verificationStatus: 'approved',
  imageUrls: ['https://example.com/image.jpg'],
  ownerId: 'owner123',
  ownerRole: 'seller',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

// Wrapper component with router
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('PropertyList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProperties = [];
    mockLoading = false;
    mockError = null;
  });

  it('should display loading spinner while loading properties', () => {
    mockLoading = true;

    render(<PropertyList />, { wrapper: Wrapper });

    expect(screen.getByText('Loading properties...')).toBeInTheDocument();
  });

  it('should display error message when property loading fails', () => {
    mockError = 'Failed to fetch properties';

    render(<PropertyList />, { wrapper: Wrapper });

    expect(screen.getByText('Failed to Load Properties')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch properties')).toBeInTheDocument();
  });

  it('should display empty state when no properties are found', () => {
    mockProperties = [];

    render(<PropertyList />, { wrapper: Wrapper });

    expect(screen.getByText('No Properties Found')).toBeInTheDocument();
    expect(screen.getByText(/couldn't find any properties/i)).toBeInTheDocument();
  });

  it('should render property cards in a grid layout', () => {
    mockProperties = [
      createMockProperty('1'),
      createMockProperty('2'),
      createMockProperty('3'),
    ];

    render(<PropertyList />, { wrapper: Wrapper });

    expect(screen.getByText('Property 1')).toBeInTheDocument();
    expect(screen.getByText('Property 2')).toBeInTheDocument();
    expect(screen.getByText('Property 3')).toBeInTheDocument();
  });

  it('should display pagination when properties exceed items per page', () => {
    mockProperties = Array.from({ length: 15 }, (_, i) =>
      createMockProperty(`${i + 1}`)
    );

    render(<PropertyList itemsPerPage={12} />, { wrapper: Wrapper });

    // Should show pagination controls
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Should show results summary
    expect(screen.getByText(/Showing 1-12 of 15 properties/i)).toBeInTheDocument();
  });

  it('should not display pagination when properties are less than items per page', () => {
    mockProperties = Array.from({ length: 5 }, (_, i) =>
      createMockProperty(`${i + 1}`)
    );

    render(<PropertyList itemsPerPage={12} />, { wrapper: Wrapper });

    // Should not show pagination controls (Previous/Next buttons)
    const prevButtons = screen.queryAllByText('Previous');
    const nextButtons = screen.queryAllByText('Next');
    expect(prevButtons.length).toBe(0);
    expect(nextButtons.length).toBe(0);
    
    // Should show results summary
    expect(screen.getByText(/Showing 1-5 of 5 properties/i)).toBeInTheDocument();
  });

  it('should display correct number of properties per page', () => {
    mockProperties = Array.from({ length: 25 }, (_, i) =>
      createMockProperty(`${i + 1}`)
    );

    render(<PropertyList itemsPerPage={10} />, { wrapper: Wrapper });

    // Should only show first 10 properties
    expect(screen.getByText('Property 1')).toBeInTheDocument();
    expect(screen.getByText('Property 10')).toBeInTheDocument();
    expect(screen.queryByText('Property 11')).not.toBeInTheDocument();
  });

  it('should handle responsive grid layout classes', () => {
    mockProperties = [createMockProperty('1')];

    const { container } = render(<PropertyList />, { wrapper: Wrapper });

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1'); // Mobile
    expect(grid).toHaveClass('sm:grid-cols-2'); // Tablet
    expect(grid).toHaveClass('lg:grid-cols-3'); // Desktop
    expect(grid).toHaveClass('xl:grid-cols-4'); // Large desktop
  });
});
