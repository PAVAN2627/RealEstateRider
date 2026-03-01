import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user.types';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Home, Heart, MessageSquare, Settings, User, Mail, Phone, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

/**
 * SettingsPage Component
 * 
 * User profile and account settings management.
 * 
 * Requirements:
 * - User profile management
 * - Account settings
 */

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    phone: user?.profile?.phone || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Implement profile update service
      toast({
        title: 'Settings Updated',
        description: 'Your profile settings have been saved successfully.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.profile?.name || '',
      phone: user?.profile?.phone || '',
    });
    setIsEditing(false);
  };

  // Sidebar links based on user role - same as DashboardPage
  const getSidebarLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.BUYER:
        return [
          { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/properties', label: 'Browse Properties', icon: Home },
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
          { to: '/admin/activity', label: 'Activity Logs', icon: Settings },
        ];
      default:
        return [];
    }
  };

  return (
    <DashboardLayout links={getSidebarLinks()} title="Settings">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              View your account details and verification status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label>Account Role</Label>
              <Input
                value={user?.role?.toUpperCase() || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Verification Status</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={user?.verificationStatus?.toUpperCase() || ''}
                  disabled
                  className="bg-muted"
                />
                {user?.verificationStatus === 'approved' && (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
