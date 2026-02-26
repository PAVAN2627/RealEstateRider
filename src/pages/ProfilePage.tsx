import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, Shield, CheckCircle, Lock, Eye, EyeOff, LayoutDashboard, Home, Heart, MessageSquare, Map } from 'lucide-react';
import { UserRole } from '@/types/user.types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { updatePassword } from 'firebase/auth';
import { auth, db } from '@/config/firebase.config';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

/**
 * ProfilePage Component
 * 
 * Displays user profile information for all user types
 */
const ProfilePage = () => {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.profile?.name || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const getSidebarLinks = () => {
    switch (user.role) {
      case UserRole.BUYER:
        return [
          { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/properties', label: 'Browse Properties', icon: Home },
          { to: '/properties/map', label: 'Map View', icon: Map },
          { to: '/wishlist', label: 'Wishlist', icon: Heart },
          { to: '/my-inquiries', label: 'My Inquiries', icon: MessageSquare },
          { to: '/profile', label: 'Profile', icon: User },
        ];
      case UserRole.SELLER:
        return [
          { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/my-properties', label: 'My Properties', icon: Home },
          { to: '/properties/new', label: 'Add Property', icon: Home },
          { to: '/received-inquiries', label: 'Inquiries', icon: MessageSquare },
          { to: '/profile', label: 'Profile', icon: User },
        ];
      case UserRole.AGENT:
        return [
          { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/my-properties', label: 'My Properties', icon: Home },
          { to: '/properties/new', label: 'Add Property', icon: Home },
          { to: '/received-inquiries', label: 'Inquiries', icon: MessageSquare },
          { to: '/profile', label: 'Profile', icon: User },
        ];
      case UserRole.ADMIN:
        return [
          { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/admin/users', label: 'Manage Users', icon: Home },
          { to: '/admin/approvals/users', label: 'User Approvals', icon: MessageSquare },
          { to: '/admin/approvals/properties', label: 'Property Approvals', icon: Home },
          { to: '/admin/activity', label: 'Activity Logs', icon: MessageSquare },
          { to: '/profile', label: 'Profile', icon: User },
        ];
      default:
        return [];
    }
  };

  const getRoleBadge = () => {
    const roleColors = {
      [UserRole.BUYER]: 'bg-blue-500/10 text-blue-500',
      [UserRole.SELLER]: 'bg-green-500/10 text-green-500',
      [UserRole.AGENT]: 'bg-purple-500/10 text-purple-500',
      [UserRole.ADMIN]: 'bg-red-500/10 text-red-500',
    };

    return (
      <Badge className={roleColors[user.role]}>
        {user.role.toUpperCase()}
      </Badge>
    );
  };

  const getVerificationBadge = () => {
    const statusColors = {
      approved: 'bg-green-500/10 text-green-500',
      pending: 'bg-yellow-500/10 text-yellow-500',
      rejected: 'bg-red-500/10 text-red-500',
      suspended: 'bg-gray-500/10 text-gray-500',
    };

    return (
      <Badge className={statusColors[user.verificationStatus]}>
        {user.verificationStatus === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
        {user.verificationStatus.toUpperCase()}
      </Badge>
    );
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      // Get current user document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
      
      const currentData = userDoc.data();
      
      // Update profile in Firestore - merge with existing profile
      await updateDoc(userRef, {
        'profile.name': name.trim(),
        'profile.phone': phone.trim() || '',
        lastLoginAt: Timestamp.now(),
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Reload page to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!auth.currentUser) {
      toast.error('No user logged in');
      return;
    }

    // Validation
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      // Update password in Firebase Auth
      await updatePassword(auth.currentUser, newPassword);

      toast.success('Password changed successfully!');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log in again before changing your password');
      } else {
        toast.error(error.message || 'Failed to change password');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout links={getSidebarLinks()} title="Profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account information
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Avatar and Basic Info */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{user.profile?.name || 'User'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge()}
                  {getVerificationBadge()}
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {user.profile?.name || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {user.profile?.phone || 'Not provided'}
                  </p>
                )}
              </div>

              {/* User ID */}
              <div className="space-y-2">
                <Label>
                  <Shield className="w-4 h-4 inline mr-2" />
                  User ID
                </Label>
                <p className="text-sm text-muted-foreground font-mono">{user.uid}</p>
              </div>

              {/* Registration Date */}
              <div className="space-y-2">
                <Label>
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Member Since
                </Label>
                <p className="text-sm text-muted-foreground">
                  {user.createdAt?.toDate().toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Last Login */}
              {user.lastLoginAt && (
                <div className="space-y-2">
                  <Label>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Last Login
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {user.lastLoginAt.toDate().toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.profile?.name || '');
                    setPhone(user.profile?.phone || '');
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isChangingPassword ? (
              <Button onClick={() => setIsChangingPassword(true)} variant="outline">
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isSaving}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isSaving}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Change Buttons */}
                <div className="flex gap-2">
                  <Button onClick={handlePasswordChange} disabled={isSaving}>
                    {isSaving ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aadhar Document Card */}
        {user.aadharDocumentUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Aadhar Document</Label>
                <div className="flex items-center gap-4">
                  {user.aadharDocumentUrl.startsWith('data:application/pdf') ? (
                    <div className="text-sm text-muted-foreground">
                      PDF Document Uploaded
                    </div>
                  ) : (
                    <img
                      src={user.aadharDocumentUrl}
                      alt="Aadhar Document"
                      className="h-32 rounded-lg border"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Your identity document has been submitted for verification.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: {getVerificationBadge()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
