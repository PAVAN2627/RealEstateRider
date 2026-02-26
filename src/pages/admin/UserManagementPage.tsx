import DashboardLayout from '@/components/DashboardLayout';
import UserManagement from '@/components/admin/UserManagement';
import { LayoutDashboard, UserCheck, CheckSquare, Users, Building2, Activity } from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/approvals/users', label: 'User Approvals', icon: UserCheck },
  { to: '/admin/approvals/properties', label: 'Property Approvals', icon: CheckSquare },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/properties', label: 'All Properties', icon: Building2 },
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
