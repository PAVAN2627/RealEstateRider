/**
 * PropertyForm Component
 * 
 * Form component for creating and editing property listings.
 * Supports image uploads, location data, and ownership documents.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 11.2
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import ImageUpload from '../shared/ImageUpload';
import ErrorMessage from '../shared/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { Property, PropertyType, AvailabilityStatus, PropertyConfiguration } from '../../types/property.types';
import { createProperty, updateProperty } from '../../services/propertyService';
import { uploadPropertyImage } from '../../services/storageService';

/**
 * PropertyForm props
 */
interface PropertyFormProps {
  property?: Property;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  showHeader?: boolean;
}

/**
 * Form data interface
 */
interface FormData {
  title: string;
  description: string;
  price: string;
  propertyType: PropertyType | '';
  configuration: PropertyConfiguration | '';
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  availabilityStatus: AvailabilityStatus;
}

/**
 * Form validation errors
 */
interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  propertyType?: string;
  configuration?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  images?: string;
  coordinates?: string;
}

/**
 * PropertyForm Component
 * 
 * Provides form for creating and editing property listings with:
 * - All required property fields
 * - Image upload integration (max 10 images)
 * - Location data with optional coordinates
 * - Ownership document upload
 * - Form validation
 * - Loading states and error handling
 * 
 * Requirements:
 * - 4.1: Create property with all required fields
 * - 4.2: Validate all property fields are non-empty
 * - 4.3: Validate image file type and size
 * - 4.4: Allow up to 10 images per property
 * - 4.6: Support ownership document upload
 * - 11.2: Update existing properties
 */
export default function PropertyForm({ property, onSuccess, onCancel, mode, showHeader = true }: PropertyFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = mode === 'edit' || !!property;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price?.toString() || '',
    propertyType: property?.propertyType || '',
    configuration: property?.configuration || '',
    address: property?.location.address || '',
    city: property?.location.city || '',
    state: property?.location.state || '',
    pincode: property?.location.pincode || '',
    latitude: property?.location.coordinates?.lat.toString() || '',
    longitude: property?.location.coordinates?.lng.toString() || '',
    availabilityStatus: property?.availabilityStatus || AvailabilityStatus.AVAILABLE,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(property?.imageUrls || []);
  const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  /**
   * Geocode address to get coordinates
   */
  const geocodeAddress = async () => {
    const address = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.pincode}, India`;
    
    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      setLocationError('Please enter address, city, state, and pincode first');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results[0]) {
        const location = data.results[0].geometry.location;
        setFormData(prev => ({
          ...prev,
          latitude: location.lat.toFixed(6),
          longitude: location.lng.toFixed(6),
        }));
        setMapCenter({ lat: location.lat, lng: location.lng });
        setShowMap(true);
        setLocationLoading(false);
        setErrors(prev => ({ ...prev, coordinates: undefined }));
      } else {
        setLocationError(`Could not find coordinates for this address. Status: ${data.status}`);
        setLocationLoading(false);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationError('Failed to get coordinates. Please try again.');
      setLocationLoading(false);
    }
  };

  /**
   * Handle map click to pick coordinates
   */
  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
    setMapCenter({ lat, lng });
  };

  /**
   * Validate form data
   * 
   * @returns boolean - True if form is valid
   * 
   * Requirement 4.2: Validate all property fields are non-empty
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be greater than 0';
      }
    }

    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required';
    }

    if (!formData.configuration) {
      newErrors.configuration = 'Property configuration is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    // Pincode validation (required)
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else {
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(formData.pincode.trim())) {
        newErrors.pincode = 'Invalid pincode format (must be 6 digits)';
      }
    }

    // Image validation (max 10 images)
    const totalImages = existingImages.length + imageFiles.length;
    if (!isEditMode && totalImages === 0) {
      newErrors.images = 'At least one image is required';
    }
    if (totalImages > 10) {
      newErrors.images = 'Maximum 10 images allowed';
    }

    // Coordinates validation (mandatory)
    if (!formData.latitude.trim()) {
      newErrors.coordinates = 'Latitude is required';
    } else if (!formData.longitude.trim()) {
      newErrors.coordinates = 'Longitude is required';
    } else {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      if (isNaN(lat) || isNaN(lng)) {
        newErrors.coordinates = 'Invalid coordinates format';
      } else if (lat < -90 || lat > 90) {
        newErrors.coordinates = 'Latitude must be between -90 and 90';
      } else if (lng < -180 || lng > 180) {
        newErrors.coordinates = 'Longitude must be between -180 and 180';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handle select change
   */
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Handle image files selected
   */
  const handleImageFilesSelected = (files: File[]) => {
    setImageFiles(files);
    setErrors(prev => ({ ...prev, images: undefined }));
  };

  /**
   * Handle remove selected image file
   */
  const handleRemoveSelectedImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle remove existing image
   */
  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(url => url !== imageUrl));
  };

  /**
   * Handle ownership document upload
   */
  const handleOwnershipDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOwnershipDocument(e.target.files[0]);
    }
  };

  /**
   * Handle form submission
   * 
   * Requirements:
   * - 4.1: Create property with all required fields
   * - 4.3: Store images in Firestore as base64
   * - 11.2: Update existing property
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setError('You must be logged in to create a property');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Convert new image files to compressed base64 data URLs using storageService
      const base64Images: string[] = [];
      for (const file of imageFiles) {
        try {
          // Use uploadPropertyImage which compresses images before converting to Base64
          const compressedBase64 = await uploadPropertyImage(file, user.uid);
          base64Images.push(compressedBase64);
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          setError(`Failed to upload image: ${uploadError.message}`);
          setSubmitting(false);
          return;
        }
      }

      // Combine existing and new image URLs
      const allImageUrls = [...existingImages, ...base64Images];

      // Handle ownership document upload
      let ownershipDocumentUrls: string[] = property?.ownershipDocumentUrls || [];
      if (ownershipDocument) {
        try {
          const documentBase64 = await uploadPropertyImage(ownershipDocument, user.uid);
          ownershipDocumentUrls = [...ownershipDocumentUrls, documentBase64];
        } catch (uploadError: any) {
          console.error('Error uploading document:', uploadError);
          setError(`Failed to upload document: ${uploadError.message}`);
          setSubmitting(false);
          return;
        }
      }

      // Prepare location data
      const location: {
        address: string;
        city: string;
        state: string;
        pincode: string;
        coordinates?: { lat: number; lng: number };
      } = {
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };

      // Add coordinates (now mandatory)
      location.coordinates = {
        lat: parseFloat(formData.latitude),
        lng: parseFloat(formData.longitude),
      };

      if (isEditMode && property) {
        // Update existing property
        const updateData: any = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          propertyType: formData.propertyType as PropertyType,
          configuration: formData.configuration as PropertyConfiguration,
          location,
          availabilityStatus: formData.availabilityStatus,
          imageUrls: allImageUrls,
          ownershipDocumentUrls,
        };
        
        await updateProperty(property.id, updateData, user.uid);
      } else {
        // Create new property with images and documents
        const propertyData: any = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          propertyType: formData.propertyType as PropertyType,
          configuration: formData.configuration as PropertyConfiguration,
          location,
          availabilityStatus: formData.availabilityStatus,
          imageUrls: allImageUrls,
          ownershipDocumentUrls,
          ownerId: user.uid,
          ownerRole: user.role === 'agent' ? 'agent' : 'seller',
        };

        // Only add agentId if user is an agent
        if (user.role === 'agent') {
          propertyData.agentId = user.uid;
        }

        await createProperty(propertyData);
      }

      setSuccess(true);
      
      // Call success callback or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting property:', err);
      setError(err instanceof Error ? err.message : 'Failed to save property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showHeader && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {isEditMode ? 'Edit Property' : 'Create New Property'}
          </h2>
          <p className="text-muted-foreground">
            {isEditMode
              ? 'Update your property listing details'
              : 'Fill in the details to list your property'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          Property {isEditMode ? 'updated' : 'created'} successfully!
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Property Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Spacious 3BHK Apartment in Downtown"
            disabled={submitting}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your property in detail..."
            rows={5}
            disabled={submitting}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Price and Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Price (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="e.g., 5000000"
              disabled={submitting}
              min="0"
              step="1000"
            />
            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="propertyType">
              Property Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.propertyType}
              onValueChange={(value) => handleSelectChange('propertyType', value)}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PropertyType.RESIDENTIAL}>Residential</SelectItem>
                <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
                <SelectItem value={PropertyType.LAND}>Land</SelectItem>
                <SelectItem value={PropertyType.APARTMENT}>Apartment</SelectItem>
              </SelectContent>
            </Select>
            {errors.propertyType && (
              <p className="text-sm text-red-500">{errors.propertyType}</p>
            )}
          </div>
        </div>

        {/* Configuration (BHK Type) */}
        <div className="space-y-2">
          <Label htmlFor="configuration">
            Property Configuration <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.configuration}
            onValueChange={(value) => handleSelectChange('configuration', value)}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select configuration (e.g., 1BHK, 2BHK)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PropertyConfiguration.ONE_RK}>1RK</SelectItem>
              <SelectItem value={PropertyConfiguration.ONE_BHK}>1BHK</SelectItem>
              <SelectItem value={PropertyConfiguration.TWO_BHK}>2BHK</SelectItem>
              <SelectItem value={PropertyConfiguration.THREE_BHK}>3BHK</SelectItem>
              <SelectItem value={PropertyConfiguration.FOUR_BHK}>4BHK</SelectItem>
              <SelectItem value={PropertyConfiguration.FIVE_PLUS_BHK}>5+BHK</SelectItem>
              <SelectItem value={PropertyConfiguration.STUDIO}>Studio</SelectItem>
              <SelectItem value={PropertyConfiguration.PENTHOUSE}>Penthouse</SelectItem>
              <SelectItem value={PropertyConfiguration.VILLA}>Villa</SelectItem>
              <SelectItem value={PropertyConfiguration.NOT_APPLICABLE}>N/A</SelectItem>
            </SelectContent>
          </Select>
          {errors.configuration && (
            <p className="text-sm text-red-500">{errors.configuration}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Select the property configuration. Choose "N/A" if not applicable (e.g., for land or commercial properties)
          </p>
        </div>

        {/* Availability Status */}
        {isEditMode && (
          <div className="space-y-2">
            <Label htmlFor="availabilityStatus">Availability Status</Label>
            <Select
              value={formData.availabilityStatus}
              onValueChange={(value) =>
                handleSelectChange('availabilityStatus', value)
              }
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AvailabilityStatus.AVAILABLE}>Available</SelectItem>
                <SelectItem value={AvailabilityStatus.UNDER_OFFER}>
                  Under Offer
                </SelectItem>
                <SelectItem value={AvailabilityStatus.SOLD}>Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Location</h3>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="e.g., 123 Main Street"
            disabled={submitting}
          />
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>

        {/* City and State Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g., Mumbai"
              disabled={submitting}
            />
            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="e.g., Maharashtra"
              disabled={submitting}
            />
            {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <Label htmlFor="pincode">
              Pincode <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="e.g., 400001"
              disabled={submitting}
              maxLength={6}
            />
            {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
          </div>
        </div>

        {/* Coordinates (Mandatory) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              Property Location Coordinates <span className="text-red-500">*</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={geocodeAddress}
              disabled={locationLoading || submitting}
            >
              {locationLoading ? 'Getting Coordinates...' : 'Get Coordinates from Address'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter the property address, city, state, and pincode above, then click the button to automatically get coordinates for the property location. Coordinates are required.
          </p>
          {locationError && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm">
              {locationError}
            </div>
          )}
          
          {/* Interactive Map */}
          {showMap && mapCenter && (
            <div className="space-y-2">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-200 px-3 py-2">
                  <p className="text-sm text-blue-800">
                    📍 Click on the map to adjust the exact property location
                  </p>
                </div>
                <div 
                  className="relative w-full h-96 bg-gray-100"
                  style={{ cursor: 'crosshair' }}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${mapCenter.lat},${mapCenter.lng}&zoom=16`}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(false)}
                >
                  Hide Map
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lat = parseFloat(formData.latitude);
                    const lng = parseFloat(formData.longitude);
                    if (!isNaN(lat) && !isNaN(lng)) {
                      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                    }
                  }}
                >
                  Open in Google Maps
                </Button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">
                Latitude <span className="text-red-500">*</span>
              </Label>
              <Input
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                placeholder="Latitude (e.g., 19.0760)"
                disabled={submitting}
                type="number"
                step="any"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">
                Longitude <span className="text-red-500">*</span>
              </Label>
              <Input
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="Longitude (e.g., 72.8777)"
                disabled={submitting}
                type="number"
                step="any"
              />
            </div>
          </div>
          {errors.coordinates && (
            <p className="text-sm text-red-500">{errors.coordinates}</p>
          )}
          <p className="text-xs text-muted-foreground">
            You can manually adjust the coordinates by editing the values above or by clicking "Open in Google Maps" to find the exact location.
          </p>
        </div>
      </div>

      {/* Property Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Property Images <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Select up to 10 high-quality images of your property (max 5MB each). Images will be uploaded when you submit the form.
        </p>
        <ImageUpload
          onFilesSelected={handleImageFilesSelected}
          selectedFiles={imageFiles}
          maxFiles={10}
          maxSizeMB={5}
          existingImages={existingImages}
          onRemoveExisting={handleRemoveExistingImage}
          onRemoveSelected={handleRemoveSelectedImage}
        />
        {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
      </div>

      {/* Ownership Documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ownership Documents (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          Upload ownership documents for verification
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="flex-1">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleOwnershipDocumentChange}
                disabled={submitting}
              />
              {ownershipDocument && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {ownershipDocument.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={submitting} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          {submitting
            ? isEditMode
              ? 'Updating...'
              : 'Creating...'
            : isEditMode
            ? 'Update Property'
            : 'Create Property'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={submitting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
