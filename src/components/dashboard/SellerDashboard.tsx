import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Property } from '@/types/property.types';
import PropertyDetailsModal from '@/components/property/PropertyDetailsModal';
import PlatformChatbot from '@/components/chatbot/PlatformChatbot';
import * as propertyService from '@/services/propertyService';
import * as inquiryService from '@/services/inquiryService';

/**
 * SellerDashboard Component
 * 
 * Displays seller-specific analytics and property management.
 * Shows total listings, pending approvals, received inquiries, and property list.
 * 
 * Requirements:
 * - 14.2: Display total listings, pending approvals, received inquiries counts
 * - 14.6: Display recent activity list
 * - 11.6: Display count of inquiries received for each property
 */

const SellerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [propertyInquiryCounts, setPropertyInquiryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user's properties
        const userProperties = await propertyService.getUserProperties(user.uid);
        setProperties(userProperties);

        // Fetch inquiries count for all properties
        let totalInquiries = 0;
        const counts: Record<string, number> = {};
        
        for (const property of userProperties) {
          try {
            const propertyInquiries = await inquiryService.getInquiriesByProperty(property.id);
            counts[property.id] = propertyInquiries.length;
            totalInquiries += propertyInquiries.length;
          } catch (err) {
            // Ignore index errors - just set count to 0
            console.warn(`Could not fetch inquiries for property ${property.id}:`, err);
            counts[property.id] = 0;
          }
        }
        
        setPropertyInquiryCounts(counts);
        setInquiriesCount(totalInquiries);
      } catch (err) {
        console.error('Error fetching seller data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
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

  const totalListings = properties.length;
  const pendingApprovals = properties.filter(
    (p) => p.verificationStatus === 'pending'
  ).length;
  const approvedListings = properties.filter(
    (p) => p.verificationStatus === 'approved'
  ).length;
  const rejectedListings = properties.filter(
    (p) => p.verificationStatus === 'rejected'
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Welcome back, {user?.profile?.name || 'Seller'} 🏠
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your property listings and track performance
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/properties/new">
              <PlusCircle className="w-4 h-4" />
              Add Property
            </Link>
          </Button>
        </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Listings"
          value={totalListings}
          trend={totalListings > 0 ? 'up' : 'neutral'}
          trendValue={`${totalListings} properties`}
        />
        <AnalyticsCard
          title="Pending Approvals"
          value={pendingApprovals}
          trend={pendingApprovals > 0 ? 'neutral' : 'up'}
          trendValue={pendingApprovals > 0 ? 'Awaiting review' : 'All approved'}
        />
        <AnalyticsCard
          title="Approved Listings"
          value={approvedListings}
          trend={approvedListings > 0 ? 'up' : 'neutral'}
          trendValue={`${approvedListings} live`}
        />
        <AnalyticsCard
          title="Inquiries Received"
          value={inquiriesCount}
          trend={inquiriesCount > 0 ? 'up' : 'neutral'}
          trendValue={inquiriesCount > 0 ? `${inquiriesCount} total` : 'None yet'}
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
                <p className="text-sm text-muted-foreground">{totalListings} listings</p>
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
                <p className="text-sm text-muted-foreground">{inquiriesCount} received</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

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
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-card-foreground">
                        {property.title}
                      </p>
                      {getStatusBadge(property.verificationStatus)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {property.location.city}, {property.location.state} • ₹
                      {property.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {propertyInquiryCounts[property.id] || 0} inquiries
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProperty(property)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/properties/${property.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
      </div>
      <PlatformChatbot />
    </>
  );
};

export default SellerDashboard;
