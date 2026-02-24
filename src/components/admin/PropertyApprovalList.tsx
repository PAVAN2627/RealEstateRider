/**
 * PropertyApprovalList Component
 * 
 * Displays list of pending properties with details, images, and documents.
 * Shows property images in a gallery/carousel and ownership documents.
 * Provides approve and reject buttons with reason input for rejection.
 * 
 * Requirements: 5.2, 5.3, 5.4, 5.5, 13.5
 */

import React, { useState, useEffect } from 'react';
import { Property } from '../../types/property.types';
import { getProperties, approveProperty, rejectProperty } from '../../services/propertyService';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar, 
  MapPin, 
  DollarSign,
  Home,
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../context/AuthContext';

export default function PropertyApprovalList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allProperties = await getProperties();
      const pendingProperties = allProperties.filter(
        property => property.verificationStatus === 'pending'
      );
      
      pendingProperties.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      setProperties(pendingProperties);
    } catch (err) {
      console.error('Error fetching pending properties:', err);
      setError('Failed to load pending properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const handleApprove = async (property: Property) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to approve properties.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(property.id);
      await approveProperty(property.id, user.uid);
      
      toast({
        title: 'Property Approved',
        description: `${property.title} has been approved successfully.`,
      });
      
      await fetchPendingProperties();
      setApproveDialogOpen(false);
      setSelectedProperty(null);
    } catch (err) {
      console.error('Error approving property:', err);
      toast({
        title: 'Approval Failed',
        description: 'Failed to approve property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (property: Property) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to reject properties.',
        variant: 'destructive',
      });
      return;
    }

    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejecting this property.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setActionLoading(property.id);
      await rejectProperty(property.id, user.uid, rejectionReason.trim());
      
      toast({
        title: 'Property Rejected',
        description: `${property.title} has been rejected.`,
      });
      
      await fetchPendingProperties();
      setRejectDialogOpen(false);
      setSelectedProperty(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting property:', err);
      toast({
        title: 'Rejection Failed',
        description: 'Failed to reject property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openApproveDialog = (property: Property) => {
    setSelectedProperty(property);
    setApproveDialogOpen(true);
  };

  const openRejectDialog = (property: Property) => {
    setSelectedProperty(property);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const openImagesDialog = (property: Property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    setImagesDialogOpen(true);
  };

  const openDocumentsDialog = (property: Property) => {
    setSelectedProperty(property);
    setDocumentsDialogOpen(true);
  };

  const openDetailsDialog = (property: Property) => {
    setSelectedProperty(property);
    setDetailsDialogOpen(true);
  };

  const previousImage = () => {
    if (selectedProperty && selectedProperty.imageUrls.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProperty.imageUrls.length - 1 : prev - 1
      );
    }
  };

  const nextImage = () => {
    if (selectedProperty && selectedProperty.imageUrls.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === selectedProperty.imageUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeBadgeVariant = (type: string): 'default' | 'secondary' | 'outline' => {
    switch (type) {
      case 'residential':
        return 'default';
      case 'commercial':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading pending properties..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Properties"
        message={error}
        onRetry={fetchPendingProperties}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Property Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve pending property listings
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {properties.length} Pending
        </Badge>
      </div>

      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Home className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Pending Properties</h3>
          <p className="text-muted-foreground max-w-md">
            All property listings have been reviewed. New listings will appear here.
          </p>
        </div>
      )}

      {properties.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getPropertyTypeBadgeVariant(property.propertyType)}>
                      {property.propertyType.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {property.availabilityStatus.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {property.imageUrls.length > 0 && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={property.imageUrls[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-lg font-bold text-primary">
                    <span>{formatPrice(property.price)}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {property.location.address}, {property.location.city}, {property.location.state}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Listed: {formatDate(property.createdAt)}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {property.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDetailsDialog(property)}
                  >
                    View Details
                  </Button>
                  
                  {property.imageUrls.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openImagesDialog(property)}
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      {property.imageUrls.length}
                    </Button>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => openApproveDialog(property)}
                    disabled={actionLoading === property.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => openRejectDialog(property)}
                    disabled={actionLoading === property.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve "{selectedProperty?.title}"? 
              This will make the property visible to all buyers on the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProperty && handleApprove(selectedProperty)}
              disabled={!!actionLoading}
            >
              {actionLoading ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Property</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting "{selectedProperty?.title}". 
              The property owner will be notified with this reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionReason('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProperty && handleReject(selectedProperty)}
              disabled={!!actionLoading || !rejectionReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={imagesDialogOpen} onOpenChange={setImagesDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Property Images - {selectedProperty?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProperty && selectedProperty.imageUrls.length > 0 && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedProperty.imageUrls[currentImageIndex]}
                  alt={`Property image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                
                {selectedProperty.imageUrls.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={previousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {selectedProperty.imageUrls.length}
                    </div>
                  </>
                )}
              </div>
              
              {selectedProperty.imageUrls.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {selectedProperty.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-muted-foreground'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Ownership Documents - {selectedProperty?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedProperty?.ownershipDocumentUrls && selectedProperty.ownershipDocumentUrls.length > 0 ? (
              selectedProperty.ownershipDocumentUrls.map((url, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Document {index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                  
                  {url.toLowerCase().endsWith('.pdf') ? (
                    <div className="w-full h-[600px] border rounded">
                      <iframe
                        src={url}
                        className="w-full h-full"
                        title={`Document ${index + 1}`}
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <img
                        src={url}
                        alt={`Document ${index + 1}`}
                        className="w-full h-auto rounded border"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No ownership documents uploaded
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Property Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-6">
              {/* Property Image */}
              {selectedProperty.imageUrls.length > 0 && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedProperty.imageUrls[0]}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title and Price */}
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedProperty.title}</h3>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(selectedProperty.price)}
                </div>
              </div>

              {/* Property Type and Status */}
              <div className="flex gap-2">
                <Badge variant={getPropertyTypeBadgeVariant(selectedProperty.propertyType)}>
                  {selectedProperty.propertyType.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {selectedProperty.availabilityStatus.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedProperty.description}
                </p>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-semibold mb-2">Location</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Address:</span> {selectedProperty.location.address}</p>
                  <p><span className="font-medium">City:</span> {selectedProperty.location.city}</p>
                  <p><span className="font-medium">State:</span> {selectedProperty.location.state}</p>
                  {selectedProperty.location.coordinates && (
                    <p>
                      <span className="font-medium">Coordinates:</span>{' '}
                      {selectedProperty.location.coordinates.lat}, {selectedProperty.location.coordinates.lng}
                    </p>
                  )}
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h4 className="font-semibold mb-2">Owner Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Owner ID:</span> {selectedProperty.ownerId}</p>
                  <p><span className="font-medium">Owner Role:</span> {selectedProperty.ownerRole.toUpperCase()}</p>
                  {selectedProperty.agentId && (
                    <p><span className="font-medium">Agent ID:</span> {selectedProperty.agentId}</p>
                  )}
                </div>
              </div>

              {/* Listing Information */}
              <div>
                <h4 className="font-semibold mb-2">Listing Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Listed On:</span> {formatDate(selectedProperty.createdAt)}</p>
                  <p><span className="font-medium">Last Updated:</span> {formatDate(selectedProperty.updatedAt)}</p>
                  <p><span className="font-medium">Verification Status:</span> {selectedProperty.verificationStatus.toUpperCase()}</p>
                </div>
              </div>

              {/* Images Count */}
              {selectedProperty.imageUrls.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Images</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedProperty.imageUrls.length} image(s) uploaded
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      openImagesDialog(selectedProperty);
                    }}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    View All Images
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    openApproveDialog(selectedProperty);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Property
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    openRejectDialog(selectedProperty);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Property
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
