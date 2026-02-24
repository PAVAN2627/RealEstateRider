import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { LayoutDashboard, Home, Heart, Bell, User, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const sidebarLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/my-properties", label: "My Properties", icon: Home },
  { to: "/dashboard/saved", label: "Saved Properties", icon: Heart },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const activityData = [
  { month: "Jan", views: 45 },
  { month: "Feb", views: 62 },
  { month: "Mar", views: 38 },
  { month: "Apr", views: 85 },
  { month: "May", views: 72 },
  { month: "Jun", views: 96 },
];

const pieData = [
  { name: "Apartments", value: 45 },
  { name: "Villas", value: 25 },
  { name: "Townhouses", value: 20 },
  { name: "Plots", value: 10 },
];

const COLORS = ["hsl(239 84% 67%)", "hsl(38 92% 50%)", "hsl(160 84% 39%)", "hsl(215 16% 47%)"];

const UserDashboard = () => {
  return (
    <DashboardLayout links={sidebarLinks} title="User Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-foreground">Welcome back, Rahul 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your properties</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Home} label="My Properties" value="12" change="+2" positive index={0} />
        <StatsCard icon={Heart} label="Saved" value="24" change="+5" positive index={1} />
        <StatsCard icon={Bell} label="Notifications" value="8" index={2} />
        <StatsCard icon={User} label="Profile Views" value="156" change="+12%" positive index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <h3 className="font-heading font-semibold text-card-foreground mb-4">Property Views</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
              <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="views" fill="hsl(239 84% 67%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card">
          <h3 className="font-heading font-semibold text-card-foreground mb-4">Property Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 rounded-2xl bg-card p-6 shadow-card">
        <h3 className="font-heading font-semibold text-card-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: "Property viewed", detail: "Skyline Luxury Apartments", time: "2 hours ago" },
            { action: "Inquiry sent", detail: "Palm Villa Residency", time: "5 hours ago" },
            { action: "Property saved", detail: "Green Valley Townhouses", time: "1 day ago" },
            { action: "Profile updated", detail: "Added Aadhar verification", time: "2 days ago" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-card-foreground">{item.action}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
