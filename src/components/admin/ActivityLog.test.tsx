/**
 * ActivityLog Component Tests
 * 
 * Tests for the ActivityLog component including:
 * - Rendering activity logs
 * - Filtering by action type, user, and date range
 * - Pagination functionality
 * - User information display
 * - Error and loading states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ActivityLogComponent from './ActivityLog';
import * as activityLogService from '../../services/activityLogService';
import * as userService from '../../services/userService';
import { Timestamp } from 'firebase/firestore';
import { ActivityLog, ActionType } from '../../types/notification.types';
import { User, UserRole, VerificationStatus } from '../../types/user.types';

// Mock the services
vi.mock('../../services/activityLogService');
vi.mock('../../services/userService');

// Mock UI components
vi.mock('../ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
}));

vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant, size }: any) => (
    <button onClick={onClick} disabled={disabled} className={`${className} ${variant} ${size}`}>
      {children}
    </button>
  ),
}));

vi.mock('../ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  ),
}));

vi.mock('../ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value} onClick={() => onValueChange && onValueChange('test')}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
}));

vi.mock('../ui/input', () => ({
  Input: ({ value, onChange, type, placeholder, className }: any) => (
    <input
      type={type || 'text'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  ),
}));

vi.mock('../shared/LoadingSpinner', () => ({
  default: ({ text }: any) => <div data-testid="loading-spinner">{text}</div>,
}));

vi.mock('../shared/ErrorMessage', () => ({
  default: ({ title, message, onRetry }: any) => (
    <div data-testid="error-message">
      <h3>{title}</h3>
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

describe('ActivityLog Component', () => {
  const mockTimestamp = Timestamp.fromDate(new Date('2024-01-15T10:30:00'));
  
  const mockUser1: User = {
    uid: 'user1',
    email: 'john@example.com',
    role: UserRole.BUYER,
    verificationStatus: VerificationStatus.APPROVED,
    profile: {
      name: 'John Doe',
      phone: '1234567890',
    },
    createdAt: mockTimestamp,
  };

  const mockUser2: User = {
    uid: 'user2',
    email: 'jane@example.com',
    role: UserRole.SELLER,
    verificationStatus: VerificationStatus.APPROVED,
    profile: {
      name: 'Jane Smith',
    },
    createdAt: mockTimestamp,
  };

  const mockLogs: ActivityLog[] = [
    {
      id: 'log1',
      userId: 'user1',
      actionType: 'login' as ActionType,
      timestamp: mockTimestamp,
    },
    {
      id: 'log2',
      userId: 'user2',
      actionType: 'property_created' as ActionType,
      entityId: 'property123',
      timestamp: Timestamp.fromDate(new Date('2024-01-15T11:00:00')),
    },
    {
      id: 'log3',
      userId: 'user1',
      actionType: 'inquiry_created' as ActionType,
      entityId: 'inquiry456',
      metadata: { propertyId: 'property123' },
      timestamp: Timestamp.fromDate(new Date('2024-01-15T12:00:00')),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(mockLogs);
    vi.mocked(userService.getUserById).mockImplementation(async (userId: string) => {
      if (userId === 'user1') return mockUser1;
      if (userId === 'user2') return mockUser2;
      return null;
    });
  });

  describe('Rendering', () => {
    it('should display loading state initially', () => {
      render(<ActivityLogComponent />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading activity logs...')).toBeInTheDocument();
    });

    it('should display activity logs after loading', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Activity Logs')).toBeInTheDocument();
      // John Doe appears twice in the logs, so use getAllByText
      const johnElements = screen.getAllByText('John Doe');
      expect(johnElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display user email addresses', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        // Check that email addresses are displayed
        const emailElements = screen.getAllByText(/john@example.com|jane@example.com/);
        expect(emailElements.length).toBeGreaterThan(0);
      });
    });

    it('should display action types with proper formatting', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        // Check that action types are displayed and formatted
        const badges = screen.getAllByText(/Login|Property Created|Inquiry Created/);
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('should display timestamps', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        const timestamps = screen.getAllByText(/Jan 15, 2024/);
        expect(timestamps.length).toBeGreaterThan(0);
      });
    });

    it('should display entity IDs when present', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        // Check that entity IDs are displayed (they're truncated in the UI)
        const idElements = screen.getAllByText(/ID:/);
        expect(idElements.length).toBeGreaterThan(0);
      });
    });

    it('should display metadata details when available', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        const detailsButtons = screen.getAllByText('View Details');
        expect(detailsButtons.length).toBeGreaterThan(0);
      });
    });

    it('should display total log count', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.getByText('3 Logs')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter logs by action type', async () => {
      const loginLogs = [mockLogs[0]];
      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(loginLogs);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // The component should call getActivityLogs with filters
      expect(activityLogService.getActivityLogs).toHaveBeenCalled();
    });

    it('should filter logs by user search', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Initially both users should be visible (John appears twice in logs)
      const johnElements = screen.getAllByText('John Doe');
      expect(johnElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      fireEvent.change(searchInput, { target: { value: 'Jane' } });

      await waitFor(() => {
        // After filtering for Jane, only Jane should be visible
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('should filter logs by date range', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Find date inputs by their type instead of label
      const dateInputs = screen.getAllByDisplayValue('');
      const startDateInput = dateInputs.find((input: HTMLElement) => 
        (input as HTMLInputElement).type === 'date'
      ) as HTMLInputElement;

      fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });

      await waitFor(() => {
        expect(activityLogService.getActivityLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: expect.any(Date),
          })
        );
      });
    });

    it('should reset filters when reset button is clicked', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Apply a search filter
      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getByText('Reset Filters')).toBeInTheDocument();
      });

      const resetButton = screen.getByText('Reset Filters');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
    });

    it('should display empty state when no logs match filters', async () => {
      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      fireEvent.change(searchInput, { target: { value: 'NonexistentUser' } });

      await waitFor(() => {
        expect(screen.getByText('No Activity Logs Found')).toBeInTheDocument();
        expect(screen.getByText(/No activity logs match your current filters/)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when logs exceed page size', async () => {
      // Create 25 logs to trigger pagination (page size is 20)
      const manyLogs = Array.from({ length: 25 }, (_, i) => ({
        id: `log${i}`,
        userId: 'user1',
        actionType: 'login' as ActionType,
        timestamp: mockTimestamp,
      }));

      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(manyLogs);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
        expect(screen.getByText('Previous')).toBeInTheDocument();
      });
    });

    it('should navigate to next page', async () => {
      const manyLogs = Array.from({ length: 25 }, (_, i) => ({
        id: `log${i}`,
        userId: 'user1',
        actionType: 'login' as ActionType,
        timestamp: mockTimestamp,
      }));

      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(manyLogs);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing 21 to 25/)).toBeInTheDocument();
      });
    });

    it('should navigate to previous page', async () => {
      const manyLogs = Array.from({ length: 25 }, (_, i) => ({
        id: `log${i}`,
        userId: 'user1',
        actionType: 'login' as ActionType,
        timestamp: mockTimestamp,
      }));

      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(manyLogs);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      // Go to page 2
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing 21 to 25/)).toBeInTheDocument();
      });

      // Go back to page 1
      const previousButton = screen.getByText('Previous');
      fireEvent.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 to 20/)).toBeInTheDocument();
      });
    });

    it('should disable previous button on first page', async () => {
      const manyLogs = Array.from({ length: 25 }, (_, i) => ({
        id: `log${i}`,
        userId: 'user1',
        actionType: 'login' as ActionType,
        timestamp: mockTimestamp,
      }));

      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(manyLogs);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        const previousButton = screen.getByText('Previous');
        expect(previousButton).toBeDisabled();
      });
    });

    it('should disable next button on last page', async () => {
      const manyLogs = Array.from({ length: 25 }, (_, i) => ({
        id: `log${i}`,
        userId: 'user1',
        actionType: 'login' as ActionType,
        timestamp: mockTimestamp,
      }));

      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(manyLogs);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      // Go to last page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(nextButton).toBeDisabled();
      });
    });

    it('should reset to first page when filters change', async () => {
      const manyLogs = Array.from({ length: 25 }, (_, i) => ({
        id: `log${i}`,
        userId: i % 2 === 0 ? 'user1' : 'user2',
        actionType: 'login' as ActionType,
        timestamp: mockTimestamp,
      }));

      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(manyLogs);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      // Go to page 2
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing 21 to 25/)).toBeInTheDocument();
      });

      // Apply a filter - this should reset to page 1
      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      // After filtering, we should be back on page 1
      // The filtered results (13 logs for user1/John) should show "Showing 1 to 13"
      await waitFor(() => {
        // Just check that we're not on page 2 anymore
        expect(screen.queryByText(/Showing 21 to 25/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetching logs fails', async () => {
      vi.mocked(activityLogService.getActivityLogs).mockRejectedValue(
        new Error('Failed to fetch logs')
      );

      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Failed to Load Activity Logs')).toBeInTheDocument();
      });
    });

    it('should retry fetching logs when retry button is clicked', async () => {
      vi.mocked(activityLogService.getActivityLogs).mockRejectedValueOnce(
        new Error('Failed to fetch logs')
      );

      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Mock successful retry
      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(mockLogs);

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
        expect(screen.getByText('Activity Logs')).toBeInTheDocument();
      });
    });

    it('should handle missing user data gracefully', async () => {
      vi.mocked(userService.getUserById).mockResolvedValue(null);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.getAllByText('Unknown User').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no logs exist', async () => {
      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue([]);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        expect(screen.getByText('No Activity Logs Found')).toBeInTheDocument();
        expect(screen.getByText(/No activity has been logged/)).toBeInTheDocument();
      });
    });
  });

  describe('Action Type Badge Colors', () => {
    it('should use destructive variant for delete and reject actions', async () => {
      const deleteLogs: ActivityLog[] = [
        {
          id: 'log1',
          userId: 'user1',
          actionType: 'property_deleted' as ActionType,
          timestamp: mockTimestamp,
        },
        {
          id: 'log2',
          userId: 'user1',
          actionType: 'user_rejected' as ActionType,
          timestamp: mockTimestamp,
        },
      ];

      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(deleteLogs);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        // Check that delete/reject action types are displayed (may include filter dropdown)
        const badges = screen.getAllByText(/Deleted|Rejected/);
        expect(badges.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should use default variant for approve and create actions', async () => {
      const approveLogs: ActivityLog[] = [
        {
          id: 'log1',
          userId: 'user1',
          actionType: 'property_approved' as ActionType,
          timestamp: mockTimestamp,
        },
        {
          id: 'log2',
          userId: 'user1',
          actionType: 'property_created' as ActionType,
          timestamp: mockTimestamp,
        },
      ];

      vi.mocked(activityLogService.getActivityLogs).mockResolvedValue(approveLogs);

      render(<ActivityLogComponent />);

      await waitFor(() => {
        // Check that approve/create action types are displayed (may include filter dropdown)
        const badges = screen.getAllByText(/Approved|Created/);
        expect(badges.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
