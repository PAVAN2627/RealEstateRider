import AnalyticsCard from './AnalyticsCard';

/**
 * Example usage of AnalyticsCard component across different dashboard roles
 * 
 * This file demonstrates how to use the AnalyticsCard component in various
 * dashboard contexts (Buyer, Seller, Agent, Admin).
 */

export const BuyerDashboardExample = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnalyticsCard 
        title="Wishlisted Properties" 
        value={12} 
        trend="up" 
        trendValue="+3" 
      />
      <AnalyticsCard 
        title="Sent Inquiries" 
        value={8} 
        trend="neutral" 
        trendValue="0" 
      />
      <AnalyticsCard 
        title="Responses Received" 
        value={5} 
      />
      <AnalyticsCard 
        title="Properties Viewed" 
        value={45} 
        trend="up" 
        trendValue="+15%" 
      />
    </div>
  );
};

export const SellerDashboardExample = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnalyticsCard 
        title="Total Listings" 
        value={24} 
        trend="up" 
        trendValue="+2" 
      />
      <AnalyticsCard 
        title="Pending Approvals" 
        value={3} 
        trend="down" 
        trendValue="-1" 
      />
      <AnalyticsCard 
        title="Received Inquiries" 
        value={18} 
        trend="up" 
        trendValue="+5" 
      />
      <AnalyticsCard 
        title="Active Listings" 
        value={21} 
      />
    </div>
  );
};

export const AgentDashboardExample = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnalyticsCard 
        title="Managed Properties" 
        value={56} 
        trend="up" 
        trendValue="+8" 
      />
      <AnalyticsCard 
        title="Received Inquiries" 
        value={42} 
        trend="up" 
        trendValue="+12%" 
      />
      <AnalyticsCard 
        title="Responded Inquiries" 
        value={38} 
        trend="up" 
        trendValue="+10" 
      />
      <AnalyticsCard 
        title="Pending Responses" 
        value={4} 
        trend="down" 
        trendValue="-2" 
      />
    </div>
  );
};

export const AdminDashboardExample = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnalyticsCard 
        title="Total Users" 
        value={1234} 
        trend="up" 
        trendValue="+45" 
      />
      <AnalyticsCard 
        title="Pending Users" 
        value={23} 
        trend="neutral" 
        trendValue="0" 
      />
      <AnalyticsCard 
        title="Total Properties" 
        value={856} 
        trend="up" 
        trendValue="+67" 
      />
      <AnalyticsCard 
        title="Pending Properties" 
        value={15} 
        trend="down" 
        trendValue="-5" 
      />
    </div>
  );
};

export const FormattedValuesExample = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnalyticsCard 
        title="Total Revenue" 
        value="₹12.5M" 
        trend="up" 
        trendValue="+18%" 
      />
      <AnalyticsCard 
        title="Average Property Price" 
        value="₹45.2L" 
        trend="down" 
        trendValue="-3%" 
      />
      <AnalyticsCard 
        title="Conversion Rate" 
        value="23.5%" 
        trend="up" 
        trendValue="+2.1%" 
      />
    </div>
  );
};
