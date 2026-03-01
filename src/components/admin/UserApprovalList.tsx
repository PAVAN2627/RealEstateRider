/**
 * UserApprovalList Component
 * 
 * Displays list of pending users with role and registration date.
 * Shows Aadhar document viewer and approve/reject buttons.
 * 
 * Requirements: 3.5, 12.1, 12.2, 12.3, 12.5
 */

import React, { useState, useEffect } from 'react';
import { User, VerificationStatus } from '../../types/user.types';
import { getUsersByRole, updateVerificationStatus } from '../../services/userService';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { UserCheck, UserX, FileText, Calendar, Mail, Users } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../context/AuthContext';

/**
 * UserApprovalList Component
 * 
 * Fetches and displays pending users with approval/rejection functionality.
 * 
 * Requirements:
 * - 3.5: Display uploaded Aadhar document for verification
 * - 12.1: Display all registered users with roles and verification status
 * - 12.2: Update user verification status to approved
 * - 12.3: Update user verification status to rejected
 * - 12.5: Display user Aadhar documents for verification
 */
export default function UserApprovalList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [aadharDialogOpen, setAadharDialogOpen] = useState(false);
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  /**
   * Fetch all users with pending verification status
   */
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users from all roles
      const [buyers, sellers, agents] = await Promise.all([
        getUsersByRole('buyer' as any),
        getUsersByRole('seller' as any),
        getUsersByRole('agent' as any),
      ]);
      
      // Combine and filter for pending users
      const allUsers = [...buyers, ...sellers, ...agents];
      const pendingUsers = allUsers.filter(
        user => user.verificationStatus === VerificationStatus.PENDING
      );
      
      // Sort by registration date (most recent first)
      pendingUsers.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      setUsers(pendingUsers);
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError('Failed to load pending users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  /**
   * Handle approve user action
   */
  const handleApprove = async (user: User) => {
    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to approve users.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(user.uid);
      await updateVerificationStatus(user.uid, VerificationStatus.APPROVED, currentUser.uid);
      
      // Immediately remove from local state for better UX
      setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
      
      toast({
        title: 'User Approved',
        description: `${user.profile.name} has been approved successfully.`,
      });
      
      setApproveDialogOpen(false);
      setSelectedUser(null);
      
      // Refresh the list from server to ensure consistency
      await fetchPendingUsers();
    } catch (err) {
      console.error('Error approving user:', err);
      toast({
        title: 'Approval Failed',
        description: 'Failed to approve user. Please try again.',
        variant: 'destructive',
      });
      // Refresh list to restore correct state after error
      await fetchPendingUsers();
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Handle reject user action
   */
  const handleReject = async (user: User) => {
    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to reject users.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(user.uid);
      await updateVerificationStatus(user.uid, VerificationStatus.REJECTED, currentUser.uid);
      
      // Immediately remove from local state for better UX
      setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
      
      toast({
        title: 'User Rejected',
        description: `${user.profile.name} has been rejected.`,
      });
      
      setRejectDialogOpen(false);
      setSelectedUser(null);
      
      // Refresh the list from server to ensure consistency
      await fetchPendingUsers();
    } catch (err) {
      console.error('Error rejecting user:', err);
      toast({
        title: 'Rejection Failed',
        description: 'Failed to reject user. Please try again.',
        variant: 'destructive',
      });
      // Refresh list to restore correct state after error
      await fetchPendingUsers();
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Open approve confirmation dialog
   */
  const openApproveDialog = (user: User) => {
    setSelectedUser(user);
    setApproveDialogOpen(true);
  };

  /**
   * Open reject confirmation dialog
   */
  const openRejectDialog = (user: User) => {
    setSelectedUser(user);
    setRejectDialogOpen(true);
  };

  /**
   * Open Aadhar document viewer
   */
  const openAadharViewer = (user: User) => {
    setSelectedUser(user);
    setAadharDialogOpen(true);
  };

  /**
   * Open user details dialog
   */
  const openUserDetailsDialog = (user: User) => {
    setSelectedUser(user);
    setUserDetailsDialogOpen(true);
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
    });
  };

  /**
   * Get role badge color
   */
  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case 'agent':
        return 'default';
      case 'seller':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading pending users..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Users"
        message={error}
        onRetry={fetchPendingUsers}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve pending user registrations
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {users.length} Pending
        </Badge>
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Pending Users</h3>
          <p className="text-muted-foreground max-w-md">
            All user registrations have been reviewed. New registrations will appear here.
          </p>
        </div>
      )}

      {/* User Cards */}
      {users.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.uid} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{user.profile.name}</CardTitle>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* User Information */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  
                  {user.profile.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Phone:</span>
                      <span>{user.profile.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Registered: {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {/* Aadhar Document Thumbnail */}
                {user.aadharDocumentUrl && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Aadhar Document</p>
                    <div 
                      className="relative w-full h-24 rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openAadharViewer(user)}
                    >
                      {user.aadharDocumentUrl.startsWith('data:application/pdf') ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <span className="text-xs text-gray-500 ml-2">PDF Document</span>
                        </div>
                      ) : (
                        <img
                          src={user.aadharDocumentUrl}
                          alt="Aadhar Document"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="text-xs text-white opacity-0 hover:opacity-100 transition-opacity">
                          Click to view
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!user.aadharDocumentUrl && (
                  <div className="text-sm text-muted-foreground text-center py-2 bg-muted rounded">
                    No Aadhar document uploaded
                  </div>
                )}

                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openUserDetailsDialog(user)}
                >
                  View Full Details
                </Button>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => openApproveDialog(user)}
                    disabled={actionLoading === user.uid}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => openRejectDialog(user)}
                    disabled={actionLoading === user.uid}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {selectedUser?.profile.name}? 
              This will grant them access to the platform with {selectedUser?.role} privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleApprove(selectedUser)}
              disabled={!!actionLoading}
            >
              {actionLoading ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {selectedUser?.profile.name}? 
              This will prevent them from accessing the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleReject(selectedUser)}
              disabled={!!actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Aadhar Document Viewer Dialog */}
      <Dialog open={aadharDialogOpen} onOpenChange={setAadharDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Identity Verification Document - {selectedUser?.profile.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedUser?.aadharDocumentUrl && (
              <>
                {/* Check if it's a PDF or image based on Base64 data URL prefix */}
                {selectedUser.aadharDocumentUrl.startsWith('data:application/pdf') ? (
                  <div className="border rounded-lg p-8 text-center bg-muted/30">
                    <FileText className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">PDF Document</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click below to download and view the document
                    </p>
                    <Button
                      size="lg"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedUser.aadharDocumentUrl!;
                        link.download = `aadhar-${selectedUser.uid}.pdf`;
                        link.click();
                      }}
                    >
                      Download PDF
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden bg-black/5">
                    <img
                      src={selectedUser.aadharDocumentUrl}
                      alt="Aadhar Document"
                      className="w-full h-auto max-h-[70vh] object-contain"
                      style={{ imageRendering: 'crisp-edges' }}
                    />
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setAadharDialogOpen(false)}
                  >
                    Close
                  </Button>
                  {!selectedUser.aadharDocumentUrl.startsWith('data:application/pdf') && (
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedUser.aadharDocumentUrl!;
                        link.download = `aadhar-${selectedUser.uid}.jpg`;
                        link.target = '_blank';
                        link.click();
                      }}
                    >
                      Open in New Tab
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDetailsDialogOpen} onOpenChange={setUserDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {selectedUser.profile.name?.charAt(0)?.toUpperCase() || selectedUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">{selectedUser.profile.name || 'No Name'}</h3>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)} className="mb-2">
                    {selectedUser.role.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </h4>
                <div className="space-y-2 text-sm bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{selectedUser.email}</span>
                  </div>
                  {selectedUser.profile.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedUser.profile.phone}</span>
                    </div>
                  )}
                  {!selectedUser.profile.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-muted-foreground italic">Not provided</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Account Information
                </h4>
                <div className="space-y-2 text-sm bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="font-mono text-xs">{selectedUser.uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                      {selectedUser.role.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verification Status:</span>
                    <Badge variant={
                      selectedUser.verificationStatus === VerificationStatus.APPROVED ? 'default' :
                      selectedUser.verificationStatus === VerificationStatus.PENDING ? 'secondary' :
                      'destructive'
                    }>
                      {selectedUser.verificationStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registered On:</span>
                    <span className="font-medium">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  {selectedUser.lastLoginAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login:</span>
                      <span className="font-medium">{formatDate(selectedUser.lastLoginAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Aadhar Document */}
              {selectedUser.aadharDocumentUrl && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Aadhar Document
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="aspect-video rounded-lg overflow-hidden bg-white mb-3">
                      {selectedUser.aadharDocumentUrl.startsWith('data:application/pdf') ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">PDF Document</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={selectedUser.aadharDocumentUrl}
                          alt="Aadhar Document"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setUserDetailsDialogOpen(false);
                          openAadharViewer(selectedUser);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Full Size
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={selectedUser.aadharDocumentUrl}
                          download={`aadhar_${selectedUser.uid}.${selectedUser.aadharDocumentUrl.startsWith('data:application/pdf') ? 'pdf' : 'jpg'}`}
                        >
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!selectedUser.aadharDocumentUrl && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Aadhar Document
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-lg text-center text-muted-foreground">
                    No Aadhar document uploaded
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    setUserDetailsDialogOpen(false);
                    openApproveDialog(selectedUser);
                  }}
                  disabled={actionLoading === selectedUser.uid}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve User
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setUserDetailsDialogOpen(false);
                    openRejectDialog(selectedUser);
                  }}
                  disabled={actionLoading === selectedUser.uid}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Reject User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
