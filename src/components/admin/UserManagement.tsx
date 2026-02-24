/**
 * UserManagement Component
 * 
 * Displays all users with filters by role and status.
 * Shows user details (email, role, status, registration date, last login).
 * Implements suspend/delete user actions.
 * 
 * Requirements: 12.1, 12.4, 12.6, 12.7
 */

import React, { useState, useEffect } from 'react';
import { User, UserRole, VerificationStatus } from '../../types/user.types';
import { getAllUsers, updateVerificationStatus, deleteUser } from '../../services/userService';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { 
  Users, 
  Mail, 
  Calendar, 
  Clock,
  Ban,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { Input } from '../ui/input';

/**
 * UserManagement Component
 * 
 * Provides comprehensive user management interface for admins.
 * 
 * Requirements:
 * - 12.1: Display all registered users with roles and verification status
 * - 12.4: Suspend user accounts
 * - 12.6: Display user registration date and last login timestamp
 * - 12.7: Delete user accounts
 */
export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const { toast } = useToast();

  /**
   * Fetch all users from the database
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allUsers = await getAllUsers();
      
      // Sort by registration date (most recent first)
      allUsers.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Apply filters to user list
   */
  useEffect(() => {
    let filtered = [...users];
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.verificationStatus === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(query) ||
        user.profile.name.toLowerCase().includes(query) ||
        (user.profile.phone && user.profile.phone.includes(query))
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, roleFilter, statusFilter, searchQuery]);

  /**
   * Handle suspend user action
   */
  const handleSuspend = async (user: User) => {
    try {
      setActionLoading(user.uid);
      await updateVerificationStatus(user.uid, VerificationStatus.SUSPENDED);
      
      toast({
        title: 'User Suspended',
        description: `${user.profile.name} has been suspended successfully.`,
      });
      
      // Refresh the list
      await fetchUsers();
      setSuspendDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error suspending user:', err);
      toast({
        title: 'Suspension Failed',
        description: 'Failed to suspend user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Handle delete user action
   */
  const handleDelete = async (user: User) => {
    try {
      setActionLoading(user.uid);
      await deleteUser(user.uid);
      
      toast({
        title: 'User Deleted',
        description: `${user.profile.name} has been deleted successfully.`,
      });
      
      // Refresh the list
      await fetchUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Open suspend confirmation dialog
   */
  const openSuspendDialog = (user: User) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  /**
   * Open delete confirmation dialog
   */
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
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
    });
  };

  /**
   * Get role badge color
   */
  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (role) {
      case UserRole.ADMIN:
        return 'destructive';
      case UserRole.AGENT:
        return 'default';
      case UserRole.SELLER:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  /**
   * Get status badge color
   */
  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case VerificationStatus.APPROVED:
        return 'default';
      case VerificationStatus.PENDING:
        return 'secondary';
      case VerificationStatus.REJECTED:
        return 'destructive';
      case VerificationStatus.SUSPENDED:
        return 'outline';
      default:
        return 'outline';
    }
  };

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    setRoleFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Users"
        message={error}
        onRetry={fetchUsers}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage all registered users on the platform
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'}
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
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={UserRole.BUYER}>Buyer</SelectItem>
                  <SelectItem value={UserRole.SELLER}>Seller</SelectItem>
                  <SelectItem value={UserRole.AGENT}>Agent</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={VerificationStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={VerificationStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={VerificationStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={VerificationStatus.SUSPENDED}>Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Filters Button */}
          {(roleFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'No users match your current filters. Try adjusting your search criteria.'
              : 'No users are registered on the platform yet.'}
          </p>
        </div>
      )}

      {/* User Cards */}
      {filteredUsers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.uid} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{user.profile.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(user.verificationStatus)}>
                        {user.verificationStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* User Information */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  
                  {user.profile.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Phone:</span>
                      <span>{user.profile.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">Registered: {formatDate(user.createdAt)}</span>
                  </div>
                  
                  {user.lastLoginAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs">Last Login: {formatDate(user.lastLoginAt)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openSuspendDialog(user)}
                    disabled={
                      actionLoading === user.uid || 
                      user.verificationStatus === VerificationStatus.SUSPENDED ||
                      user.role === UserRole.ADMIN
                    }
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Suspend
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDeleteDialog(user)}
                    disabled={
                      actionLoading === user.uid ||
                      user.role === UserRole.ADMIN
                    }
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {selectedUser?.profile.name}? 
              This will terminate their active sessions and prevent them from accessing the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleSuspend(selectedUser)}
              disabled={!!actionLoading}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {actionLoading ? 'Suspending...' : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.profile.name}? 
              This action cannot be undone and will remove all associated data including properties, inquiries, and notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleDelete(selectedUser)}
              disabled={!!actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
