import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user.types';
import DashboardLayout from '@/components/DashboardLayout';
import PropertyForm from '@/components/property/PropertyForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard, Home, MessageSquare, User } from 'lucide-react';
import { Property } from '@/types/property.types';
import * as propertyService from '@/services/propertyService';
import { toast } from 'sonner';

/**
 * EditPropertyPage Component
 * 
 * Page for editing existing property listings.
 * Protected route for seller/agent roles.
 * 
 * Requirements:
 * - 11.2: Update property details
 */

const EditPropertyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const propertyData = await propertyService.getProperty(id);
        setProperty(propertyData);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleSubmit = async (data: Partial<Property>) => {
    if (!id) return;

    try {
      await propertyService.updateProperty(id, data);
      toast.success('Property updated successfully!');
      navigate(`/properties/${id}`);
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property. Please try again.');
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

  if (loading) {
    return (
      <DashboardLayout links={getSidebarLinks()} title="Edit Property">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !property) {
    return (
      <DashboardLayout links={getSidebarLinks()} title="Edit Property">
        <Button
          variant="ghost"
          onClick={() => navigate('/my-properties')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Properties
        </Button>
        <ErrorMessage message={error || 'Property not found'} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout links={getSidebarLinks()} title="Edit Property">
      <Button
        variant="ghost"
        onClick={() => navigate('/my-properties')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My Properties
      </Button>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading mb-2">Edit Property</h1>
        <p className="text-muted-foreground">
          Update your property details
        </p>
      </div>

      <div className="max-w-4xl">
        <PropertyForm
          onSubmit={handleSubmit}
          mode="edit"
          initialData={property}
        />
      </div>
    </DashboardLayout>
  );
};

export default EditPropertyPage;
