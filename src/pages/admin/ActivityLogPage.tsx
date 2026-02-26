import DashboardLayout from '@/components/DashboardLayout';
import ActivityLog from '@/components/admin/ActivityLog';
import { LayoutDashboard, UserCheck, CheckSquare, Users, Building2, Activity } from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/approvals/users', label: 'User Approvals', icon: UserCheck },
  { to: '/admin/approvals/properties', label: 'Property Approvals', icon: CheckSquare },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/properties', label: 'All Properties', icon: Building2 },
  { to: '/admin/activity', label: 'Activity Logs', icon: Activity },
];

const ActivityLogPage = () => {
  return (
    <DashboardLayout links={sidebarLinks} title="Admin Panel">
      <ActivityLog />
    </DashboardLayout>
  );
};

export default ActivityLogPage;
