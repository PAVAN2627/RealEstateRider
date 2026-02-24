import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Property } from "@/types/property.types";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const PropertyCard = ({ property, index = 0 }: PropertyCardProps) => {
  // Use first image or placeholder
  const image = property.imageUrls?.[0] || '/placeholder.svg';
  const location = `${property.location.city}, ${property.location.state}`;
  const price = `₹${(property.price / 10000000).toFixed(2)} Cr`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group rounded-2xl overflow-hidden bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden h-56">
        <img
          src={image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold gradient-primary text-primary-foreground capitalize">
            {property.propertyType}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
            Featured
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
          <MapPin className="w-3.5 h-3.5" />
          {location}
        </div>
        <h3 className="font-heading font-semibold text-lg text-card-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {property.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {property.description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xl font-bold text-primary font-heading">{price}</span>
          <Link 
            to={`/properties/${property.id}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
