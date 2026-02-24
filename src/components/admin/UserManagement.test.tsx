/**
 * UserManagement Component Tests
 * 
 * Tests for the UserManagement component functionality.
 * 
 * Requirements: 12.1, 12.4, 12.6, 12.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Timestamp } from 'firebase/firestore';
import UserManagement from './UserManagement';
import { User, UserRole, VerificationStatus } from '../../types/user.types';
import * as userService from '../../services/userService';

// Mock the services
vi.mock('../../services/userService');

// Mock the toast hook
vi.mock('../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

/**
 * Helper function to create mock user
 */
const createMockUser = (id: string, overrides?: Partial<User>): User => ({
  uid: id,
  email: `user${id}@example.com`,
  role: UserRole.BUYER,
  verificationStatus: VerificationStatus.APPROVED,
  createdAt: Timestamp.now(),
  lastLoginAt: Timestamp.now(),
  profile: {
    name: `User ${id}`,
    phone: '1234567890',
  },
  ...overrides,
});

describe('UserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Component renders loading state initially
   * Requirement: 12.1
   */
  it('should display loading state initially', () => {
    vi.mocked(userService.getAllUsers).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<UserManagement />);
    
    expect(screen.getByText(/loading users/i)).toBeInTheDocument();
  });

  /**
   * Test: Component displays all users
   * Requirement: 12.1
   */
  it('should display list of all users', async () => {
    const mockUsers = [
      createMockUser('1', { role: UserRole.BUYER }),
      createMockUser('2', { role: UserRole.SELLER }),
      createMockUser('3', { role: UserRole.AGENT }),
      createMockUser('4', { role: UserRole.ADMIN }),
    ];

    vi.mocked(userService.getAllUsers).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('User 3')).toBeInTheDocument();
      expect(screen.getByText('User 4')).toBeInTheDocument();
    });

    expect(screen.getByText('4 Users')).toBeInTheDocument();
  });

  /**
   * Test: Component displays empty state when no users
   * Requirement: 12.1
   */
  it('should display empty state when no users exist', async () => {
    vi.mocked(userService.getAllUsers).mockResolvedValue([]);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Component displays user details correctly
   * Requirement: 12.1, 12.6
   */
  it('should display user details including email, role, status, registration date, and last login', async () => {
    const mockUser = createMockUser('1', {
      email: 'test@example.com',
      role: UserRole.AGENT,
      verificationStatus: VerificationStatus.APPROVED,
      profile: { name: 'John Doe', phone: '9876543210' },
    });

    vi.mocked(userService.getAllUsers).mockResolvedValue([mockUser]);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('AGENT')).toBeInTheDocument();
      expect(screen.getByText('APPROVED')).toBeInTheDocument();
      expect(screen.getByText(/registered:/i)).toBeInTheDocument();
      expect(screen.getByText(/last login:/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Component filters users by role
   * Requirement: 12.1
   */
  it('should filter users by role', async () => {
    const mockUsers = [
      createMockUser('1', { role: UserRole.BUYER, profile: { name: 'Buyer User' } }),
      createMockUser('2', { role: UserRole.SELLER, profile: { name: 'Seller User' } }),
      createMockUser('3', { role: UserRole.AGENT, profile: { name: 'Agent User' } }),
    ];

    vi.mocked(userService.getAllUsers).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Buyer User')).toBeInTheDocument();
      expect(screen.getByText('Seller User')).toBeInTheDocument();
      expect(screen.getByText('Agent User')).toBeInTheDocument();
    });

    // Filter by buyer role
    const roleSelects = screen.getAllByRole('combobox');
    const roleSelect = roleSelects[0]; // First combobox is the role filter
    fireEvent.click(roleSelect);
    
    const buyerOption = screen.getByRole('option', { name: /buyer/i });
    fireEvent.click(buyerOption);

    await waitFor(() => {
      expect(screen.getByText('Buyer User')).toBeInTheDocument();
      expect(screen.queryByText('Seller User')).not.toBeInTheDocument();
      expect(screen.queryByText('Agent User')).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Component filters users by verification status
   * Requirement: 12.1
   */
  it('should filter users by verification status', async () => {
    const mockUsers = [
      createMockUser('1', { 
        verificationStatus: VerificationStatus.APPROVED,
        profile: { name: 'Approved User' }
      }),
      createMockUser('2', { 
        verificationStatus: VerificationStatus.PENDING,
        profile: { name: 'Pending User' }
      }),
      createMockUser('3', { 
        verificationStatus: VerificationStatus.SUSPENDED,
        profile: { name: 'Suspended User' }
      }),
    ];

    vi.mocked(userService.getAllUsers).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Approved User')).toBeInTheDocument();
      expect(screen.getByText('Pending User')).toBeInTheDocument();
      expect(screen.getByText('Suspended User')).toBeInTheDocument();
    });

    // Filter by pending status
    const statusSelects = screen.getAllByRole('combobox');
    const statusSelect = statusSelects[1]; // Second combobox is the status filter
    fireEvent.click(statusSelect);
    
    const pendingOption = screen.getByRole('option', { name: /^pending$/i });
    fireEvent.click(pendingOption);

    await waitFor(() => {
      expect(screen.queryByText('Approved User')).not.toBeInTheDocument();
      expect(screen.getByText('Pending User')).toBeInTheDocument();
      expect(screen.queryByText('Suspended User')).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Component searches users by name, email, or phone
   * Requirement: 12.1
   */
  it('should search users by name, email, or phone', async () => {
    const mockUsers = [
      createMockUser('1', { 
        email: 'john@example.com',
        profile: { name: 'John Doe', phone: '1111111111' }
      }),
      createMockUser('2', { 
        email: 'jane@example.com',
        profile: { name: 'Jane Smith', phone: '2222222222' }
      }),
    ];

    vi.mocked(userService.getAllUsers).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Search by name
    const searchInput = screen.getByPlaceholderText(/search by name, email, or phone/i);
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    // Search by email
    fireEvent.change(searchInput, { target: { value: 'jane@' } });

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  /**
   * Test: Component resets filters
   * Requirement: 12.1
   */
  it('should reset all filters when reset button is clicked', async () => {
    const mockUsers = [
      createMockUser('1', { role: UserRole.BUYER }),
      createMockUser('2', { role: UserRole.SELLER }),
    ];

    vi.mocked(userService.getAllUsers).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Apply filters
    const searchInput = screen.getByPlaceholderText(/search by name, email, or phone/i);
    fireEvent.change(searchInput, { target: { value: 'User 1' } });

    await waitFor(() => {
      expect(screen.queryByText('User 2')).not.toBeInTheDocument();
    });

    // Reset filters
    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });

  /**
   * Test: Suspend button opens confirmation dialog
   * Requirement: 12.4
   */
  it('should open confirmation dialog when suspend button is clicked', async () => {
    const mockUser = createMockUser('1');

    vi.mocked(userService.getAllUsers).mockResolvedValue([mockUser]);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const suspendButton = screen.getByRole('button', { name: /suspend/i });
    fireEvent.click(suspendButton);

    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to suspend/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Delete button opens confirmation dialog
   * Requirement: 12.7
   */
  it('should open confirmation dialog when delete button is clicked', async () => {
    const mockUser = createMockUser('1');

    vi.mocked(userService.getAllUsers).mockResolvedValue([mockUser]);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Suspending user calls updateVerificationStatus with suspended status
   * Requirement: 12.4
   */
  it('should call updateVerificationStatus with suspended status when user is suspended', async () => {
    const mockUser = createMockUser('1');

    vi.mocked(userService.getAllUsers).mockResolvedValue([mockUser]);
    vi.mocked(userService.updateVerificationStatus).mockResolvedValue();

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Click suspend button
    const suspendButton = screen.getByRole('button', { name: /suspend/i });
    fireEvent.click(suspendButton);

    // Confirm in dialog
    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to suspend/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /^suspend$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(userService.updateVerificationStatus).toHaveBeenCalledWith(
        '1',
        VerificationStatus.SUSPENDED
      );
    });
  });

  /**
   * Test: Deleting user calls deleteUser
   * Requirement: 12.7
   */
  it('should call deleteUser when user is deleted', async () => {
    const mockUser = createMockUser('1');

    vi.mocked(userService.getAllUsers).mockResolvedValue([mockUser]);
    vi.mocked(userService.deleteUser).mockResolvedValue();

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Confirm in dialog
    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalledWith('1');
    });
  });

  /**
   * Test: Suspend button is disabled for already suspended users
   * Requirement: 12.4
   */
  it('should disable suspend button for already suspended users', async () => {
    const mockUser = createMockUser('1', {
      verificationStatus: VerificationStatus.SUSPENDED,
    });

    vi.mocked(userService.getAllUsers).mockResolvedValue([mockUser]);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const suspendButton = screen.getByRole('button', { name: /suspend/i });
    expect(suspendButton).toBeDisabled();
  });

  /**
   * Test: Suspend and delete buttons are disabled for admin users
   * Requirement: 12.4, 12.7
   */
  it('should disable suspend and delete buttons for admin users', async () => {
    const mockUser = createMockUser('1', {
      role: UserRole.ADMIN,
    });

    vi.mocked(userService.getAllUsers).mockResolvedValue([mockUser]);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const suspendButton = screen.getByRole('button', { name: /suspend/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    
    expect(suspendButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  /**
   * Test: Component refreshes list after suspension
   * Requirement: 12.4
   */
  it('should refresh user list after successful suspension', async () => {
    const mockUser = createMockUser('1');

    let callCount = 0;
    vi.mocked(userService.getAllUsers).mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [mockUser] : [];
    });
    vi.mocked(userService.updateVerificationStatus).mockResolvedValue();

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Suspend user
    const suspendButton = screen.getByRole('button', { name: /suspend/i });
    fireEvent.click(suspendButton);

    const confirmButton = screen.getByRole('button', { name: /^suspend$/i });
    fireEvent.click(confirmButton);

    // Wait for refresh
    await waitFor(() => {
      expect(callCount).toBe(2);
    });
  });

  /**
   * Test: Component refreshes list after deletion
   * Requirement: 12.7
   */
  it('should refresh user list after successful deletion', async () => {
    const mockUser = createMockUser('1');

    let callCount = 0;
    vi.mocked(userService.getAllUsers).mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [mockUser] : [];
    });
    vi.mocked(userService.deleteUser).mockResolvedValue();

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Delete user
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmButton);

    // Wait for refresh
    await waitFor(() => {
      expect(callCount).toBe(2);
    });
  });

  /**
   * Test: Component displays error message on fetch failure
   * Requirement: 12.1
   */
  it('should display error message when fetching users fails', async () => {
    vi.mocked(userService.getAllUsers).mockRejectedValue(
      new Error('Network error')
    );

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  /**
   * Test: Component allows retry after error
   * Requirement: 12.1
   */
  it('should allow retry after error', async () => {
    vi.mocked(userService.getAllUsers)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue([]);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Component displays phone number when available
   * Requirement: 12.6
   */
  it('should display phone number when available', async () => {
    const mockUser = createMockUser('1', {
      profile: { name: 'John Doe', phone: '9876543210' },
    });

    vi.mocked(userService.getAllUsers).mockResolvedValue([mockUser]);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('9876543210')).toBeInTheDocument();
    });
  });

  /**
   * Test: Component handles users without last login
   * Requirement: 12.6
   */
  it('should handle users without last login timestamp', async () => {
    const mockUser = createMockUser('1', {
      lastLoginAt: undefined,
    });

    vi.mocked(userService.getAllUsers).mockResolvedValue([mockUser]);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Should not display last login if not available
    expect(screen.queryByText(/last login:/i)).not.toBeInTheDocument();
  });

  /**
   * Test: Component displays correct badge colors for different roles
   * Requirement: 12.1
   */
  it('should display correct badge colors for different roles', async () => {
    const mockUsers = [
      createMockUser('1', { role: UserRole.BUYER, profile: { name: 'Buyer' } }),
      createMockUser('2', { role: UserRole.SELLER, profile: { name: 'Seller' } }),
      createMockUser('3', { role: UserRole.AGENT, profile: { name: 'Agent' } }),
      createMockUser('4', { role: UserRole.ADMIN, profile: { name: 'Admin' } }),
    ];

    vi.mocked(userService.getAllUsers).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('BUYER')).toBeInTheDocument();
      expect(screen.getByText('SELLER')).toBeInTheDocument();
      expect(screen.getByText('AGENT')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });
  });

  /**
   * Test: Component displays correct badge colors for different statuses
   * Requirement: 12.1
   */
  it('should display correct badge colors for different verification statuses', async () => {
    const mockUsers = [
      createMockUser('1', { 
        verificationStatus: VerificationStatus.APPROVED,
        profile: { name: 'Approved' }
      }),
      createMockUser('2', { 
        verificationStatus: VerificationStatus.PENDING,
        profile: { name: 'Pending' }
      }),
      createMockUser('3', { 
        verificationStatus: VerificationStatus.REJECTED,
        profile: { name: 'Rejected' }
      }),
      createMockUser('4', { 
        verificationStatus: VerificationStatus.SUSPENDED,
        profile: { name: 'Suspended' }
      }),
    ];

    vi.mocked(userService.getAllUsers).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      const approvedBadges = screen.getAllByText('APPROVED');
      expect(approvedBadges.length).toBeGreaterThan(0);
      expect(screen.getByText('PENDING')).toBeInTheDocument();
      expect(screen.getByText('REJECTED')).toBeInTheDocument();
      expect(screen.getByText('SUSPENDED')).toBeInTheDocument();
    });
  });
});
