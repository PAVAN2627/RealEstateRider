import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, 
  UserCheck,
  CheckSquare,
  Users,
  Building2,
  Activity,
  Home,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Ban
} from 'lucide-react';
import { UserRole } from '@/types/user.types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Property } from '@/types/property.types';
import * as propertyService from '@/services/propertyService';
import PropertyDetailsModal from '@/components/property/PropertyDetailsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

/**
 * AllPropertiesPage Component
 * 
 * Admin page to view all properties (approved, pending, rejected)
 */
const AllPropertiesPage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [actionProperty, setActionProperty] = useState<Property | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const allProperties = await propertyService.getProperties();
      setProperties(allProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSidebarLinks = () => {
    return [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/approvals/users', label: 'User Approvals', icon: UserCheck },
      { to: '/admin/approvals/properties', label: 'Property Approvals', icon: CheckSquare },
      { to: '/admin/users', label: 'Manage Users', icon: Users },
      { to: '/admin/properties', label: 'All Properties', icon: Building2 },
      { to: '/admin/activity', label: 'Activity Logs', icon: Activity },
    ];
  };

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const handleApprove = async (property: Property) => {
    setActionProperty(property);
    setActionType('approve');
  };

  const handleReject = async (property: Property) => {
    setActionProperty(property);
    setActionType('reject');
    setRejectionReason('');
  };

  const handleSuspend = async (property: Property) => {
    setActionProperty(property);
    setActionType('suspend');
    setRejectionReason('');
  };

  const confirmAction = async () => {
    if (!actionProperty || !actionType) return;

    try {
      if (actionType === 'approve') {
        await propertyService.approveProperty(actionProperty.id!);
        toast.success('Property approved successfully');
      } else if (actionType === 'reject') {
        if (!rejectionReason.trim()) {
          toast.error('Please provide a reason for rejection');
          return;
        }
        await propertyService.rejectProperty(actionProperty.id!, rejectionReason);
        toast.success('Property rejected');
      } else if (actionType === 'suspend') {
        if (!rejectionReason.trim()) {
          toast.error('Please provide a reason for suspension');
          return;
        }
        await propertyService.rejectProperty(actionProperty.id!, rejectionReason);
        toast.success('Property suspended');
      }

      // Refresh properties list
      await fetchProperties();
      
      // Close dialog
      setActionProperty(null);
      setActionType(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error updating property status:', error);
      toast.error('Failed to update property status');
    }
  };

  const cancelAction = () => {
    setActionProperty(null);
    setActionType(null);
    setRejectionReason('');
  };

  // Filter properties based on search and tab
  const filteredProperties = properties.filter((property) => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = 
      activeTab === 'all' ||
      property.verificationStatus === activeTab;

    return matchesSearch && matchesTab;
  });

  const approvedCount = properties.filter(p => p.verificationStatus === 'approved').length;
  const pendingCount = properties.filter(p => p.verificationStatus === 'pending').length;
  const rejectedCount = properties.filter(p => p.verificationStatus === 'rejected').length;

  if (loading) {
    return (
      <DashboardLayout links={getSidebarLinks()} title="All Properties">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout links={getSidebarLinks()} title="All Properties">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">All Properties</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all properties in the system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-bold">{properties.length}</p>
                </div>
                <Home className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-500">{approvedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-500">{rejectedCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Properties List with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({properties.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No properties found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProperties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Property Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {property.imageUrls && property.imageUrls.length > 0 ? (
                              <img
                                src={property.imageUrls[0]}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Home className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Property Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{property.title}</h3>
                              {getStatusBadge(property.verificationStatus)}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {property.location.city}, {property.location.state}
                            </p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              {formatPrice(property.price)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProperty(property)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>

                          {/* Show Approve button for rejected/suspended properties */}
                          {property.verificationStatus === 'rejected' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(property)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          )}

                          {/* Show Reject/Suspend buttons for approved properties */}
                          {property.verificationStatus === 'approved' && (
                            <>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(property)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSuspend(property)}
                                className="border-orange-500 text-orange-500 hover:bg-orange-50"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend
                              </Button>
                            </>
                          )}

                          {/* Show Approve/Reject for pending properties */}
                          {property.verificationStatus === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(property)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(property)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        open={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionProperty} onOpenChange={(open) => !open && cancelAction()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' && 'Approve Property'}
              {actionType === 'reject' && 'Reject Property'}
              {actionType === 'suspend' && 'Suspend Property'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' && (
                <>Are you sure you want to approve this property? The owner will be notified via email.</>
              )}
              {actionType === 'reject' && (
                <>
                  <p className="mb-3">Are you sure you want to reject this property? The owner will be notified via email.</p>
                  <Textarea
                    placeholder="Reason for rejection (required)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </>
              )}
              {actionType === 'suspend' && (
                <>
                  <p className="mb-3">Are you sure you want to suspend this property? It will be hidden from public view.</p>
                  <Textarea
                    placeholder="Reason for suspension (required)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {actionType === 'approve' && 'Approve'}
              {actionType === 'reject' && 'Reject'}
              {actionType === 'suspend' && 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AllPropertiesPage;
