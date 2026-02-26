/**
 * PropertyCard Component
 * 
 * Displays property information in a card format with thumbnail,
 * title, price, type, location, wishlist button, and verification status.
 * 
 * Requirements: 6.1, 8.6, 19.1, 19.7
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, DollarSign, Navigation } from 'lucide-react';
import { Property } from '../../types/property.types';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import WishlistButton from '../wishlist/WishlistButton';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user.types';
import { calculateDistance } from '../../hooks/useUserLocation';
import PropertyDetailsModal from './PropertyDetailsModal';

interface PropertyCardProps {
  property: Property;
  onWishlistToggle?: (propertyId: string) => void;
  isWishlisted?: boolean;
  showActions?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
}

/**
 * PropertyCard Component
 * 
 * Displays property thumbnail, title, price, type, location, and wishlist button.
 * Implements responsive card layout.
 * 
 * Requirements:
 * - 6.1: Display all approved properties to authenticated buyers
 * - 8.6: Display wishlist status on property cards
 * - 19.1: Render all pages with mobile-first responsive design
 * - 19.7: Ensure all images scale proportionally without distortion
 */
export default function PropertyCard({
  property,
  onWishlistToggle,
  isWishlisted = false,
  showActions = true,
  userLocation,
}: PropertyCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate distance if user location and property coordinates are available
  const getDistance = (): string | null => {
    if (!userLocation || !property.location.coordinates) {
      return null;
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      property.location.coordinates.lat,
      property.location.coordinates.lng
    );

    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance} km away`;
  };

  const distance = getDistance();

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getVerificationBadge = () => {
    switch (property.verificationStatus) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Verified</Badge>;
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
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative" onClick={handleCardClick}>
          {/* Property Image */}
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            {property.imageUrls && property.imageUrls.length > 0 ? (
              <img
                src={property.imageUrls[0]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
            {getVerificationBadge()}
            {getAvailabilityBadge()}
            {/* Owner Role Badge */}
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {property.ownerRole === 'agent' ? '🏢 Agent' : '👤 Seller'}
            </Badge>
          </div>

          {/* Wishlist Button */}
          {showActions && user?.role === UserRole.BUYER && (
            <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
              <WishlistButton
                propertyId={property.id}
                isWishlisted={isWishlisted}
                onToggle={onWishlistToggle}
              />
            </div>
          )}
        </div>

        <CardContent className="p-4" onClick={handleCardClick}>
          {/* Property Type and Configuration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Home className="h-4 w-4" />
            <span className="capitalize">{property.propertyType}</span>
            {property.configuration && property.configuration !== 'N/A' && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">
                  {property.configuration}
                </Badge>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.location.city}, {property.location.state}
            </span>
          </div>

          {/* Distance from user */}
          {distance && (
            <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
              <Navigation className="h-4 w-4 flex-shrink-0" />
              <span>{distance} from you</span>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {property.description}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 border-t" onClick={handleCardClick}>
          {/* Price */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xl font-bold text-primary">
              {formatPrice(property.price)}
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={property}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
