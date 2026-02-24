/**
 * UserApprovalList Component Tests
 * 
 * Tests for the UserApprovalList component functionality.
 * 
 * Requirements: 3.5, 12.1, 12.2, 12.3, 12.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Timestamp } from 'firebase/firestore';
import UserApprovalList from './UserApprovalList';
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
  verificationStatus: VerificationStatus.PENDING,
  aadharDocumentUrl: `https://example.com/aadhar-${id}.jpg`,
  createdAt: Timestamp.now(),
  profile: {
    name: `User ${id}`,
    phone: '1234567890',
  },
  ...overrides,
});

describe('UserApprovalList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Component renders loading state initially
   * Requirement: 12.1
   */
  it('should display loading state initially', () => {
    vi.mocked(userService.getUsersByRole).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<UserApprovalList />);
    
    expect(screen.getByText(/loading pending users/i)).toBeInTheDocument();
  });

  /**
   * Test: Component displays pending users
   * Requirement: 12.1
   */
  it('should display list of pending users', async () => {
    const mockUsers = [
      createMockUser('1', { role: UserRole.BUYER }),
      createMockUser('2', { role: UserRole.SELLER }),
      createMockUser('3', { role: UserRole.AGENT }),
    ];

    vi.mocked(userService.getUsersByRole).mockImplementation(async (role) => {
      if (role === 'buyer') return [mockUsers[0]];
      if (role === 'seller') return [mockUsers[1]];
      if (role === 'agent') return [mockUsers[2]];
      return [];
    });

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
      expect(screen.getByText('User 3')).toBeInTheDocument();
    });

    expect(screen.getByText('3 Pending')).toBeInTheDocument();
  });

  /**
   * Test: Component displays empty state when no pending users
   * Requirement: 12.1
   */
  it('should display empty state when no pending users', async () => {
    vi.mocked(userService.getUsersByRole).mockResolvedValue([]);

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText(/no pending users/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Component displays user information correctly
   * Requirement: 12.1, 12.5
   */
  it('should display user information including email, role, and registration date', async () => {
    const mockUser = createMockUser('1', {
      email: 'test@example.com',
      role: UserRole.AGENT,
      profile: { name: 'John Doe', phone: '9876543210' },
    });

    vi.mocked(userService.getUsersByRole).mockImplementation(async (role) => {
      if (role === 'agent') return [mockUser];
      return [];
    });

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('AGENT')).toBeInTheDocument();
      expect(screen.getByText(/registered:/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Component shows Aadhar document button when available
   * Requirement: 3.5, 12.5
   */
  it('should display view Aadhar document button when document is available', async () => {
    const mockUser = createMockUser('1', {
      aadharDocumentUrl: 'https://example.com/aadhar.jpg',
    });

    vi.mocked(userService.getUsersByRole).mockImplementation(async (role) => {
      if (role === 'buyer') return [mockUser];
      return [];
    });

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText(/view aadhar document/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Component shows message when Aadhar document is not available
   * Requirement: 3.5, 12.5
   */
  it('should display message when Aadhar document is not uploaded', async () => {
    const mockUser = createMockUser('1', {
      aadharDocumentUrl: undefined,
    });

    vi.mocked(userService.getUsersByRole).mockImplementation(async (role) => {
      if (role === 'buyer') return [mockUser];
      return [];
    });

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText(/no aadhar document uploaded/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Approve button opens confirmation dialog
   * Requirement: 12.2
   */
  it('should open confirmation dialog when approve button is clicked', async () => {
    const mockUser = createMockUser('1');

    vi.mocked(userService.getUsersByRole).mockImplementation(async (role) => {
      if (role === 'buyer') return [mockUser];
      return [];
    });

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const approveButtons = screen.getAllByRole('button', { name: /approve/i });
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to approve/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Reject button opens confirmation dialog
   * Requirement: 12.3
   */
  it('should open confirmation dialog when reject button is clicked', async () => {
    const mockUser = createMockUser('1');

    vi.mocked(userService.getUsersByRole).mockImplementation(async (role) => {
      if (role === 'buyer') return [mockUser];
      return [];
    });

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByRole('button', { name: /reject/i });
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to reject/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Approving user calls updateVerificationStatus with approved status
   * Requirement: 12.2
   */
  it('should call updateVerificationStatus with approved status when user is approved', async () => {
    const mockUser = createMockUser('1');

    vi.mocked(userService.getUsersByRole).mockImplementation(async (role) => {
      if (role === 'buyer') return [mockUser];
      return [];
    });
    vi.mocked(userService.updateVerificationStatus).mockResolvedValue();

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
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
      expect(userService.updateVerificationStatus).toHaveBeenCalledWith(
        '1',
        VerificationStatus.APPROVED
      );
    });
  });

  /**
   * Test: Rejecting user calls updateVerificationStatus with rejected status
   * Requirement: 12.3
   */
  it('should call updateVerificationStatus with rejected status when user is rejected', async () => {
    const mockUser = createMockUser('1');

    vi.mocked(userService.getUsersByRole).mockImplementation(async (role) => {
      if (role === 'buyer') return [mockUser];
      return [];
    });
    vi.mocked(userService.updateVerificationStatus).mockResolvedValue();

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Click reject button
    const rejectButtons = screen.getAllByRole('button', { name: /reject/i });
    fireEvent.click(rejectButtons[0]);

    // Confirm in dialog
    await waitFor(() => {
      expect(screen.getByText(/are you sure you want to reject/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /^reject$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(userService.updateVerificationStatus).toHaveBeenCalledWith(
        '1',
        VerificationStatus.REJECTED
      );
    });
  });

  /**
   * Test: Component refreshes list after approval
   * Requirement: 12.2
   */
  it('should refresh user list after successful approval', async () => {
    const mockUser = createMockUser('1');

    let callCount = 0;
    vi.mocked(userService.getUsersByRole).mockImplementation(async (role) => {
      callCount++;
      if (role === 'buyer') {
        // Return user on first call, empty on subsequent calls (after approval)
        return callCount <= 3 ? [mockUser] : [];
      }
      return [];
    });
    vi.mocked(userService.updateVerificationStatus).mockResolvedValue();

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Approve user
    const approveButtons = screen.getAllByRole('button', { name: /approve/i });
    fireEvent.click(approveButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /^approve$/i });
    fireEvent.click(confirmButton);

    // Wait for refresh - getUsersByRole should be called again (3 times for initial + 3 times for refresh)
    await waitFor(() => {
      expect(callCount).toBeGreaterThan(3);
    });
  });

  /**
   * Test: Component displays error message on fetch failure
   * Requirement: 12.1
   */
  it('should display error message when fetching users fails', async () => {
    vi.mocked(userService.getUsersByRole).mockRejectedValue(
      new Error('Network error')
    );

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    });
  });

  /**
   * Test: Component allows retry after error
   * Requirement: 12.1
   */
  it('should allow retry after error', async () => {
    vi.mocked(userService.getUsersByRole)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue([]);

    render(<UserApprovalList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText(/no pending users/i)).toBeInTheDocument();
    });
  });
});
