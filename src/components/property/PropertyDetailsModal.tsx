/**
 * PropertyDetailsModal Component
 * 
 * Displays property details in a modal/dialog popup
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Home, Calendar, MessageSquare, User, Mail, Phone, FileText, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Property } from '../../types/property.types';
import { UserRole } from '../../types/user.types';
import { User as UserType } from '../../types/user.types';
import PropertyGallery from './PropertyGallery';
import InquiryForm from '../inquiry/InquiryForm';
import { useAuth } from '../../context/AuthContext';
import { getUserById } from '../../services/userService';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Separator } from '../ui/separator';

interface PropertyDetailsModalProps {
  property: Property | null;
  open: boolean;
  onClose: () => void;
}

export default function PropertyDetailsModal({
  property,
  open,
  onClose,
}: PropertyDetailsModalProps) {
  const { user } = useAuth();
  const [owner, setOwner] = useState<UserType | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [showIdProof, setShowIdProof] = useState(false);
  
  // Fetch owner information when modal opens
  useEffect(() => {
    const fetchOwner = async () => {
      if (!property || !open) return;
      
      setLoadingOwner(true);
      try {
        const ownerData = await getUserById(property.ownerId);
        setOwner(ownerData);
      } catch (error) {
        console.error('Error fetching owner:', error);
        setOwner(null);
      } finally {
        setLoadingOwner(false);
      }
    };

    fetchOwner();
  }, [property, open]);
  
  if (!property) return null;
  
  // Check if current user is a buyer (can send inquiries)
  const isBuyer = user?.role === UserRole.BUYER;
  
  // Check if user is admin
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Check if user is the owner of this property
  const isOwner = user?.uid === property.ownerId;
  
  // Show owner details to buyers and admins
  const showOwnerDetails = (isBuyer || isAdmin) && !isOwner;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getVerificationBadge = () => {
    switch (property.verificationStatus) {
      case 'approved':
        return <Badge className="bg-green-500">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getAvailabilityBadge = () => {
    switch (property.availabilityStatus) {
      case 'available':
        return <Badge variant="default">Available</Badge>;
      case 'sold':
        return <Badge variant="secondary">Sold</Badge>;
      case 'under_offer':
        return <Badge variant="outline">Under Offer</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          {property.imageUrls && property.imageUrls.length > 0 && (
            <PropertyGallery
              imageUrls={property.imageUrls}
              propertyTitle={property.title}
            />
          )}

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {getVerificationBadge()}
            {getAvailabilityBadge()}
            {/* Owner Role Badge */}
            <Badge variant="outline" className="border-primary/50">
              {property.ownerRole === 'agent' ? '🏢 Listed by Agent' : '👤 Listed by Seller'}
            </Badge>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(property.price)}
            </span>
          </div>

          {/* Property Type and Configuration */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Home className="h-5 w-5" />
            <span className="capitalize">{property.propertyType}</span>
            {property.configuration && property.configuration !== 'N/A' && (
              <>
                <span>•</span>
                <Badge variant="secondary">
                  {property.configuration}
                </Badge>
              </>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span>
              {property.location.address}, {property.location.city},{' '}
              {property.location.state}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {property.description}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium text-foreground">Listed On</p>
                <p>{formatDate(property.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium text-foreground">Last Updated</p>
                <p>{formatDate(property.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          {property.verificationStatus === 'rejected' && property.rejectedReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Rejection Reason
              </h3>
              <p className="text-sm text-red-700">{property.rejectedReason}</p>
            </div>
          )}

          {/* Agent/Seller Details - Show to Buyers and Admins */}
          {showOwnerDetails && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {property.ownerRole === 'agent' ? 'Agent' : 'Seller'} Details
                </h3>
              </div>
              
              {loadingOwner ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : owner ? (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  {/* Name */}
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{owner.profile?.name || 'Not provided'}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium break-all">{owner.email}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Phone */}
                  {owner.profile?.phone && (
                    <>
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{owner.profile.phone}</p>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* ID Proof */}
                  {owner.aadharDocumentUrl && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Identity Verification</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setShowIdProof(true)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View ID Proof
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Owner information not available</p>
              )}
            </div>
          )}

          {/* Contact Seller/Agent Section - Only for Buyers */}
          {isBuyer && !isOwner && property.verificationStatus === 'approved' && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  Contact {property.ownerRole === 'agent' ? 'Agent' : 'Seller'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Interested in this property? Send a message to the {property.ownerRole} to inquire about details, schedule a viewing, or make an offer.
              </p>
              <InquiryForm
                propertyId={property.id}
                agentId={property.ownerId}
                onSuccess={() => {
                  // Optional: Could close modal or show additional success message
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>

      {/* ID Proof Modal */}
      {showIdProof && owner?.aadharDocumentUrl && (
        <Dialog open={showIdProof} onOpenChange={setShowIdProof}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Identity Verification Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Owner:</strong> {owner.profile?.name || owner.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Role:</strong> {property.ownerRole === 'agent' ? 'Agent' : 'Seller'}
                </p>
              </div>
              
              {owner.aadharDocumentUrl.startsWith('data:application/pdf') ? (
                <div className="border rounded-lg p-8 text-center bg-muted/30">
                  <FileText className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">PDF Document</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click below to download and view the document
                  </p>
                  <Button
                    size="lg"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = owner.aadharDocumentUrl!;
                      link.download = `id-proof-${owner.uid}.pdf`;
                      link.click();
                    }}
                  >
                    Download PDF
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden bg-black/5">
                  <img
                    src={owner.aadharDocumentUrl}
                    alt="ID Proof - Aadhar Document"
                    className="w-full h-auto max-h-[70vh] object-contain"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowIdProof(false)}
                >
                  Close
                </Button>
                {!owner.aadharDocumentUrl.startsWith('data:application/pdf') && (
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = owner.aadharDocumentUrl!;
                      link.download = `id-proof-${owner.uid}.jpg`;
                      link.target = '_blank';
                      link.click();
                    }}
                  >
                    Open in New Tab
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
