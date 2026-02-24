import { useEffect, useState } from 'react';
import PropertyCard from "./PropertyCard";
import { motion } from "framer-motion";
import LoadingSpinner from './shared/LoadingSpinner';
import * as propertyService from '@/services/propertyService';
import { Property } from '@/types/property.types';

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        // Fetch all properties and filter for approved ones
        const allProperties = await propertyService.getProperties();
        
        // Filter for approved properties and take first 3 for featured section
        const approvedProperties = allProperties.filter(
          property => property.verificationStatus === 'approved'
        );
        setProperties(approvedProperties.slice(0, 3));
      } catch (error) {
        console.error('Error fetching featured properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Our Listings</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading mt-2">
              Featured Properties
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              No properties available at the moment. Check back soon!
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Our Listings</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading mt-2">
            Featured Properties
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Handpicked premium properties verified by our expert agents
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, i) => (
            <PropertyCard 
              key={property.id} 
              property={property}
              index={i} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
