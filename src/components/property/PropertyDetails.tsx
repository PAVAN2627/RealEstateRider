/**
 * PropertyDetails Component
 * 
 * Displays comprehensive property information including title, description,
 * price, type, location, images (via PropertyGallery), map (via PropertyMap),
 * agent/seller contact information, and inquiry form for buyers.
 * 
 * Requirements: 7.1, 7.6, 7.7
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Calendar,
  User,
  Phone,
  Mail,
  CheckCircle,
  Building2,
  Ruler
} from 'lucide-react';
import { Property } from '../../types/property.types';
import { User as UserType, AgentProfile } from '../../types/user.types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import PropertyGallery from './PropertyGallery';
import PropertyMap from './PropertyMap';
import WishlistButton from '../wishlist/WishlistButton';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user.types';
import { getUserById } from '../../services/userService';
import { getAgentProfile } from '../../services/agentProfileService';
import InquiryForm from '../inquiry/InquiryForm';

interface PropertyDetailsProps {
  property: Property;
  onWishlistToggle?: (propertyId: string) => void;
  isWishlisted?: boolean;
}

/**
 * PropertyDetails Component
 * 
 * Features:
 * - Property header with title, price, type, status badges
 * - PropertyGallery integration for image display
 * - Property description and details
 * - PropertyMap integration for location display
 * - Owner/agent information section with contact details
 * - Inquiry form section (stub for now)
 * - Wishlist button for buyers
 * - Responsive layout (single column mobile, two column desktop)
 * - Verification status badge display
 * 
 * Requirements:
 * - 7.1: Display all property details including title, description, price, type, images, and location
 * - 7.6: Display the Agent or Seller contact information for the Property
 * - 7.7: Display an inquiry submission form on the property details page
 */
export default function PropertyDetails({
  property,
  onWishlistToggle,
  isWishlisted = false,
}: PropertyDetailsProps) {
  const { user } = useAuth();
  const [owner, setOwner] = useState<UserType | null>(null);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(true);

  // Fetch owner/agent information
  useEffect(() => {
    const fetchOwnerInfo = async () => {
      try {
        setLoadingOwner(true);
        
        // Fetch owner user information
        const ownerData = await getUserById(property.ownerId);
        setOwner(ownerData);

        // If owner is an agent, fetch agent profile
        if (property.ownerRole === 'agent' && property.agentId) {
          const agentData = await getAgentProfile(property.ownerId);
          setAgentProfile(agentData);
        }
      } catch (error) {
        console.error('Error fetching owner information:', error);
      } finally {
        setLoadingOwner(false);
      }
    };

    fetchOwnerInfo();
  }, [property.ownerId, property.ownerRole, property.agentId]);

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
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getVerificationBadge = () => {
    switch (property.verificationStatus) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        );
      case 'pending':
        return <Badge variant="secondary">Pending Verification</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getAvailabilityBadge = () => {
    switch (property.availabilityStatus) {
      case 'available':
        return <Badge variant="default" className="bg-blue-500">Available</Badge>;
      case 'sold':
        return <Badge variant="secondary">Sold</Badge>;
      case 'under_offer':
        return <Badge variant="outline">Under Offer</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Property Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {getVerificationBadge()}
              {getAvailabilityBadge()}
              <Badge variant="outline" className="capitalize">
                <Home className="h-3 w-3 mr-1" />
                {property.propertyType}
              </Badge>
              {property.configuration && property.configuration !== 'N/A' && (
                <Badge variant="secondary">
                  {property.configuration}
                </Badge>
              )}
              {/* Owner Role Badge */}
              <Badge variant="outline" className="border-primary/50">
                {property.ownerRole === 'agent' ? '🏢 Listed by Agent' : '👤 Listed by Seller'}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold">{property.title}</h1>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{property.location.address}, {property.location.city}, {property.location.state}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="text-3xl font-bold text-primary">
                {formatPrice(property.price)}
              </div>
            </div>
            
            {user?.role === UserRole.BUYER && (
              <WishlistButton
                propertyId={property.id}
                isWishlisted={isWishlisted}
                onToggle={onWishlistToggle}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid - Two Column on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Gallery */}
          <PropertyGallery 
            imageUrls={property.imageUrls} 
            propertyTitle={property.title}
          />

          {/* Property Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {property.description}
              </p>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Property Type</div>
                    <div className="font-medium capitalize">{property.propertyType}</div>
                  </div>
                </div>

                {property.configuration && property.configuration !== 'N/A' && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Ruler className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Configuration</div>
                      <div className="font-medium">{property.configuration}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Price</div>
                    <div className="font-medium">{formatPrice(property.price)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Listed On</div>
                    <div className="font-medium">{formatDate(property.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="font-medium capitalize">
                      {property.availabilityStatus.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Map */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Location</h2>
            <PropertyMap 
              location={property.location} 
              propertyTitle={property.title}
            />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Owner/Agent Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {property.ownerRole === 'agent' ? 'Agent Information' : 'Seller Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOwner ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Agent Profile Photo (if agent) */}
                  {agentProfile?.profilePhotoUrl && (
                    <div className="flex justify-center">
                      <img
                        src={agentProfile.profilePhotoUrl}
                        alt={agentProfile.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                      />
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Name</div>
                    <div className="font-medium flex items-center gap-2">
                      {agentProfile?.name || owner?.profile.name || 'N/A'}
                      {agentProfile?.verified && (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Agent
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Phone */}
                  {(agentProfile?.phone || owner?.profile.phone) && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">
                          {agentProfile?.phone || owner?.profile.phone}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {(agentProfile?.email || owner?.email) && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium break-all">
                          {agentProfile?.email || owner?.email}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agent-specific information */}
                  {agentProfile && (
                    <>
                      <Separator />
                      
                      {agentProfile.experience && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Experience</div>
                          <div className="font-medium">{agentProfile.experience}</div>
                        </div>
                      )}

                      {agentProfile.specialization && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Specialization</div>
                          <div className="font-medium">{agentProfile.specialization}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inquiry Form Section */}
          {user?.role === UserRole.BUYER && property.availabilityStatus === 'available' && (
            <Card>
              <CardHeader>
                <CardTitle>Interested in this property?</CardTitle>
              </CardHeader>
              <CardContent>
                <InquiryForm 
                  propertyId={property.id}
                  agentId={property.ownerRole === 'agent' ? property.ownerId : property.agentId || property.ownerId}
                />
              </CardContent>
            </Card>
          )}

          {/* Property Documents Section - Visible to Buyers and Admins */}
          {(user?.role === UserRole.BUYER || user?.role === UserRole.ADMIN) && 
           property.ownershipDocumentUrls && 
           property.ownershipDocumentUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Property Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Ownership and verification documents
                  </p>
                  {property.ownershipDocumentUrls.map((docUrl, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Document {index + 1}</div>
                          <div className="text-xs text-muted-foreground">Property ownership document</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open document in new tab
                          const link = document.createElement('a');
                          link.href = docUrl;
                          link.download = `property-document-${index + 1}`;
                          link.target = '_blank';
                          link.click();
                        }}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
