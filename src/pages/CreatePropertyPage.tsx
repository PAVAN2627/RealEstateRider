import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user.types';
import DashboardLayout from '@/components/DashboardLayout';
import PropertyForm from '@/components/property/PropertyForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard, Home, MessageSquare, User } from 'lucide-react';
import { CreatePropertyData } from '@/types/property.types';
import * as propertyService from '@/services/propertyService';
import { toast } from 'sonner';

/**
 * CreatePropertyPage Component
 * 
 * Page for creating new property listings.
 * Protected route for seller/agent roles.
 * 
 * Requirements:
 * - 4.1: Create property listing
 */

const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (data: CreatePropertyData) => {
    try {
      const property = await propertyService.createProperty(data);
      toast.success('Property created successfully! Awaiting admin approval.');
      navigate(`/properties/${property.id}`);
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create property. Please try again.');
      throw error;
    }
  };

  // Sidebar links based on user role - same as DashboardPage
  const getSidebarLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.BUYER:
        return [
          { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/properties', label: 'Browse Properties', icon: Home },
          { to: '/wishlist', label: 'Wishlist', icon: Home },
          { to: '/my-inquiries', label: 'My Inquiries', icon: MessageSquare },
          { to: '/settings', label: 'Settings', icon: Settings },
        ];
      case UserRole.SELLER:
        return [
          { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/my-properties', label: 'My Properties', icon: Home },
          { to: '/properties/new', label: 'Add Property', icon: Home },
          { to: '/received-inquiries', label: 'Inquiries', icon: MessageSquare },
          { to: '/settings', label: 'Settings', icon: Settings },
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
    <DashboardLayout links={getSidebarLinks()} title="Add Property">
      <Button
        variant="ghost"
        onClick={() => navigate('/my-properties')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My Properties
      </Button>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading mb-2">Add New Property</h1>
        <p className="text-muted-foreground">
          Fill in the details to list your property
        </p>
      </div>

      <div className="max-w-4xl">
        <PropertyForm onSubmit={handleSubmit} mode="create" />
      </div>
    </DashboardLayout>
  );
};

export default CreatePropertyPage;
