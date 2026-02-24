import { useState, useEffect } from 'react';
import PropertyFilters from '@/components/property/PropertyFilters';
import PropertyList from '@/components/property/PropertyList';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Input } from '@/components/ui/input';
import { Search, Home, Heart, LayoutDashboard, MessageSquare, Settings, User, Map } from 'lucide-react';
import { PropertyFilters as PropertyFiltersType } from '@/types/property.types';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user.types';
import { useProperties } from '@/context/PropertyContext';

/**
 * PropertiesPage Component
 * 
 * Main page for browsing and searching properties.
 * Integrates filters, search, and property list.
 * 
 * Requirements:
 * - 6.1: Display all approved properties
 * - 6.2: Filter properties within 2 seconds
 * - 22.1: Render initial content within 2 seconds
 * - 22.3: Return search results within 2 seconds
 */

const PropertiesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { refreshProperties, setFilters } = useProperties();

  // Load properties on mount
  useEffect(() => {
    refreshProperties();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Update location filter based on search
    setFilters({
      location: value,
    });
    refreshProperties();
  };

  // Sidebar links based on user role - same as DashboardPage
  const getSidebarLinks = () => {
    if (!user) return [];

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
    <DashboardLayout links={getSidebarLinks()} title="Properties">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading mb-2">Browse Properties</h1>
        <p className="text-muted-foreground">
          Find your dream property from our extensive collection
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by location, city, or area..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <PropertyFilters />
          </div>
        </div>

        {/* Property List */}
        <div className="lg:col-span-3">
          <PropertyList showOnlyApproved={true} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PropertiesPage;
