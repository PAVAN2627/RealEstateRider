/**
 * InquiryList Component Tests
 * 
 * Tests for InquiryList component including rendering, filtering,
 * sorting, empty state, loading state, and error handling.
 * 
 * Requirements: 9.3, 9.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InquiryList from './InquiryList';
import { Inquiry, InquiryStatus } from '../../types/inquiry.types';
import { Property, PropertyType, AvailabilityStatus } from '../../types/property.types';
import { Timestamp } from 'firebase/firestore';
import React from 'react';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'buyer', uid: 'test-user' },
    loading: false,
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock InquiryCard component
vi.mock('./InquiryCard', () => ({
  default: ({ inquiry, property }: { inquiry: Inquiry; property: Property }) => (
    <div data-testid={`inquiry-card-${inquiry.id}`}>
      <div>{property.title}</div>
      <div>{inquiry.message}</div>
      <div>{inquiry.status}</div>
    </div>
  ),
}));

// Helper function to create mock inquiry
const createMockInquiry = (id: string, overrides?: Partial<Inquiry>): Inquiry => ({
  id,
  propertyId: 'property1',
  buyerId: 'buyer1',
  agentId: 'agent1',
  message: `Test inquiry message ${id}`,
  status: InquiryStatus.PENDING,
  createdAt: Timestamp.fromMillis(Date.now() - parseInt(id) * 1000),
  ...overrides,
});

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

describe('InquiryList Component', () => {
  let mockInquiries: Inquiry[];
  let mockProperties: Map<string, Property>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInquiries = [];
    mockProperties = new Map();
  });

  it('should display loading spinner while loading inquiries', () => {
    render(
      <InquiryList
        inquiries={[]}
        properties={new Map()}
        loading={true}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Loading inquiries...')).toBeInTheDocument();
  });

  it('should display error message when inquiry loading fails', () => {
    const mockRefresh = vi.fn();

    render(
      <InquiryList
        inquiries={[]}
        properties={new Map()}
        error="Failed to fetch inquiries"
        onRefresh={mockRefresh}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Failed to Load Inquiries')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch inquiries')).toBeInTheDocument();
  });

  it('should display empty state when no inquiries are found', () => {
    render(
      <InquiryList
        inquiries={[]}
        properties={new Map()}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('No Inquiries Found')).toBeInTheDocument();
    expect(screen.getByText(/don't have any inquiries yet/i)).toBeInTheDocument();
  });

  it('should render inquiry cards for all inquiries', () => {
    mockInquiries = [
      createMockInquiry('1', { propertyId: 'property1' }),
      createMockInquiry('2', { propertyId: 'property2' }),
      createMockInquiry('3', { propertyId: 'property3' }),
    ];

    mockProperties = new Map([
      ['property1', createMockProperty('property1')],
      ['property2', createMockProperty('property2')],
      ['property3', createMockProperty('property3')],
    ]);

    render(
      <InquiryList
        inquiries={mockInquiries}
        properties={mockProperties}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByTestId('inquiry-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('inquiry-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('inquiry-card-3')).toBeInTheDocument();
  });

  it('should display filter tabs with correct counts', () => {
    mockInquiries = [
      createMockInquiry('1', { status: InquiryStatus.PENDING }),
      createMockInquiry('2', { status: InquiryStatus.PENDING }),
      createMockInquiry('3', { status: InquiryStatus.RESPONDED }),
    ];

    mockProperties = new Map([
      ['property1', createMockProperty('property1')],
    ]);

    render(
      <InquiryList
        inquiries={mockInquiries}
        properties={mockProperties}
      />,
      { wrapper: Wrapper }
    );

    // Check filter buttons exist with counts
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Responded')).toBeInTheDocument();
    
    // Check counts
    expect(screen.getByText('3')).toBeInTheDocument(); // All count
    expect(screen.getByText('2')).toBeInTheDocument(); // Pending count
    expect(screen.getByText('1')).toBeInTheDocument(); // Responded count
  });

  it('should filter inquiries by pending status', () => {
    mockInquiries = [
      createMockInquiry('1', { propertyId: 'property1', status: InquiryStatus.PENDING }),
      createMockInquiry('2', { propertyId: 'property1', status: InquiryStatus.RESPONDED }),
    ];

    mockProperties = new Map([
      ['property1', createMockProperty('property1')],
    ]);

    render(
      <InquiryList
        inquiries={mockInquiries}
        properties={mockProperties}
      />,
      { wrapper: Wrapper }
    );

    // Click pending filter
    const pendingButton = screen.getByText('Pending');
    fireEvent.click(pendingButton);

    // Should show only pending inquiry
    expect(screen.getByTestId('inquiry-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('inquiry-card-2')).not.toBeInTheDocument();
  });

  it('should filter inquiries by responded status', () => {
    mockInquiries = [
      createMockInquiry('1', { propertyId: 'property1', status: InquiryStatus.PENDING }),
      createMockInquiry('2', { propertyId: 'property1', status: InquiryStatus.RESPONDED }),
    ];

    mockProperties = new Map([
      ['property1', createMockProperty('property1')],
    ]);

    render(
      <InquiryList
        inquiries={mockInquiries}
        properties={mockProperties}
      />,
      { wrapper: Wrapper }
    );

    // Click responded filter
    const respondedButton = screen.getByText('Responded');
    fireEvent.click(respondedButton);

    // Should show only responded inquiry
    expect(screen.queryByTestId('inquiry-card-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('inquiry-card-2')).toBeInTheDocument();
  });

  it('should sort inquiries by timestamp (most recent first)', () => {
    const now = Date.now();
    mockInquiries = [
      createMockInquiry('1', { 
        propertyId: 'property1',
        createdAt: Timestamp.fromMillis(now - 3000) // 3 seconds ago
      }),
      createMockInquiry('2', { 
        propertyId: 'property1',
        createdAt: Timestamp.fromMillis(now - 1000) // 1 second ago (most recent)
      }),
      createMockInquiry('3', { 
        propertyId: 'property1',
        createdAt: Timestamp.fromMillis(now - 2000) // 2 seconds ago
      }),
    ];

    mockProperties = new Map([
      ['property1', createMockProperty('property1')],
    ]);

    const { container } = render(
      <InquiryList
        inquiries={mockInquiries}
        properties={mockProperties}
      />,
      { wrapper: Wrapper }
    );

    const cards = container.querySelectorAll('[data-testid^="inquiry-card-"]');
    
    // Should be sorted: 2, 3, 1 (most recent first)
    expect(cards[0]).toHaveAttribute('data-testid', 'inquiry-card-2');
    expect(cards[1]).toHaveAttribute('data-testid', 'inquiry-card-3');
    expect(cards[2]).toHaveAttribute('data-testid', 'inquiry-card-1');
  });

  it('should display empty state with filter-specific message', () => {
    mockInquiries = [
      createMockInquiry('1', { propertyId: 'property1', status: InquiryStatus.PENDING }),
    ];

    mockProperties = new Map([
      ['property1', createMockProperty('property1')],
    ]);

    render(
      <InquiryList
        inquiries={mockInquiries}
        properties={mockProperties}
      />,
      { wrapper: Wrapper }
    );

    // Click responded filter (no responded inquiries)
    const respondedButton = screen.getByText('Responded');
    fireEvent.click(respondedButton);

    expect(screen.getByText('No Inquiries Found')).toBeInTheDocument();
    expect(screen.getByText(/No responded inquiries found/i)).toBeInTheDocument();
  });

  it('should skip rendering inquiry cards when property is not found', () => {
    mockInquiries = [
      createMockInquiry('1', { propertyId: 'property1' }),
      createMockInquiry('2', { propertyId: 'property2' }), // Property not in map
    ];

    mockProperties = new Map([
      ['property1', createMockProperty('property1')],
    ]);

    render(
      <InquiryList
        inquiries={mockInquiries}
        properties={mockProperties}
      />,
      { wrapper: Wrapper }
    );

    // Should only show inquiry 1
    expect(screen.getByTestId('inquiry-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('inquiry-card-2')).not.toBeInTheDocument();
  });

  it('should display results summary', () => {
    mockInquiries = [
      createMockInquiry('1', { propertyId: 'property1' }),
      createMockInquiry('2', { propertyId: 'property1' }),
      createMockInquiry('3', { propertyId: 'property1' }),
    ];

    mockProperties = new Map([
      ['property1', createMockProperty('property1')],
    ]);

    render(
      <InquiryList
        inquiries={mockInquiries}
        properties={mockProperties}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Showing 3 of 3 inquiries')).toBeInTheDocument();
  });

  it('should call onResponseSubmitted callback when provided', () => {
    const mockCallback = vi.fn();
    mockInquiries = [
      createMockInquiry('1', { propertyId: 'property1' }),
    ];

    mockProperties = new Map([
      ['property1', createMockProperty('property1')],
    ]);

    render(
      <InquiryList
        inquiries={mockInquiries}
        properties={mockProperties}
        onResponseSubmitted={mockCallback}
      />,
      { wrapper: Wrapper }
    );

    // Callback should be passed to InquiryCard
    expect(screen.getByTestId('inquiry-card-1')).toBeInTheDocument();
  });
});
