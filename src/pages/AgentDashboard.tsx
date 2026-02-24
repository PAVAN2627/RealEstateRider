import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { LayoutDashboard, Home, PlusCircle, MessageSquare, BarChart3, Settings, TrendingUp, IndianRupee } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { to: "/agent-dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/agent-dashboard/post", label: "Post Property", icon: PlusCircle },
  { to: "/agent-dashboard/listings", label: "My Listings", icon: Home },
  { to: "/agent-dashboard/inquiries", label: "Inquiries", icon: MessageSquare },
  { to: "/agent-dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/agent-dashboard/settings", label: "Settings", icon: Settings },
];

const monthlyData = [
  { month: "Jan", listings: 4, sold: 2 },
  { month: "Feb", listings: 6, sold: 3 },
  { month: "Mar", listings: 5, sold: 4 },
  { month: "Apr", listings: 8, sold: 5 },
  { month: "May", listings: 10, sold: 6 },
  { month: "Jun", listings: 12, sold: 8 },
];

const revenueData = [
  { month: "Jan", revenue: 25 },
  { month: "Feb", revenue: 38 },
  { month: "Mar", revenue: 42 },
  { month: "Apr", revenue: 55 },
  { month: "May", revenue: 62 },
  { month: "Jun", revenue: 78 },
];

const AgentDashboard = () => {
  return (
    <DashboardLayout links={sidebarLinks} title="Agent Dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Agent Dashboard 🏢</h1>
          <p className="text-muted-foreground mt-1">Manage your listings and track performance</p>
        </div>
        <Button className="gradient-primary text-primary-foreground border-0 gap-2">
          <PlusCircle className="w-4 h-4" /> Post Property
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Home} label="Total Listings" value="45" change="+8" positive index={0} />
        <StatsCard icon={TrendingUp} label="Active Listings" value="32" change="+3" positive index={1} />
        <StatsCard icon={IndianRupee} label="Revenue" value="₹78L" change="+22%" positive index={2} />
        <StatsCard icon={MessageSquare} label="Inquiries" value="28" change="+15" positive index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card p-6 shadow-card">
          <h3 className="font-heading font-semibold text-card-foreground mb-4">Monthly Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239 84% 67%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(239 84% 67%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
              <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="listings" stroke="hsl(239 84% 67%)" fillOpacity={1} fill="url(#colorListings)" strokeWidth={2} />
              <Area type="monotone" dataKey="sold" stroke="hsl(160 84% 39%)" fillOpacity={1} fill="url(#colorSold)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card">
          <h3 className="font-heading font-semibold text-card-foreground mb-4">Revenue (₹ Lakhs)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
              <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(38 92% 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="mt-6 rounded-2xl bg-card p-6 shadow-card">
        <h3 className="font-heading font-semibold text-card-foreground mb-4">Recent Inquiries</h3>
        <div className="space-y-4">
          {[
            { buyer: "Priya Sharma", property: "Skyline Apartments, Unit 5A", status: "New", time: "30 min ago" },
            { buyer: "Amit Kumar", property: "Palm Villa #12", status: "Replied", time: "2 hours ago" },
            { buyer: "Neha Gupta", property: "Green Valley TH-3", status: "New", time: "5 hours ago" },
            { buyer: "Rajesh Patel", property: "Marina Heights, 8th Floor", status: "Closed", time: "1 day ago" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-card-foreground">{item.buyer}</p>
                <p className="text-xs text-muted-foreground">{item.property}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  item.status === "New" ? "bg-primary/10 text-primary" :
                  item.status === "Replied" ? "bg-success/10 text-success" :
                  "bg-muted text-muted-foreground"
                }`}>{item.status}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
