import DashboardLayout from '@/components/DashboardLayout';
import UserManagement from '@/components/admin/UserManagement';
import { LayoutDashboard, Users, Home, Activity } from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/approvals/users', label: 'User Approvals', icon: Users },
  { to: '/admin/approvals/properties', label: 'Property Approvals', icon: Home },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/activity', label: 'Activity Logs', icon: Activity },
];

const UserManagementPage = () => {
  return (
    <DashboardLayout links={sidebarLinks} title="Admin Panel">
      <UserManagement />
    </DashboardLayout>
  );
};

export default UserManagementPage;
