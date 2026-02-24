import { useAuth } from '@/hooks/useAuth';
import { BuyerDashboard, SellerDashboard, AgentDashboard, AdminDashboard } from '@/components/dashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { UserRole } from '@/types/user.types';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Home, Heart, MessageSquare, User, Map } from 'lucide-react';

/**
 * DashboardPage Component
 * 
 * Routes to role-specific dashboard based on user role.
 * Implements protected route wrapper.
 * 
 * Requirements:
 * - 2.1: Role-based access control
 * - 14.1-14.4: Display role-specific dashboards
 */

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  // Define sidebar links based on role
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
          { to: '/profile', label: 'Profile', icon: Settings },
        ];
      case UserRole.AGENT:
        return [
          { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/my-properties', label: 'My Properties', icon: Home },
          { to: '/properties/new', label: 'Add Property', icon: Home },
          { to: '/received-inquiries', label: 'Inquiries', icon: MessageSquare },
          { to: '/profile', label: 'Profile', icon: Settings },
        ];
      case UserRole.ADMIN:
        return [
          { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/admin/users', label: 'Manage Users', icon: Home },
          { to: '/admin/properties', label: 'All Properties', icon: Home },
          { to: '/admin/approvals/users', label: 'User Approvals', icon: MessageSquare },
          { to: '/admin/approvals/properties', label: 'Property Approvals', icon: Home },
          { to: '/admin/activity', label: 'Activity Logs', icon: MessageSquare },
          { to: '/profile', label: 'Profile', icon: Settings },
        ];
      default:
        return [];
    }
  };

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.BUYER:
        return <BuyerDashboard />;
      case UserRole.SELLER:
        return <SellerDashboard />;
      case UserRole.AGENT:
        return <AgentDashboard />;
      case UserRole.ADMIN:
        return <AdminDashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <DashboardLayout links={getSidebarLinks()} title="Dashboard">
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default DashboardPage;
