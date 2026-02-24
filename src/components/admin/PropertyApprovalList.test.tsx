/**
 * PropertyApprovalList Component Tests
 * 
 * Tests for the PropertyApprovalList component functionality.
 * 
 * Requirements: 5.2, 5.3, 5.4, 5.5, 13.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Timestamp } from 'firebase/firestore';
import PropertyApprovalList from './PropertyApprovalList';
import { Property, PropertyType, AvailabilityStatus } from '../../types/property.types';
import * as propertyService from '../../services/propertyService';

// Mock the services
vi.mock('../../services/propertyService');

// Mock the toast hook
vi.mock('../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the auth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'admin-123', email: 'admin@example.com' },
  }),
}));

/**
 * Helper function to create mock property
 */
const createMockProperty = (id: string, overrides?: Partial<Property>): Property => ({
  id,
  title: `Property ${id}`,
  description: `Description for property ${id}`,
  price: 250000,
  propertyType: PropertyType.RESIDENTIAL,
  location: {
    address: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    coordinates: { lat: 39.7817, lng: -89.6501 },
  },
  availabilityStatus: AvailabilityStatus.AVAILABLE,
  verificationStatus: 'pending',
  imageUrls: [`https://example.com/image-${id}-1.jpg`],
  ownershipDocumentUrls: [`https://example.com/doc-${id}.pdf`],
  ownerId: `owner-${id}`,
  ownerRole: 'seller',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  ...overrides,
});

describe('PropertyApprovalList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Component renders loading state initially
   * Requirement: 5.2
   */
  it('should display loading state initially', () => {
    vi.mocked(propertyService.getProperties).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<PropertyApprovalList />);
    
    expect(screen.getByText(/loading pending properties/i)).toBeInTheDocument();
  });

  /**
   * Test: Component displays pending properties
   * Requirement: 5.2
   */
  it('should display list of pending properties', async () => {
    const mockProperties = [
      createMockProperty('1', { title: 'Beautiful Home' }),
      createMockProperty('2', { title: 'Modern Apartment' }),
      createMockProperty('3', { title: 'Commercial Space' }),
    ];

    vi.mocked(propertyService.getProperties).mockResolvedValue(mockProperties);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Beautiful Home')).toBeInTheDocument();
      expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
      expect(screen.getByText('Commercial Space')).toBeInTheDocument();
    });

    expect(screen.getByText('3 Pending')).toBeInTheDocument();
  });

  /**
   * Test: Component displays empty state when no pending properties
   * Requirement: 5.2
   */
  it('should display empty state when no pending properties', async () => {
    vi.mocked(propertyService.getProperties).mockResolvedValue([]);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText(/no pending properties/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Component filters and displays only pending properties
   * Requirement: 5.2
   */
  it('should filter and display only pending properties', async () => {
    const mockProperties = [
      createMockProperty('1', { verificationStatus: 'pending', title: 'Pending Property' }),
      createMockProperty('2', { verificationStatus: 'approved', title: 'Approved Property' }),
      createMockProperty('3', { verificationStatus: 'rejected', title: 'Rejected Property' }),
    ];

    vi.mocked(propertyService.getProperties).mockResolvedValue(mockProperties);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Pending Property')).toBeInTheDocument();
    });

    expect(screen.queryByText('Approved Property')).not.toBeInTheDocument();
    expect(screen.queryByText('Rejected Property')).not.toBeInTheDocument();
    expect(screen.getByText('1 Pending')).toBeInTheDocument();
  });

  /**
   * Test: Component displays property details correctly
   * Requirement: 5.5
   */
  it('should display property details including title, price, location, and type', async () => {
    const mockProperty = createMockProperty('1', {
      title: 'Luxury Villa',
      price: 500000,
      propertyType: PropertyType.RESIDENTIAL,
      location: {
        address: '456 Oak Ave',
        city: 'Beverly Hills',
        state: 'CA',
      },
    });

    vi.mocked(propertyService.getProperties).mockResolvedValue([mockProperty]);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Luxury Villa')).toBeInTheDocument();
      expect(screen.getByText(/\$500,000/)).toBeInTheDocument();
      expect(screen.getByText(/456 Oak Ave, Beverly Hills, CA/)).toBeInTheDocument();
      expect(screen.getByText('RESIDENTIAL')).toBeInTheDocument();
    });
  });

  /**
   * Test: Component displays property images
   * Requirement: 5.5
   */
  it('should display property images and image count', async () => {
    const mockProperty = createMockProperty('1', {
      imageUrls: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ],
    });

    vi.mocked(propertyService.getProperties).mockResolvedValue([mockProperty]);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText(/images \(3\)/i)).toBeInTheDocument();
    });

    // Check that the first image is displayed
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
  });

  /**
   * Test: Component displays ownership documents button
   * Requirement: 5.5
   */
  it('should display documents button when ownership documents are available', async () => {
    const mockProperty = createMockProperty('1', {
      ownershipDocumentUrls: ['https://example.com/doc1.pdf', 'https://example.com/doc2.pdf'],
    });

    vi.mocked(propertyService.getProperties).mockResolvedValue([mockProperty]);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText(/documents/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Approve button opens confirmation dialog
   * Requirement: 5.3
   */
  it('should open confirmation dialog when approve button is clicked', async () => {
    const mockProperty = createMockProperty('1', { title: 'Test Property' });

    vi.mocked(propertyService.getProperties).mockResolvedValue([mockProperty]);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
    });

    const approveButtons = screen.getAllByRole('button', { name: /approve/i });
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to approve/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Reject button opens dialog with reason input
   * Requirement: 5.4, 13.5
   */
  it('should open dialog with reason input when reject button is clicked', async () => {
    const mockProperty = createMockProperty('1', { title: 'Test Property' });

    vi.mocked(propertyService.getProperties).mockResolvedValue([mockProperty]);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByRole('button', { name: /reject/i });
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/please provide a reason for rejecting/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter rejection reason/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Approving property calls approveProperty with correct parameters
   * Requirement: 5.3
   */
  it('should call approveProperty with property ID and admin ID when approved', async () => {
    const mockProperty = createMockProperty('1');

    vi.mocked(propertyService.getProperties).mockResolvedValue([mockProperty]);
    vi.mocked(propertyService.approveProperty).mockResolvedValue();

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument();
    });

    // Click approve button
    const approveButtons = screen.getAllByRole('button', { name: /approve/i });
    fireEvent.click(approveButtons[0]);

    // Confirm in dialog
    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to approve/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /^approve$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(propertyService.approveProperty).toHaveBeenCalledWith('1', 'admin-123');
    });
  });

  /**
   * Test: Rejecting property requires reason
   * Requirement: 5.4, 13.5
   */
  it('should require rejection reason before rejecting property', async () => {
    const mockProperty = createMockProperty('1');

    vi.mocked(propertyService.getProperties).mockResolvedValue([mockProperty]);
    vi.mocked(propertyService.rejectProperty).mockResolvedValue();

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument();
    });

    // Click reject button
    const rejectButtons = screen.getAllByRole('button', { name: /reject/i });
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter rejection reason/i)).toBeInTheDocument();
    });

    // Try to confirm without entering reason
    const confirmButton = screen.getByRole('button', { name: /^reject$/i });
    expect(confirmButton).toBeDisabled();
  });

  /**
   * Test: Rejecting property calls rejectProperty with reason
   * Requirement: 5.4, 13.5
   */
  it('should call rejectProperty with property ID, admin ID, and reason when rejected', async () => {
    const mockProperty = createMockProperty('1');

    vi.mocked(propertyService.getProperties).mockResolvedValue([mockProperty]);
    vi.mocked(propertyService.rejectProperty).mockResolvedValue();

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument();
    });

    // Click reject button
    const rejectButtons = screen.getAllByRole('button', { name: /reject/i });
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter rejection reason/i)).toBeInTheDocument();
    });

    // Enter rejection reason
    const reasonInput = screen.getByPlaceholderText(/enter rejection reason/i);
    fireEvent.change(reasonInput, { target: { value: 'Invalid documentation' } });

    // Confirm rejection
    const confirmButton = screen.getByRole('button', { name: /^reject$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(propertyService.rejectProperty).toHaveBeenCalledWith(
        '1',
        'admin-123',
        'Invalid documentation'
      );
    });
  });

  /**
   * Test: Component refreshes list after approval
   * Requirement: 5.3
   */
  it('should refresh property list after successful approval', async () => {
    const mockProperty = createMockProperty('1');

    let callCount = 0;
    vi.mocked(propertyService.getProperties).mockImplementation(async () => {
      callCount++;
      // Return property on first call, empty on subsequent calls (after approval)
      return callCount === 1 ? [mockProperty] : [];
    });
    vi.mocked(propertyService.approveProperty).mockResolvedValue();

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument();
    });

    // Approve property
    const approveButtons = screen.getAllByRole('button', { name: /approve/i });
    fireEvent.click(approveButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /^approve$/i });
    fireEvent.click(confirmButton);

    // Wait for refresh
    await waitFor(() => {
      expect(callCount).toBe(2);
    });
  });

  /**
   * Test: Component refreshes list after rejection
   * Requirement: 5.4
   */
  it('should refresh property list after successful rejection', async () => {
    const mockProperty = createMockProperty('1');

    let callCount = 0;
    vi.mocked(propertyService.getProperties).mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [mockProperty] : [];
    });
    vi.mocked(propertyService.rejectProperty).mockResolvedValue();

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Property 1')).toBeInTheDocument();
    });

    // Reject property
    const rejectButtons = screen.getAllByRole('button', { name: /reject/i });
    fireEvent.click(rejectButtons[0]);

    const reasonInput = screen.getByPlaceholderText(/enter rejection reason/i);
    fireEvent.change(reasonInput, { target: { value: 'Test reason' } });

    const confirmButton = screen.getByRole('button', { name: /^reject$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(callCount).toBe(2);
    });
  });

  /**
   * Test: Images dialog opens and displays images
   * Requirement: 5.5
   */
  it('should open images dialog and display property images', async () => {
    const mockProperty = createMockProperty('1', {
      title: 'Test Property',
      imageUrls: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ],
    });

    vi.mocked(propertyService.getProperties).mockResolvedValue([mockProperty]);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
    });

    // Click images button
    const imagesButton = screen.getByText(/images \(2\)/i);
    fireEvent.click(imagesButton);

    await waitFor(() => {
      expect(screen.getByText(/property images - test property/i)).toBeInTheDocument();
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });
  });

  /**
   * Test: Documents dialog opens and displays documents
   * Requirement: 5.5
   */
  it('should open documents dialog and display ownership documents', async () => {
    const mockProperty = createMockProperty('1', {
      title: 'Test Property',
      ownershipDocumentUrls: ['https://example.com/doc1.pdf'],
    });

    vi.mocked(propertyService.getProperties).mockResolvedValue([mockProperty]);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('Test Property')).toBeInTheDocument();
    });

    // Click documents button
    const documentsButton = screen.getByText(/documents/i);
    fireEvent.click(documentsButton);

    await waitFor(() => {
      expect(screen.getByText(/ownership documents - test property/i)).toBeInTheDocument();
      expect(screen.getByText('Document 1')).toBeInTheDocument();
    });
  });

  /**
   * Test: Component displays error message on fetch failure
   * Requirement: 5.2
   */
  it('should display error message when fetching properties fails', async () => {
    vi.mocked(propertyService.getProperties).mockRejectedValue(
      new Error('Network error')
    );

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load properties/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Component allows retry after error
   * Requirement: 5.2
   */
  it('should allow retry after error', async () => {
    vi.mocked(propertyService.getProperties)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue([]);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load properties/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText(/no pending properties/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Component sorts properties by creation date
   * Requirement: 5.2
   */
  it('should sort properties by creation date (most recent first)', async () => {
    const oldProperty = createMockProperty('1', {
      title: 'Old Property',
      createdAt: Timestamp.fromDate(new Date('2024-01-01')),
    });
    const newProperty = createMockProperty('2', {
      title: 'New Property',
      createdAt: Timestamp.fromDate(new Date('2024-12-01')),
    });

    vi.mocked(propertyService.getProperties).mockResolvedValue([oldProperty, newProperty]);

    render(<PropertyApprovalList />);

    await waitFor(() => {
      const titles = screen.getAllByRole('heading', { level: 3 });
      // The newer property should appear first
      expect(titles[0]).toHaveTextContent('New Property');
      expect(titles[1]).toHaveTextContent('Old Property');
    });
  });
});
