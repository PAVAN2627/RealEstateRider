import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Home, TrendingUp } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { useInquiries } from '@/hooks/useInquiries';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

/**
 * BuyerDashboard Component
 * 
 * Displays buyer-specific analytics and recent activity.
 * Shows wishlist count, inquiries count, and recent actions.
 * 
 * Requirements:
 * - 14.1: Display wishlist count and sent inquiries count
 * - 14.6: Display recent activity list (last 10 actions)
 */

const BuyerDashboard = () => {
  const { user } = useAuth();
  const { wishlistPropertyIds, loading: wishlistLoading, error: wishlistError } = useWishlist();
  const { inquiries, loading: inquiriesLoading, error: inquiriesError, fetchInquiriesByBuyer } = useInquiries();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch inquiries on mount
  useEffect(() => {
    if (user?.uid) {
      fetchInquiriesByBuyer(user.uid);
    }
  }, [user?.uid, fetchInquiriesByBuyer]);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Fetch recent activity logs for the user
        const activityLogService = await import('@/services/activityLogService');
        const logs = await activityLogService.getUserActivityLogs(user.uid, 10);
        setRecentActivity(logs);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [user]);

  const formatTimeAgo = (timestamp: any): string => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getActionLabel = (actionType: string): string => {
    const labels: Record<string, string> = {
      login: 'Logged in',
      logout: 'Logged out',
      property_created: 'Property created',
      inquiry_created: 'Inquiry sent',
      inquiry_responded: 'Inquiry response received',
    };
    return labels[actionType] || actionType;
  };

  if (wishlistLoading || inquiriesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (wishlistError || inquiriesError) {
    return (
      <ErrorMessage 
        message={wishlistError || inquiriesError || 'Failed to load dashboard data'} 
      />
    );
  }

  const wishlistCount = wishlistPropertyIds?.length || 0;
  const inquiriesCount = inquiries?.length || 0;
  const respondedInquiries = inquiries?.filter(inq => inq.status === 'responded').length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Welcome back, {user?.profile?.name || 'Buyer'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your property search overview
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Saved Properties"
          value={wishlistCount}
          trend={wishlistCount > 0 ? 'up' : 'neutral'}
          trendValue={wishlistCount > 0 ? `${wishlistCount} saved` : 'None yet'}
        />
        <AnalyticsCard
          title="Inquiries Sent"
          value={inquiriesCount}
          trend={inquiriesCount > 0 ? 'up' : 'neutral'}
          trendValue={inquiriesCount > 0 ? `${inquiriesCount} total` : 'None yet'}
        />
        <AnalyticsCard
          title="Responses Received"
          value={respondedInquiries}
          trend={respondedInquiries > 0 ? 'up' : 'neutral'}
          trendValue={respondedInquiries > 0 ? `${respondedInquiries} replied` : 'Waiting'}
        />
        <AnalyticsCard
          title="Properties Viewed"
          value="--"
          trend="neutral"
          trendValue="Coming soon"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/properties">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Browse Properties</h3>
                <p className="text-sm text-muted-foreground">Find your dream home</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/wishlist">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold">My Wishlist</h3>
                <p className="text-sm text-muted-foreground">{wishlistCount} saved properties</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/my-inquiries">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">My Inquiries</h3>
                <p className="text-sm text-muted-foreground">{inquiriesCount} inquiries sent</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm mt-1">Start browsing properties to see your activity here</p>
              <Button asChild className="mt-4">
                <Link to="/properties">Browse Properties</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {getActionLabel(activity.actionType)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.metadata?.propertyTitle || activity.metadata?.email || 'Activity'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerDashboard;
