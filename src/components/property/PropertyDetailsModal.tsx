/**
 * PropertyDetailsModal Component
 * 
 * Displays property details in a modal/dialog popup
 */

import React from 'react';
import { MapPin, Home, Calendar, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Property } from '../../types/property.types';
import { UserRole } from '../../types/user.types';
import PropertyGallery from './PropertyGallery';
import InquiryForm from '../inquiry/InquiryForm';
import { useAuth } from '../../context/AuthContext';

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
  
  if (!property) return null;
  
  // Check if current user is a buyer (can send inquiries)
  const isBuyer = user?.role === UserRole.BUYER;
  
  // Check if user is the owner of this property
  const isOwner = user?.uid === property.ownerId;

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
          <div className="flex gap-2">
            {getVerificationBadge()}
            {getAvailabilityBadge()}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(property.price)}
            </span>
          </div>

          {/* Property Type */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Home className="h-5 w-5" />
            <span className="capitalize">{property.propertyType}</span>
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
    </Dialog>
  );
}
