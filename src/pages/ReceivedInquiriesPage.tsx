import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user.types';
import DashboardLayout from '@/components/DashboardLayout';
import { InquiryList } from '@/components/inquiry';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { LayoutDashboard, Home, Heart, MessageSquare, Settings } from 'lucide-react';
import { getInquiriesByAgent } from '@/services/inquiryService';
import { getProperty } from '@/services/propertyService';
import { Inquiry } from '@/types/inquiry.types';
import { Property } from '@/types/property.types';

/**
 * ReceivedInquiriesPage Component
 * 
 * Displays agent/seller's received inquiries from buyers.
 * Protected route for seller and agent roles.
 * 
 * Requirements:
 * - 9.3: Display all received inquiries in Agent Dashboard
 */

const ReceivedInquiriesPage = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<Map<string, Property>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inquiries and related properties
  const fetchInquiries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch agent's received inquiries
      const fetchedInquiries = await getInquiriesByAgent(user.uid);
      setInquiries(fetchedInquiries);

      // Fetch properties for each inquiry
      const propertyMap = new Map<string, Property>();
      const propertyPromises = fetchedInquiries.map(async (inquiry) => {
        try {
          const property = await getProperty(inquiry.propertyId);
          if (property) {
            propertyMap.set(inquiry.propertyId, property);
          }
        } catch (err) {
          console.error(`Error fetching property ${inquiry.propertyId}:`, err);
        }
      });

      await Promise.all(propertyPromises);
      setProperties(propertyMap);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Failed to load inquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [user]);

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
          { to: '/agent/profile', label: 'Profile', icon: Settings },
          { to: '/settings', label: 'Settings', icon: Settings },
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
    <DashboardLayout links={getSidebarLinks()} title="Received Inquiries">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading mb-2">Received Inquiries</h1>
        <p className="text-muted-foreground">
          Manage inquiries from potential buyers
        </p>
      </div>

      <InquiryList
        inquiries={inquiries}
        properties={properties}
        loading={loading}
        error={error}
        onRefresh={fetchInquiries}
        onResponseSubmitted={fetchInquiries}
      />
    </DashboardLayout>
  );
};

export default ReceivedInquiriesPage;
