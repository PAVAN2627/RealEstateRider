/**
 * ActivityLog Component
 * 
 * Displays activity logs with user, action type, timestamp.
 * Implements filters by user, action type, date range.
 * Implements pagination.
 * 
 * Requirements: 18.6, 18.7
 */

import React, { useState, useEffect } from 'react';
import { ActivityLog, ActionType } from '../../types/notification.types';
import { User } from '../../types/user.types';
import { getActivityLogs, ActivityLogFilters } from '../../services/activityLogService';
import { getUserById } from '../../services/userService';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Activity, 
  Calendar, 
  Clock,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { Input } from '../ui/input';

/**
 * ActivityLog Component
 * 
 * Provides comprehensive activity log viewing interface for admins.
 * 
 * Requirements:
 * - 18.6: Display recent activity logs in the Admin Dashboard
 * - 18.7: Allow Admins to filter activity logs by user, action type, and date range
 */
export default function ActivityLogComponent() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User cache to avoid repeated fetches
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map());
  
  // Filter states
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  /**
   * Fetch activity logs from the database
   */
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: ActivityLogFilters = {};
      
      if (actionTypeFilter !== 'all') {
        filters.actionType = actionTypeFilter as ActionType;
      }
      
      if (startDate) {
        filters.startDate = new Date(startDate);
      }
      
      if (endDate) {
        // Set to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filters.endDate = endDateTime;
      }
      
      const allLogs = await getActivityLogs(filters);
      setLogs(allLogs);
      setFilteredLogs(allLogs);
      
      // Fetch user data for all unique user IDs
      const uniqueUserIds = [...new Set(allLogs.map(log => log.userId))];
      const newUserCache = new Map(userCache);
      
      for (const userId of uniqueUserIds) {
        if (!newUserCache.has(userId)) {
          try {
            const user = await getUserById(userId);
            if (user) {
              newUserCache.set(userId, user);
            }
          } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
          }
        }
      }
      
      setUserCache(newUserCache);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to load activity logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionTypeFilter, startDate, endDate]);

  /**
   * Apply search filter to logs
   */
  useEffect(() => {
    let filtered = [...logs];
    
    // Apply search filter (search by user name or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => {
        const user = userCache.get(log.userId);
        if (!user) return false;
        
        return (
          user.email.toLowerCase().includes(query) ||
          user.profile.name.toLowerCase().includes(query)
        );
      });
    }
    
    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [logs, searchQuery, userCache]);

  /**
   * Get paginated logs
   */
  const getPaginatedLogs = (): ActivityLog[] => {
    const startIndex = (currentPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  };

  /**
   * Calculate total pages
   */
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp: any): string => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /**
   * Get action type badge color
   */
  const getActionTypeBadgeVariant = (actionType: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    if (actionType.includes('deleted') || actionType.includes('rejected')) {
      return 'destructive';
    }
    if (actionType.includes('approved') || actionType.includes('created')) {
      return 'default';
    }
    if (actionType.includes('updated') || actionType.includes('responded')) {
      return 'secondary';
    }
    return 'outline';
  };

  /**
   * Format action type for display
   */
  const formatActionType = (actionType: string): string => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    setActionTypeFilter('all');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading activity logs..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Activity Logs"
        message={error}
        onRetry={fetchLogs}
      />
    );
  }

  const paginatedLogs = getPaginatedLogs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Activity Logs</h2>
          <p className="text-muted-foreground">
            Monitor all platform activities and user actions
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {filteredLogs.length} {filteredLogs.length === 1 ? 'Log' : 'Logs'}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search User</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Action Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="property_created">Property Created</SelectItem>
                  <SelectItem value="property_updated">Property Updated</SelectItem>
                  <SelectItem value="property_deleted">Property Deleted</SelectItem>
                  <SelectItem value="inquiry_created">Inquiry Created</SelectItem>
                  <SelectItem value="inquiry_responded">Inquiry Responded</SelectItem>
                  <SelectItem value="user_approved">User Approved</SelectItem>
                  <SelectItem value="user_rejected">User Rejected</SelectItem>
                  <SelectItem value="property_approved">Property Approved</SelectItem>
                  <SelectItem value="property_rejected">Property Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
            </div>

            {/* End Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
            </div>
          </div>

          {/* Reset Filters Button */}
          {(actionTypeFilter !== 'all' || searchQuery || startDate || endDate) && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Activity className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Activity Logs Found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchQuery || actionTypeFilter !== 'all' || startDate || endDate
              ? 'No activity logs match your current filters. Try adjusting your search criteria.'
              : 'No activity has been logged on the platform yet.'}
          </p>
        </div>
      )}

      {/* Activity Log List */}
      {paginatedLogs.length > 0 && (
        <>
          <div className="space-y-3">
            {paginatedLogs.map((log) => {
              const user = userCache.get(log.userId);
              
              return (
                <Card key={log.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left side - User and Action */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-muted p-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">
                                {user ? user.profile.name : 'Unknown User'}
                              </span>
                              {user && (
                                <span className="text-sm text-muted-foreground">
                                  ({user.email})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getActionTypeBadgeVariant(log.actionType)}>
                                {formatActionType(log.actionType)}
                              </Badge>
                              {log.entityId && (
                                <span className="text-xs text-muted-foreground">
                                  ID: {log.entityId.substring(0, 8)}...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Metadata */}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="ml-11 text-sm text-muted-foreground">
                            <details className="cursor-pointer">
                              <summary className="hover:text-foreground">
                                View Details
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>

                      {/* Right side - Timestamp */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * logsPerPage) + 1} to{' '}
                    {Math.min(currentPage * logsPerPage, filteredLogs.length)} of{' '}
                    {filteredLogs.length} logs
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
