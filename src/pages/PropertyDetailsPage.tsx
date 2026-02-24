import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PropertyDetails } from '@/components/property/PropertyDetails';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Property } from '@/types/property.types';
import * as propertyService from '@/services/propertyService';

/**
 * PropertyDetailsPage Component
 * 
 * Displays detailed information about a specific property.
 * Fetches property by ID from route params.
 * 
 * Requirements:
 * - 7.1: Display all property details
 * - 21.5: Handle property not found error
 */

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const propertyData = await propertyService.getProperty(id);
        setProperty(propertyData);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Property not found or failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/properties')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
        <ErrorMessage message={error || 'Property not found'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/properties')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
        <PropertyDetails property={property} />
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
