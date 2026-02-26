import DashboardLayout from "@/components/DashboardLayout";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { LayoutDashboard, UserCheck, CheckSquare, Users, Building2, Activity } from "lucide-react";

const sidebarLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/approvals/users", label: "User Approvals", icon: UserCheck },
  { to: "/admin/approvals/properties", label: "Property Approvals", icon: CheckSquare },
  { to: "/admin/users", label: "Manage Users", icon: Users },
  { to: "/admin/properties", label: "All Properties", icon: Building2 },
  { to: "/admin/activity", label: "Activity Logs", icon: Activity },
];

const AdminDashboardPage = () => {
  return (
    <DashboardLayout links={sidebarLinks} title="Admin Panel">
      <AdminDashboard />
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
