import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user.types';
import DashboardLayout from '@/components/DashboardLayout';
import WhatsAppChatInterface from '@/components/inquiry/WhatsAppChatInterface';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { LayoutDashboard, Home, Heart, MessageSquare, User, Map as MapIcon, Settings } from 'lucide-react';
import { getInquiriesByBuyer } from '@/services/inquiryService';
import { getProperty } from '@/services/propertyService';
import { Inquiry } from '@/types/inquiry.types';
import { Property } from '@/types/property.types';

/**
 * MyInquiriesPage Component
 * 
 * Displays buyer's sent inquiries with status tracking.
 * Protected route for buyer role only.
 * 
 * Requirements:
 * - 9.4: Display all sent inquiries with status in Buyer Dashboard
 */

const MyInquiriesPage = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<Map<string, Property>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inquiries and related properties
  const fetchInquiries = async () => {
    if (!user) return;

    try {
      // Only show loading spinner on initial load
      if (inquiries.length === 0) {
        setLoading(true);
      }
      setError(null);

      // Fetch buyer's inquiries
      const fetchedInquiries = await getInquiriesByBuyer(user.uid);
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
          { to: '/properties/map', label: 'Map View', icon: MapIcon },
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
    <DashboardLayout links={getSidebarLinks()} title="My Inquiries">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Chat with sellers and agents about properties
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <WhatsAppChatInterface
          inquiries={inquiries}
          properties={properties}
          onRefresh={fetchInquiries}
        />
      )}
    </DashboardLayout>
  );
};

export default MyInquiriesPage;
