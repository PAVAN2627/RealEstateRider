/**
 * PropertyGallery Component
 * 
 * Displays property images in a carousel/gallery with navigation controls,
 * fullscreen view, lazy loading, and keyboard navigation support.
 * 
 * Requirements: 7.2, 22.4, 22.7
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '../ui/carousel';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { cn } from '../../lib/utils';

interface PropertyGalleryProps {
  imageUrls: string[];
  propertyTitle?: string;
}

/**
 * PropertyGallery Component
 * 
 * Features:
 * - Carousel display with current image
 * - Prev/next navigation buttons
 * - Thumbnail strip for quick navigation
 * - Fullscreen modal view
 * - Lazy loading for images
 * - Keyboard navigation (arrow keys, Escape)
 * - Image counter display
 * - Handles empty imageUrls array gracefully
 * 
 * Requirements:
 * - 7.2: Display property image gallery with navigation controls
 * - 22.4: Lazy-load images to improve initial page load performance
 * - 22.7: Optimize image sizes for web delivery
 */
export default function PropertyGallery({
  imageUrls,
  propertyTitle = 'Property',
}: PropertyGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  // Handle empty imageUrls array
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  // Update current slide index when carousel changes
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Keyboard navigation for fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFullscreenIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFullscreenIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, imageUrls.length]);

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  const handleFullscreenOpen = (index: number) => {
    setFullscreenIndex(index);
    setIsFullscreen(true);
  };

  const handlePrevFullscreen = () => {
    setFullscreenIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
  };

  const handleNextFullscreen = () => {
    setFullscreenIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Carousel */}
      <div className="relative">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {imageUrls.map((url, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={url}
                    alt={`${propertyTitle} - Image ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleFullscreenOpen(index)}
                  />
                  {/* Fullscreen button overlay */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                    onClick={() => handleFullscreenOpen(index)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Buttons */}
          {imageUrls.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white"
                onClick={() => api?.scrollPrev()}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Previous image</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white"
                onClick={() => api?.scrollNext()}
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Next image</span>
              </Button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {current + 1} / {imageUrls.length}
          </div>
        </Carousel>
      </div>

      {/* Thumbnail Strip */}
      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all',
                current === index
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 hover:border-gray-400'
              )}
            >
              <img
                src={url}
                alt={`Thumbnail ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close fullscreen</span>
            </Button>

            {/* Fullscreen Image */}
            <img
              src={imageUrls[fullscreenIndex]}
              alt={`${propertyTitle} - Image ${fullscreenIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Fullscreen Navigation */}
            {imageUrls.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 text-white hover:bg-white/20"
                  onClick={handlePrevFullscreen}
                >
                  <ChevronLeft className="h-8 w-8" />
                  <span className="sr-only">Previous image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 text-white hover:bg-white/20"
                  onClick={handleNextFullscreen}
                >
                  <ChevronRight className="h-8 w-8" />
                  <span className="sr-only">Next image</span>
                </Button>
              </>
            )}

            {/* Fullscreen Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
              {fullscreenIndex + 1} / {imageUrls.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
