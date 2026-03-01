import WishlistView from '@/components/wishlist/WishlistView';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user.types';
import { LayoutDashboard, Home, Heart, MessageSquare, User, Map } from 'lucide-react';

/**
 * WishlistPage Component
 * 
 * Displays buyer's saved properties.
 * Protected route for buyer role only.
 * 
 * Requirements:
 * - 2.2: Restrict to buyer role
 * - 8.3: Display wishlist
 */

const WishlistPage = () => {
  const { user } = useAuth();

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
    <DashboardLayout links={getSidebarLinks()} title="Wishlist">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          Properties you've saved for later
        </p>
      </div>

      <WishlistView />
    </DashboardLayout>
  );
};

export default WishlistPage;
