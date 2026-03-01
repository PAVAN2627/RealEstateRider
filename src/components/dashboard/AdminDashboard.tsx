import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, UserCheck, AlertTriangle, Activity } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { VerificationStatus as UserVerificationStatus } from '@/types/user.types';
import { ActivityLog } from '@/types/notification.types';
import PlatformChatbot from '@/components/chatbot/PlatformChatbot';
import * as userService from '@/services/userService';
import * as propertyService from '@/services/propertyService';
import * as activityLogService from '@/services/activityLogService';

/**
 * AdminDashboard Component
 * 
 * Displays admin-specific analytics and platform overview.
 * Shows user counts, property counts, pending approvals, and recent activity logs.
 * 
 * Requirements:
 * - 14.4: Display total users, pending users, total properties, pending properties counts
 * - 14.5: Display analytics data updated within 5 seconds
 * - 14.6: Display recent activity logs
 */

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [pendingProperties, setPendingProperties] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only show loading spinner on initial load
        if (isInitialLoad) {
          setLoading(true);
        }
        setError(null);

        // Fetch all users
        const allUsers = await userService.getAllUsers();
        setTotalUsers(allUsers.length);
        setPendingUsers(
          allUsers.filter((u) => u.verificationStatus === UserVerificationStatus.PENDING)
            .length
        );

        // Fetch all properties
        const allProperties = await propertyService.getProperties();
        setTotalProperties(allProperties.length);
        setPendingProperties(
          allProperties.filter((p) => p.verificationStatus === 'pending').length
        );

        // Fetch recent activity logs (last 10)
        const logs = await activityLogService.getActivityLogs();
        setRecentActivity(logs.slice(0, 10));
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchData();

    // Refresh data every 30 seconds (Requirement 14.5)
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: any): string => {
    const date = timestamp.toDate();
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getActionLabel = (actionType: string): string => {
    const labels: Record<string, string> = {
      login: 'User Login',
      logout: 'User Logout',
      property_created: 'Property Created',
      property_updated: 'Property Updated',
      property_deleted: 'Property Deleted',
      inquiry_created: 'Inquiry Created',
      inquiry_responded: 'Inquiry Responded',
      user_approved: 'User Approved',
      user_rejected: 'User Rejected',
      property_approved: 'Property Approved',
      property_rejected: 'Property Rejected',
    };
    return labels[actionType] || actionType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Admin Dashboard 👑
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and management
          </p>
        </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Users"
          value={totalUsers}
          trend={totalUsers > 0 ? 'up' : 'neutral'}
          trendValue={`${totalUsers} registered`}
        />
        <AnalyticsCard
          title="Pending Users"
          value={pendingUsers}
          trend={pendingUsers > 0 ? 'neutral' : 'up'}
          trendValue={pendingUsers > 0 ? 'Needs review' : 'All approved'}
        />
        <AnalyticsCard
          title="Total Properties"
          value={totalProperties}
          trend={totalProperties > 0 ? 'up' : 'neutral'}
          trendValue={`${totalProperties} listings`}
        />
        <AnalyticsCard
          title="Pending Properties"
          value={pendingProperties}
          trend={pendingProperties > 0 ? 'neutral' : 'up'}
          trendValue={pendingProperties > 0 ? 'Needs review' : 'All approved'}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/admin/approvals/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">User Approvals</h3>
                <p className="text-sm text-muted-foreground">
                  {pendingUsers} pending
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/approvals/properties">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Home className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Property Approvals</h3>
                <p className="text-sm text-muted-foreground">
                  {pendingProperties} pending
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Users</h3>
                <p className="text-sm text-muted-foreground">
                  {totalUsers} users
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/activity">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Activity className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold">Activity Logs</h3>
                <p className="text-sm text-muted-foreground">View all</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/activity">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm mt-1">Platform activity will appear here</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-4">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      {getActionLabel(log.actionType)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      User ID: {log.userId.substring(0, 8)}...
                      {log.entityId && ` • Entity: ${log.entityId.substring(0, 8)}...`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals Summary */}
      {(pendingUsers > 0 || pendingProperties > 0) && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <CardTitle>Pending Approvals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingUsers > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-semibold">{pendingUsers}</span> users awaiting
                    approval
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/approvals/users">Review</Link>
                  </Button>
                </div>
              )}
              {pendingProperties > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-semibold">{pendingProperties}</span> properties
                    awaiting approval
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/approvals/properties">Review</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
      <PlatformChatbot />
    </>
  );
};

export default AdminDashboard;
