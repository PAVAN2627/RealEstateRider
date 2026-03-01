import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, CheckCircle, Clock, Settings } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Property } from '@/types/property.types';
import { Inquiry, InquiryStatus } from '@/types/inquiry.types';
import PlatformChatbot from '@/components/chatbot/PlatformChatbot';
import * as propertyService from '@/services/propertyService';
import * as inquiryService from '@/services/inquiryService';

/**
 * AgentDashboard Component
 * 
 * Displays agent-specific analytics and property management.
 * Shows managed properties, received inquiries, responded inquiries, and recent inquiries.
 * 
 * Requirements:
 * - 14.3: Display managed properties, received inquiries, responded inquiries counts
 * - 14.6: Display recent activity list
 * - 11.6: Display count of inquiries received for each property
 */

const AgentDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch agent's properties
        const userProperties = await propertyService.getUserProperties(user.uid);
        setProperties(userProperties);

        // Fetch inquiries for agent
        const agentInquiries = await inquiryService.getInquiriesByAgent(user.uid);
        setInquiries(agentInquiries);
      } catch (err) {
        console.error('Error fetching agent data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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

  const totalProperties = properties.length;
  const totalInquiries = inquiries.length;
  const respondedInquiries = inquiries.filter(
    (inq) => inq.status === InquiryStatus.RESPONDED
  ).length;
  const pendingInquiries = inquiries.filter(
    (inq) => inq.status === InquiryStatus.PENDING
  ).length;

  // Get recent inquiries (last 5)
  const recentInquiries = inquiries
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, 5);

  const formatTimeAgo = (timestamp: any): string => {
    const date = timestamp.toDate();
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Welcome back, Agent {user?.profile?.name || ''} 🏢
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your client properties and respond to inquiries
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/agent/profile">
                <Settings className="w-4 h-4" />
                Agent Profile
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link to="/properties/new">
                <PlusCircle className="w-4 h-4" />
                Add Property
              </Link>
            </Button>
          </div>
        </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Client Properties"
          value={totalProperties}
          trend={totalProperties > 0 ? 'up' : 'neutral'}
          trendValue={`${totalProperties} managed`}
        />
        <AnalyticsCard
          title="Client Inquiries"
          value={totalInquiries}
          trend={totalInquiries > 0 ? 'up' : 'neutral'}
          trendValue={`${totalInquiries} total`}
        />
        <AnalyticsCard
          title="Responded"
          value={respondedInquiries}
          trend={respondedInquiries > 0 ? 'up' : 'neutral'}
          trendValue={`${respondedInquiries} handled`}
        />
        <AnalyticsCard
          title="Pending Response"
          value={pendingInquiries}
          trend={pendingInquiries > 0 ? 'neutral' : 'up'}
          trendValue={pendingInquiries > 0 ? 'Action needed' : 'All handled'}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/properties/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <PlusCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Add New Property</h3>
                <p className="text-sm text-muted-foreground">List a new property</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/my-properties">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Home className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">My Properties</h3>
                <p className="text-sm text-muted-foreground">{totalProperties} listings</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/received-inquiries">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Inquiries</h3>
                <p className="text-sm text-muted-foreground">
                  {pendingInquiries} pending
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Inquiries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Inquiries</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/received-inquiries">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentInquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No inquiries yet</p>
              <p className="text-sm mt-1">
                Inquiries from buyers will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-card-foreground">
                        Inquiry from Buyer
                      </p>
                      {inquiry.status === InquiryStatus.RESPONDED ? (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Responded
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {inquiry.message.substring(0, 80)}
                      {inquiry.message.length > 80 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(inquiry.createdAt)}
                    </span>
                    {inquiry.status === InquiryStatus.PENDING && (
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/received-inquiries`}>Respond</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>My Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No properties listed yet</p>
              <p className="text-sm mt-1">Start by adding your first property</p>
              <Button asChild className="mt-4">
                <Link to="/properties/new">Add Property</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.slice(0, 5).map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      {property.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {property.location.city}, {property.location.state} • ₹
                      {property.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {inquiries.filter((inq) => inq.propertyId === property.id).length}{' '}
                      inquiries
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/properties/${property.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      <PlatformChatbot />
    </>
  );
};

export default AgentDashboard;
